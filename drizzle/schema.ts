import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabla de locales (tiendas/sucursales) que son auditados.
 */
export const locals = mysqlTable("locals", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Local = typeof locals.$inferSelect;
export type InsertLocal = typeof locals.$inferInsert;

/**
 * Tabla de informes de inventario subidos por el auditor.
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  localId: int("localId").notNull(),
  userId: int("userId").notNull(),
  reportDate: timestamp("reportDate").notNull(),
  inputType: mysqlEnum("inputType", ["text", "pdf", "excel"]).notNull(),
  rawContent: text("rawContent"),
  fileUrl: text("fileUrl"),
  fileName: varchar("fileName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Tabla de puntuaciones (scores) asignadas a cada informe.
 * Incluye la versión automática (de la IA) y la versión final (tras override humano).
 */
export const scores = mysqlTable("scores", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull().unique(),
  autoScore: int("autoScore"),
  finalScore: int("finalScore"),
  criteriaScores: text("criteriaScores"),
  aiSource: varchar("aiSource", { length: 64 }),
  isOverridden: int("isOverridden").default(0).notNull(),
  overrideReason: text("overrideReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;

/**
 * Tabla de auditoría (audit trail) que registra cambios y eventos importantes.
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId"),
  userId: int("userId"),
  action: varchar("action", { length: 64 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;