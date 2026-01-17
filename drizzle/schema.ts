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


/**
 * Orçamentos - Quotations/Budgets
 */
export const orcamentos = mysqlTable("orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  nomeCliente: varchar("nome_cliente", { length: 100 }).notNull(),
  marca: varchar("marca", { length: 100 }).notNull(),
  numeroOrcamento: varchar("numero_orcamento", { length: 50 }).notNull().unique(),
  dataEmissao: timestamp("data_emissao").defaultNow().notNull(),
  validade: int("validade").default(30).notNull(),
  prazoDias: int("prazo_dias").default(30).notNull(),
  
  totalPecas: int("total_pecas").default(0).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).default("0.00").notNull(),
  
  percentualSinal: decimal("percentual_sinal", { precision: 5, scale: 2 }).default("25.00").notNull(),
  percentualRetirada: decimal("percentual_retirada", { precision: 5, scale: 2 }).default("25.00").notNull(),
  percentualPrazo: decimal("percentual_prazo", { precision: 5, scale: 2 }).default("50.00").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;

/**
 * Itens de Orçamento - Quotation Items
 */
export const itensOrcamento = mysqlTable("itens_orcamento", {
  id: int("id").autoincrement().primaryKey(),
  orcamentoId: int("orcamento_id").notNull(),
  fichaId: int("ficha_id").notNull(),
  referencia: varchar("referencia", { length: 100 }).notNull(),
  descricao: text("descricao").notNull(),
  quantidade: int("quantidade").notNull(),
  custo: decimal("custo", { precision: 12, scale: 2 }).notNull(),
  valorUnitario: decimal("valor_unitario", { precision: 12, scale: 2 }).notNull(),
  valorTotal: decimal("valor_total", { precision: 12, scale: 2 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ItemOrcamento = typeof itensOrcamento.$inferSelect;
export type InsertItemOrcamento = typeof itensOrcamento.$inferInsert;
