import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// Funciones de consulta para Locales
// ============================================================

export async function getAllLocals() {
  const db = await getDb();
  if (!db) return [];
  const { locals } = await import("../drizzle/schema");
  return await db.select().from(locals);
}

export async function getLocalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { locals } = await import("../drizzle/schema");
  const result = await db.select().from(locals).where(eq(locals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocal(data: { name: string; address?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { locals } = await import("../drizzle/schema");
  const result = await db.insert(locals).values(data);
  return result;
}

// ============================================================
// Funciones de consulta para Informes (Reports)
// ============================================================

export async function getAllReports() {
  const db = await getDb();
  if (!db) return [];
  const { reports } = await import("../drizzle/schema");
  return await db.select().from(reports);
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { reports } = await import("../drizzle/schema");
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReportsByLocalId(localId: number) {
  const db = await getDb();
  if (!db) return [];
  const { reports } = await import("../drizzle/schema");
  return await db.select().from(reports).where(eq(reports.localId, localId));
}

export async function createReport(data: {
  localId: number;
  userId: number;
  reportDate: Date;
  inputType: "text" | "pdf" | "excel";
  rawContent?: string;
  fileUrl?: string;
  fileName?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { reports } = await import("../drizzle/schema");
  const result = await db.insert(reports).values(data);
  return result;
}

// ============================================================
// Funciones de consulta para Puntuaciones (Scores)
// ============================================================

export async function getScoreByReportId(reportId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { scores } = await import("../drizzle/schema");
  const result = await db.select().from(scores).where(eq(scores.reportId, reportId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createScore(data: {
  reportId: number;
  autoScore?: number;
  finalScore?: number;
  criteriaScores?: string;
  aiSource?: string;
  isOverridden?: number;
  overrideReason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { scores } = await import("../drizzle/schema");
  const result = await db.insert(scores).values(data);
  return result;
}

export async function updateScore(reportId: number, data: {
  finalScore?: number;
  isOverridden?: number;
  overrideReason?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { scores } = await import("../drizzle/schema");
  const result = await db.update(scores).set(data).where(eq(scores.reportId, reportId));
  return result;
}

// ============================================================
// Funciones de consulta para Audit Log
// ============================================================

export async function createAuditLog(data: {
  reportId?: number;
  userId?: number;
  action: string;
  details?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { auditLog } = await import("../drizzle/schema");
  const result = await db.insert(auditLog).values(data);
  return result;
}

// ============================================================
// Funciones de consulta para Ranking y Estadísticas
// ============================================================

export async function getLocalWithScores(localId: number) {
  const db = await getDb();
  if (!db) return null;
  const { locals, reports, scores } = await import("../drizzle/schema");
  
  // Obtener el local
  const localResult = await db.select().from(locals).where(eq(locals.id, localId)).limit(1);
  if (localResult.length === 0) return null;
  const local = localResult[0];
  
  // Obtener todos los informes del local con sus puntuaciones
  const reportsWithScores = await db
    .select({
      report: reports,
      score: scores,
    })
    .from(reports)
    .leftJoin(scores, eq(reports.id, scores.reportId))
    .where(eq(reports.localId, localId));
  
  return {
    local,
    reports: reportsWithScores,
  };
}

export async function getAllLocalsWithScores() {
  const db = await getDb();
  if (!db) return [];
  const { locals, reports, scores } = await import("../drizzle/schema");
  
  // Obtener todos los locales
  const allLocals = await db.select().from(locals);
  
  // Para cada local, obtener sus informes y puntuaciones
  const localsWithScores = await Promise.all(
    allLocals.map(async (local) => {
      const reportsWithScores = await db
        .select({
          report: reports,
          score: scores,
        })
        .from(reports)
        .leftJoin(scores, eq(reports.id, scores.reportId))
        .where(eq(reports.localId, local.id));
      
      // Calcular promedio de puntuaciones
      const validScores = reportsWithScores
        .filter((r) => r.score && r.score.finalScore !== null)
        .map((r) => r.score!.finalScore!);
      
      const avgScore = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;
      
      return {
        local,
        reportsCount: reportsWithScores.length,
        avgScore,
        lastScore: validScores.length > 0 ? validScores[validScores.length - 1] : 0,
      };
    })
  );
  
  return localsWithScores;
}
