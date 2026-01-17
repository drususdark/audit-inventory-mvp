import { z } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";
import { createContext } from "./context";
import {
  getAllLocals,
  getLocalById,
  createLocal,
  getAllReports,
  getReportsByLocalId,
  getReportById,
  createReport,
  getAllScores,
  getScoreByReportId,
  createScore,
} from "./db";
import { storagePut } from "./storage";

const t = initTRPC.context<typeof createContext>().create();
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure;

// Helper to parse percentage from report text
function parsePercentage(text: string, label: string): number | null {
  const regex = new RegExp(`${label}\\s*:?\\s*(\\d+(?:\\.\\d+)?)%`, "i");
  const match = regex.exec(text);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

// Analyze report text and compute scores for each criterion
function analyzeReport(text: string) {
  const criteriaConfigs = [
    { key: "accuracy", name: "Exactitud de inventario", weight: 30, value: parsePercentage(text, "exactitud") ?? 100 },
    { key: "missing", name: "Faltantes", weight: 25, value: parsePercentage(text, "faltantes") ?? 0 },
    { key: "procedures", name: "Procedimientos", weight: 20, value: parsePercentage(text, "procedimientos") ?? 100 },
    { key: "organization", name: "Organización", weight: 10, value: parsePercentage(text, "organizacion") ?? 100 },
    { key: "expiry", name: "Vencidos", weight: 10, value: parsePercentage(text, "vencidos") ?? 0 },
    { key: "clarity", name: "Claridad", weight: 5, value: parsePercentage(text, "claridad") ?? 100 },
  ];

  let autoScore = 0;
  const criteriaScores: Record<string, { weight: number; score: number; justification: string }> = {};
  for (const cfg of criteriaConfigs) {
    let score: number;
    if (cfg.key === "missing" || cfg.key === "expiry") {
      score = Math.max(0, Math.min(100, 100 - cfg.value));
    } else {
      score = Math.max(0, Math.min(100, cfg.value));
    }
    autoScore += (score * cfg.weight) / 100;
    criteriaScores[cfg.key] = {
      weight: cfg.weight,
      score,
      justification: `La puntuación para ${cfg.name} se calculó como ${score.toFixed(2)}.`,
    };
  }
  autoScore = parseFloat(autoScore.toFixed(2));
  return {
    autoScore,
    finalScore: autoScore,
    criteriaScores,
    aiSource: "heuristic",
  };
}

export const appRouter = t.router({
  locals: t.router({
    list: publicProcedure.query(async () => {
      return await getAllLocals();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getLocalById(input.id);
    }),
    create: protectedProcedure.input(z.object({ name: z.string(), address: z.string() })).mutation(async ({ input }) => {
      return await createLocal(input);
    }),
  }),
  reports: t.router({
    list: publicProcedure.query(async () => {
      return await getAllReports();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getReportById(input.id);
    }),
    getByLocalId: publicProcedure.input(z.object({ localId: z.number() })).query(async ({ input }) => {
      return await getReportsByLocalId(input.localId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          localId: z.number(),
          date: z.string(),
          text: z.string().optional(),
          fileName: z.string().optional(),
          fileData: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { localId, date, text, fileName, fileData } = input;
        if (!text && !fileData) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Debe proporcionar texto o archivo" });
        }
        let fileUrl: string | null = null;
        if (fileName && fileData) {
          const buffer = Buffer.from(fileData, "base64");
          const path = `reports/${Date.now()}-${fileName}`;
          fileUrl = await storagePut(path, buffer);
        }
        const report = await createReport({
          localId,
          date,
          rawContent: text ?? null,
          fileUrl,
        });
        const analysisText = text ?? "";
        const { autoScore, finalScore, criteriaScores, aiSource } = analyzeReport(analysisText);
        await createScore({
          reportId: report.id,
          autoScore,
          finalScore,
          criteriaScores,
          aiSource,
        });
        return report;
      }),
  }),
  scores: t.router({
    getByReportId: publicProcedure.input(z.object({ reportId: z.number() })).query(async ({ input }) => {
      return await getScoreByReportId(input.reportId);
    }),
    list: publicProcedure.query(async () => {
      return await getAllScores();
    }),
  }),
});

export type AppRouter = typeof appRouter;
