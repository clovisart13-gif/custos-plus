import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("fichasCusto.create", () => {
  it("should create a new ficha de custo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fichasCusto.create({
      referencia: "TEST-001",
      tipo: "Malha",
      familia: "Camiseta",
      cliente: "Cliente Teste",
      modelagem: 10,
      piloto: 20,
      corte: 5,
      beneficiamento: 8,
      costura: 15,
      lavanderia: 12,
      acabamento: 6,
      passadoria: 4,
      tecido: 50,
      aviamento: 10,
      observacoes: "Teste de criação",
    });

    expect(result).toEqual({ success: true });
  });

  it("should fail without required fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.fichasCusto.create({
        referencia: "",
        tipo: "",
        familia: "",
        cliente: "",
        modelagem: 0,
        piloto: 0,
        corte: 0,
        beneficiamento: 0,
        costura: 0,
        lavanderia: 0,
        acabamento: 0,
        passadoria: 0,
        tecido: 0,
        aviamento: 0,
      })
    ).rejects.toThrow();
  });
});

describe("fichasCusto.list", () => {
  it("should return empty array for user without fichas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fichasCusto.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("dashboard.kpis", () => {
  it("should return KPIs structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.kpis();

    expect(result).toHaveProperty("totalReferencias");
    expect(result).toHaveProperty("custoMedioGeral");
    expect(result).toHaveProperty("familiaMaisCara");
    expect(result).toHaveProperty("familiaMaisBarata");
  });

  it("should return valid KPI values", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.kpis();

    expect(result?.totalReferencias).toBeGreaterThanOrEqual(0);
    expect(result?.custoMedioGeral).toBeGreaterThanOrEqual(0);
  });
});

describe("dashboard.custosMediosPorFamilia", () => {
  it("should return array of custos medios", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.custosMediosPorFamilia();

    expect(Array.isArray(result)).toBe(true);
  });
});
