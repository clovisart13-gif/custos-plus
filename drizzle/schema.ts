import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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
 * Fichas de Custo - Cost Sheets for production references
 */
export const fichasCusto = mysqlTable("fichas_custo", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  referencia: varchar("referencia", { length: 100 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  familia: varchar("familia", { length: 50 }).notNull(),
  cliente: varchar("cliente", { length: 100 }).notNull(),
  fotoUrl: text("foto_url"),
  
  // Custos de Mão-de-Obra (8 etapas)
  modelagem: decimal("modelagem", { precision: 10, scale: 2 }).default("0.00").notNull(),
  piloto: decimal("piloto", { precision: 10, scale: 2 }).default("0.00").notNull(),
  corte: decimal("corte", { precision: 10, scale: 2 }).default("0.00").notNull(),
  beneficiamento: decimal("beneficiamento", { precision: 10, scale: 2 }).default("0.00").notNull(),
  costura: decimal("costura", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lavanderia: decimal("lavanderia", { precision: 10, scale: 2 }).default("0.00").notNull(),
  acabamento: decimal("acabamento", { precision: 10, scale: 2 }).default("0.00").notNull(),
  passadoria: decimal("passadoria", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Custos de Matéria-Prima
  tecido: decimal("tecido", { precision: 10, scale: 2 }).default("0.00").notNull(),
  aviamento: decimal("aviamento", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FichaCusto = typeof fichasCusto.$inferSelect;
export type InsertFichaCusto = typeof fichasCusto.$inferInsert;
