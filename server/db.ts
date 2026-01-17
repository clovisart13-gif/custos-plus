import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { fichasCusto, InsertFichaCusto, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// ============ Fichas de Custo Queries ============

export async function createFichaCusto(data: InsertFichaCusto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fichasCusto).values(data);
  return result;
}

export async function getFichasCustoByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(fichasCusto)
    .where(eq(fichasCusto.userId, userId))
    .orderBy(desc(fichasCusto.createdAt));
}

export async function getFichaCustoById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(fichasCusto)
    .where(and(eq(fichasCusto.id, id), eq(fichasCusto.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateFichaCusto(id: number, userId: number, data: Partial<InsertFichaCusto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(fichasCusto)
    .set(data)
    .where(and(eq(fichasCusto.id, id), eq(fichasCusto.userId, userId)));
}

export async function deleteFichaCusto(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(fichasCusto)
    .where(and(eq(fichasCusto.id, id), eq(fichasCusto.userId, userId)));
}

export interface FichasCustoFilters {
  userId: number;
  tipo?: string;
  familia?: string;
  cliente?: string;
  search?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export async function getFichasCustoFiltered(filters: FichasCustoFilters) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(fichasCusto.userId, filters.userId)];

  if (filters.tipo) {
    conditions.push(eq(fichasCusto.tipo, filters.tipo));
  }
  if (filters.familia) {
    conditions.push(eq(fichasCusto.familia, filters.familia));
  }
  if (filters.cliente) {
    conditions.push(eq(fichasCusto.cliente, filters.cliente));
  }
  if (filters.search) {
    conditions.push(like(fichasCusto.referencia, `%${filters.search}%`));
  }
  if (filters.dataInicio) {
    conditions.push(gte(fichasCusto.createdAt, filters.dataInicio));
  }
  if (filters.dataFim) {
    conditions.push(lte(fichasCusto.createdAt, filters.dataFim));
  }

  return await db
    .select()
    .from(fichasCusto)
    .where(and(...conditions))
    .orderBy(desc(fichasCusto.createdAt));
}

export async function getDistinctValues(userId: number, field: 'tipo' | 'familia' | 'cliente') {
  const db = await getDb();
  if (!db) return [];

  const column = fichasCusto[field];
  const result = await db
    .selectDistinct({ value: column })
    .from(fichasCusto)
    .where(eq(fichasCusto.userId, userId))
    .orderBy(column);

  return result.map(r => r.value);
}

export async function getKPIs(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const fichas = await db
    .select()
    .from(fichasCusto)
    .where(eq(fichasCusto.userId, userId));

  if (fichas.length === 0) {
    return {
      totalReferencias: 0,
      custoMedioGeral: 0,
      familiaMaisCara: null,
      familiaMaisBarata: null,
    };
  }

  // Calcular custo total de cada ficha
  const fichasComTotal = fichas.map(f => ({
    ...f,
    total: Number(f.modelagem) + Number(f.piloto) + Number(f.corte) + 
           Number(f.beneficiamento) + Number(f.costura) + Number(f.lavanderia) + 
           Number(f.acabamento) + Number(f.passadoria) + Number(f.tecido) + Number(f.aviamento)
  }));

  const custoMedioGeral = fichasComTotal.reduce((sum, f) => sum + f.total, 0) / fichas.length;

  // Agrupar por família
  const familiaMap = new Map<string, number[]>();
  fichasComTotal.forEach(f => {
    if (!familiaMap.has(f.familia)) {
      familiaMap.set(f.familia, []);
    }
    familiaMap.get(f.familia)!.push(f.total);
  });

  const familiaMedias = Array.from(familiaMap.entries()).map(([familia, custos]) => ({
    familia,
    media: custos.reduce((sum, c) => sum + c, 0) / custos.length
  }));

  familiaMedias.sort((a, b) => b.media - a.media);

  return {
    totalReferencias: fichas.length,
    custoMedioGeral,
    familiaMaisCara: familiaMedias[0]?.familia || null,
    familiaMaisBarata: familiaMedias[familiaMedias.length - 1]?.familia || null,
  };
}

export async function getCustosMediosPorFamilia(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const fichas = await db
    .select()
    .from(fichasCusto)
    .where(eq(fichasCusto.userId, userId));

  const familiaMap = new Map<string, typeof fichas>();
  fichas.forEach(f => {
    if (!familiaMap.has(f.familia)) {
      familiaMap.set(f.familia, []);
    }
    familiaMap.get(f.familia)!.push(f);
  });

  return Array.from(familiaMap.entries()).map(([familia, items]) => {
    const count = items.length;
    const somas = {
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
    };

    items.forEach(item => {
      somas.modelagem += Number(item.modelagem);
      somas.piloto += Number(item.piloto);
      somas.corte += Number(item.corte);
      somas.beneficiamento += Number(item.beneficiamento);
      somas.costura += Number(item.costura);
      somas.lavanderia += Number(item.lavanderia);
      somas.acabamento += Number(item.acabamento);
      somas.passadoria += Number(item.passadoria);
      somas.tecido += Number(item.tecido);
      somas.aviamento += Number(item.aviamento);
    });

    const medias = {
      familia,
      quantidade: count,
      modelagem: somas.modelagem / count,
      piloto: somas.piloto / count,
      corte: somas.corte / count,
      beneficiamento: somas.beneficiamento / count,
      costura: somas.costura / count,
      lavanderia: somas.lavanderia / count,
      acabamento: somas.acabamento / count,
      passadoria: somas.passadoria / count,
      tecido: somas.tecido / count,
      aviamento: somas.aviamento / count,
    };

    const totalMedio = Object.entries(medias)
      .filter(([key]) => key !== 'familia' && key !== 'quantidade')
      .reduce((sum, [_, value]) => sum + (value as number), 0);

    return {
      ...medias,
      totalMedio,
    };
  });
}
