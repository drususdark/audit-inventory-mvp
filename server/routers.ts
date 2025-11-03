import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

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
  }),
});

export type AppRouter = typeof appRouter;
