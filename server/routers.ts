import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  // Auth routers removed - app is now public without authentication

  // ============================================================
  // Router de Locales
  // ============================================================
  locals: router({
    list: publicProcedure.query(async () => {
      const { getAllLocals } = await import("./db");
      return await getAllLocals();
    }),
    getById: publicProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("id" in val)) {
        throw new Error("Invalid input: expected object with id");
      }
      const { id } = val as { id: unknown };
      if (typeof id !== "number") {
        throw new Error("Invalid input: id must be a number");
      }
      return { id };
    }).query(async ({ input }) => {
      const { getLocalById } = await import("./db");
      return await getLocalById(input.id);
    }),
    create: protectedProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("name" in val)) {
        throw new Error("Invalid input: expected object with name");
      }
      const { name, address } = val as { name: unknown; address?: unknown };
      if (typeof name !== "string") {
        throw new Error("Invalid input: name must be a string");
      }
      if (address !== undefined && typeof address !== "string") {
        throw new Error("Invalid input: address must be a string");
      }
      return { name, address };
    }).mutation(async ({ input }) => {
      const { createLocal } = await import("./db");
      await createLocal(input);
      return { success: true };
    }),
  }),

  // ============================================================
  // Router de Informes (Reports)
  // ============================================================
  reports: router({
    list: publicProcedure.query(async () => {
      const { getAllReports } = await import("./db");
      return await getAllReports();
    }),
    getById: publicProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("id" in val)) {
        throw new Error("Invalid input: expected object with id");
      }
      const { id } = val as { id: unknown };
      if (typeof id !== "number") {
        throw new Error("Invalid input: id must be a number");
      }
      return { id };
    }).query(async ({ input }) => {
      const { getReportById } = await import("./db");
      return await getReportById(input.id);
    }),
    getByLocalId: publicProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("localId" in val)) {
        throw new Error("Invalid input: expected object with localId");
      }
      const { localId } = val as { localId: unknown };
      if (typeof localId !== "number") {
        throw new Error("Invalid input: localId must be a number");
      }
      return { localId };
    }).query(async ({ input }) => {
      const { getReportsByLocalId } = await import("./db");
      return await getReportsByLocalId(input.localId);
    }),
  }),

  // ============================================================
  // Router de Puntuaciones (Scores)
  // ============================================================
  scores: router({
    getByReportId: publicProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("reportId" in val)) {
        throw new Error("Invalid input: expected object with reportId");
      }
      const { reportId } = val as { reportId: unknown };
      if (typeof reportId !== "number") {
        throw new Error("Invalid input: reportId must be a number");
      }
      return { reportId };
    }).query(async ({ input }) => {
      const { getScoreByReportId } = await import("./db");
      return await getScoreByReportId(input.reportId);
    }),
    override: protectedProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("reportId" in val) || !("finalScore" in val)) {
        throw new Error("Invalid input: expected object with reportId and finalScore");
      }
      const { reportId, finalScore, overrideReason } = val as { reportId: unknown; finalScore: unknown; overrideReason?: unknown };
      if (typeof reportId !== "number" || typeof finalScore !== "number") {
        throw new Error("Invalid input: reportId and finalScore must be numbers");
      }
      if (overrideReason !== undefined && typeof overrideReason !== "string") {
        throw new Error("Invalid input: overrideReason must be a string");
      }
      return { reportId, finalScore, overrideReason };
    }).mutation(async ({ input, ctx }) => {
      const { updateScore, createAuditLog } = await import("./db");
      await updateScore(input.reportId, {
        finalScore: input.finalScore,
        isOverridden: 1,
        overrideReason: input.overrideReason,
      });
      await createAuditLog({
        reportId: input.reportId,
        userId: ctx.user?.id,
        action: "SCORE_OVERRIDE",
        details: `Puntuación modificada a ${input.finalScore}. Razón: ${input.overrideReason || "No especificada"}`,
      });
      return { success: true };
    }),
  }),

  // ============================================================
  // Router de Ranking
  // ============================================================
  ranking: router({
    getAll: publicProcedure.query(async () => {
      const { getAllLocalsWithScores } = await import("./db");
      const localsWithScores = await getAllLocalsWithScores();
      // Ordenar por puntuación promedio descendente
      return localsWithScores.sort((a, b) => b.avgScore - a.avgScore);
    }),
    getByLocal: publicProcedure.input((val: unknown) => {
      if (typeof val !== "object" || val === null || !("localId" in val)) {
        throw new Error("Invalid input: expected object with localId");
      }
      const { localId } = val as { localId: unknown };
      if (typeof localId !== "number") {
        throw new Error("Invalid input: localId must be a number");
      }
      return { localId };
    }).query(async ({ input }) => {
      const { getLocalWithScores } = await import("./db");
      return await getLocalWithScores(input.localId);
    }),
  }),
});

export type AppRouter = typeof appRouter;
