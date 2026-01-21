import { z } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";
import { createContext } from "./_core/context";
import type { TrpcContext } from "./_core/context";
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

const t = initTRPC.context<TrpcContext>().create();
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
      try {
        const locals = await getAllLocals();
        return locals || [];
      } catch (error) {
        console.error("Error fetching locals:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener locales",
        });
      }
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getLocalById(input.id);
        } catch (error) {
          console.error("Error fetching local:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener local",
          });
        }
      }),
    create: publicProcedure
      .input(z.object({ name: z.string(), address: z.string().optional() }))
      .mutation(async ({ input }) => {
        try {
          const result = await createLocal(input);
          if (!result) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al crear local",
            });
          }
          return result;
        } catch (error) {
          console.error("Error creating local:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Error al crear local",
          });
        }
      }),
  }),
  reports: t.router({
    list: publicProcedure.query(async () => {
      try {
        const reports = await getAllReports();
        return reports || [];
      } catch (error) {
        console.error("Error fetching reports:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener reportes",
        });
      }
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getReportById(input.id);
        } catch (error) {
          console.error("Error fetching report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener reporte",
          });
        }
      }),
    getByLocalId: publicProcedure
      .input(z.object({ localId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getReportsByLocalId(input.localId);
        } catch (error) {
          console.error("Error fetching reports by local:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener reportes",
          });
        }
      }),
    create: publicProcedure
      .input(
        z.object({
          localId: z.number(),
          date: z.string(),
          text: z.string().optional(),
          fileName: z.string().optional(),
          fileData: z.string().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { localId, date, text, fileName, fileData } = input;
        try {
          if (!text && !fileData) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Debe proporcionar texto o archivo" });
          }
          let fileUrl: string | null = null;
          let inputType: "text" | "pdf" | "excel" = "text";
          if (fileName && fileData) {
            const buffer = Buffer.from(fileData, "base64");
            const path = `reports/${Date.now()}-${fileName}`;
            const uploadResult = await storagePut(path, buffer);
            fileUrl = uploadResult.url;
            // Determine input type from file extension
            if (fileName.endsWith(".pdf")) inputType = "pdf";
            else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) inputType = "excel";
          }
          const reportDate = new Date(date);
          const userId = ctx.user?.id ?? 0;
          const report = await createReport({
            localId,
            userId,
            reportDate,
            inputType,
            rawContent: text ?? null,
            fileUrl,
            fileName: fileName ?? null,
          });
          if (!report) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el informe" });
          }
          const analysisText = text ?? "";
          const { autoScore, finalScore, criteriaScores, aiSource } = analyzeReport(analysisText);
          await createScore({
            reportId: report.id,
            autoScore,
            finalScore,
            criteriaScores: JSON.stringify(criteriaScores),
            aiSource,
          });
          return report;
        } catch (error) {
          console.error("Error creating report:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Error al crear el informe",
          });
        }
      }),
  }),
  scores: t.router({
    getByReportId: publicProcedure
      .input(z.object({ reportId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getScoreByReportId(input.reportId);
        } catch (error) {
          console.error("Error fetching score:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener puntuación",
          });
        }
      }),
    list: publicProcedure.query(async () => {
      try {
        const scores = await getAllScores();
        return scores || [];
      } catch (error) {
        console.error("Error fetching scores:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener puntuaciones",
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
