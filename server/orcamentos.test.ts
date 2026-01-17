import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import type { InsertOrcamento, InsertItemOrcamento } from "../drizzle/schema";

describe("Orcamentos", () => {
  let testOrcamentoId: number;
  const testUserId = 1;

  beforeAll(async () => {
    // Criar um orçamento de teste
    const result = await db.createOrcamento({
      userId: testUserId,
      nomeCliente: "Cliente Teste",
      marca: "Marca Teste",
      numeroOrcamento: "ORÇ-26-001",
    });
    
    if (result && result[0]) {
      testOrcamentoId = result[0].insertId as number;
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testOrcamentoId) {
      try {
        await db.deleteItensOrcamento(testOrcamentoId);
        await db.deleteOrcamento(testOrcamentoId, testUserId);
      } catch (error) {
        console.error("Erro ao limpar dados de teste:", error);
      }
    }
  });

  it("deve criar um orçamento", async () => {
    const timestamp = Date.now();
    const result = await db.createOrcamento({
      userId: testUserId,
      nomeCliente: "Novo Cliente",
      marca: "Nova Marca",
      numeroOrcamento: `ORÇ-26-${timestamp}`,
    });

    expect(result).toBeDefined();
  });

  it("deve listar orçamentos por usuário", async () => {
    const orcamentos = await db.getOrcamentosByUser(testUserId);
    expect(Array.isArray(orcamentos)).toBe(true);
    expect(orcamentos.length).toBeGreaterThan(0);
  });

  it("deve obter orçamento por ID", async () => {
    if (!testOrcamentoId) {
      console.warn("testOrcamentoId não definido, pulando teste");
      return;
    }

    const orcamento = await db.getOrcamentoById(testOrcamentoId, testUserId);
    expect(orcamento).toBeDefined();
    expect(orcamento?.nomeCliente).toBe("Cliente Teste");
  });

  it("deve gerar próximo número de orçamento", async () => {
    const numero = await db.generateNextOrcamentoNumber(testUserId);
    expect(numero).toBeDefined();
    expect(numero).toMatch(/^ORÇ-\d{2}-/);
  });

  it("deve criar item de orçamento", async () => {
    if (!testOrcamentoId) {
      console.warn("testOrcamentoId não definido, pulando teste");
      return;
    }

    const result = await db.createItemOrcamento({
      orcamentoId: testOrcamentoId,
      fichaId: 1,
      referencia: "26CAM-001",
      descricao: "Camiseta",
      quantidade: 100,
      custo: "50.00",
      valorUnitario: "125.00",
      valorTotal: "12500.00",
    });

    expect(result).toBeDefined();
  });

  it("deve listar itens de orçamento", async () => {
    if (!testOrcamentoId) {
      console.warn("testOrcamentoId não definido, pulando teste");
      return;
    }

    const itens = await db.getItensOrcamento(testOrcamentoId);
    expect(Array.isArray(itens)).toBe(true);
  });

  it("deve deletar orçamento", async () => {
    // Criar um orçamento temporário para deletar
    const timestamp = Date.now();
    const result = await db.createOrcamento({
      userId: testUserId,
      nomeCliente: "Cliente para Deletar",
      marca: "Marca para Deletar",
      numeroOrcamento: `ORÇ-26-${timestamp}-del`,
    });

    if (result && result[0]) {
      const tempId = result[0].insertId as number;
      await db.deleteOrcamento(tempId, testUserId);

      // Verificar se foi deletado
      const orcamento = await db.getOrcamentoById(tempId, testUserId);
      expect(orcamento).toBeUndefined();
    }
  });
});
