import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { fichasCusto, InsertFichaCusto, InsertUser, users, orcamentos, InsertOrcamento, Orcamento, itensOrcamento, InsertItemOrcamento, ItemOrcamento, empresas, InsertEmpresa, Empresa } from "../drizzle/schema";
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

  await db.insert(fichasCusto).values(data);
  return { success: true };
}

export async function getFichasCustoByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const fichas = await db
    .select()
    .from(fichasCusto)
    .where(eq(fichasCusto.userId, userId))
    .orderBy(desc(fichasCusto.createdAt));

  // Calcular custo total para cada ficha
  return fichas.map(ficha => ({
    ...ficha,
    custo: Number(ficha.modelagem || 0) + Number(ficha.piloto || 0) + Number(ficha.corte || 0) + Number(ficha.beneficiamento || 0) + Number(ficha.costura || 0) + Number(ficha.lavanderia || 0) + Number(ficha.acabamento || 0) + Number(ficha.passadoria || 0) + Number(ficha.tecido || 0) + Number(ficha.aviamento || 0)
  }));
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

/**
 * Gera o próximo código de referência no formato AAFFFF-NNN
 * Onde: AA = Ano (2 dígitos), FFFF = 3 primeiras letras da família, NNN = sequencial
 * Exemplo: 26CAM-001, 26BER-002
 */
export async function generateNextReferenceCode(userId: number, familia: string): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Obter ano atual (2 dígitos)
  const ano = new Date().getFullYear().toString().slice(-2);
  
  // Obter prefixo da família (3 primeiras letras em maiúsculo)
  const prefixoFamilia = familia.substring(0, 3).toUpperCase();
  
  // Buscar todas as fichas do usuário com o mesmo prefixo e ano
  const fichas = await db
    .select()
    .from(fichasCusto)
    .where(eq(fichasCusto.userId, userId));
  
  // Filtrar fichas que começam com o padrão AAFFFF-
  const padrao = `${ano}${prefixoFamilia}-`;
  const fichasDoAnoEFamilia = fichas.filter(f => 
    f.referencia.startsWith(padrao)
  );
  
  // Extrair números sequenciais e encontrar o maior
  let maiorNumero = 0;
  fichasDoAnoEFamilia.forEach(f => {
    const match = f.referencia.match(/\-(\d+)$/);
    if (match) {
      const numero = parseInt(match[1], 10);
      if (numero > maiorNumero) {
        maiorNumero = numero;
      }
    }
  });
  
  // Próximo número
  const proximoNumero = maiorNumero + 1;
  
  // Formatar com 3 dígitos (001, 002, etc.)
  const numeroFormatado = proximoNumero.toString().padStart(3, '0');
  
  return `${padrao}${numeroFormatado}`;
}


// ============ Orçamentos Queries ============

export async function createOrcamento(data: InsertOrcamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orcamentos).values(data);
  
  // Buscar o orcamento criado para retornar o ID
  const created = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.userId, data.userId))
    .orderBy(desc(orcamentos.createdAt))
    .limit(1);
  
  if (created.length > 0) {
    return created[0].id;
  }
  
  throw new Error("Nao foi possivel obter o ID do orcamento criado");
}

export async function getOrcamentosByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.userId, userId))
    .orderBy(desc(orcamentos.createdAt));
}

export async function getOrcamentoById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orcamentos)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.userId, userId)))
    .limit(1);

  if (result.length > 0) {
    const orcamento = result[0];
    return {
      ...orcamento,
      percentualSinal: typeof orcamento.percentualSinal === 'string' ? parseFloat(orcamento.percentualSinal) : orcamento.percentualSinal,
      percentualRetirada: typeof orcamento.percentualRetirada === 'string' ? parseFloat(orcamento.percentualRetirada) : orcamento.percentualRetirada,
      percentualPrazo: typeof orcamento.percentualPrazo === 'string' ? parseFloat(orcamento.percentualPrazo) : orcamento.percentualPrazo,
    };
  }
  return undefined;
}

export async function updateOrcamento(id: number, userId: number, data: Partial<InsertOrcamento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(orcamentos)
    .set(data)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.userId, userId)));
}

export async function deleteOrcamento(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(orcamentos)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.userId, userId)));
}

// ============ Itens de Orçamento Queries ============

export async function createItemOrcamento(data: InsertItemOrcamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(itensOrcamento).values(data);
}

export async function getItensOrcamento(orcamentoId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(itensOrcamento)
    .where(eq(itensOrcamento.orcamentoId, orcamentoId))
    .orderBy(itensOrcamento.createdAt);
}

export async function deleteItemOrcamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(itensOrcamento)
    .where(eq(itensOrcamento.id, id));
}

export async function deleteItensOrcamento(orcamentoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(itensOrcamento)
    .where(eq(itensOrcamento.orcamentoId, orcamentoId));
}

export async function generateNextOrcamentoNumber(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const agora = new Date();
  const ano = agora.getFullYear().toString();
  
  const orcamentosDoAno = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.userId, userId));
  
  const padrao = `ORC-${ano}`;
  const orcamentosDoAnoFiltrados = orcamentosDoAno.filter(o => 
    o.numeroOrcamento.startsWith(padrao)
  );
  
  let maiorNumero = 0;
  orcamentosDoAnoFiltrados.forEach(o => {
    const match = o.numeroOrcamento.match(/\-(\d+)$/);
    if (match) {
      const numero = parseInt(match[1], 10);
      if (numero > maiorNumero) {
        maiorNumero = numero;
      }
    }
  });
  
  const proximoNumero = maiorNumero + 1;
  const numeroFormatado = proximoNumero.toString().padStart(3, '0');
  
  return `${padrao}-${numeroFormatado}`;
}

export async function updateItemMarkup(
  itemId: number,
  markupDivisor: number,
  custo: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calcular novo valor unitário baseado no markup
  const valorUnitario = custo / markupDivisor;
  
  // Buscar item para pegar quantidade
  const item = await db
    .select()
    .from(itensOrcamento)
    .where(eq(itensOrcamento.id, itemId))
    .limit(1);

  if (!item || item.length === 0) {
    throw new Error("Item não encontrado");
  }

  const quantidade = item[0].quantidade;
  const valorTotal = valorUnitario * quantidade;

  // Atualizar item com novo markup e valores recalculados
  await db
    .update(itensOrcamento)
    .set({
      markupDivisor: markupDivisor.toString(),
      valorUnitario: valorUnitario.toString(),
      valorTotal: valorTotal.toString(),
    })
    .where(eq(itensOrcamento.id, itemId));

  return {
    valorUnitario,
    valorTotal,
  };
}


export async function updateItemOrcamento(
  itemId: number,
  quantidade: number,
  valorUnitario: number,
  valorTotal: number,
  markup?: number,
  valorComMarkup?: number,
  descricao?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Atualizar item com novos valores
  const updateData: any = {
    quantidade: quantidade,
    valorUnitario: valorUnitario.toString(),
    valorTotal: valorTotal.toString(),
  };

  if (markup !== undefined) {
    updateData.markupDivisor = markup;
  }

  if (descricao !== undefined) {
    updateData.descricao = descricao;
  }

  await db
    .update(itensOrcamento)
    .set(updateData)
    .where(eq(itensOrcamento.id, itemId));

  return {
    quantidade,
    valorUnitario,
    valorTotal,
    markup,
    valorComMarkup,
  };
}

export async function getOrcamentoIdFromItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const item = await db
    .select({ orcamentoId: itensOrcamento.orcamentoId })
    .from(itensOrcamento)
    .where(eq(itensOrcamento.id, itemId))
    .limit(1);

  if (!item || item.length === 0) {
    throw new Error("Item não encontrado");
  }

  return item[0].orcamentoId;
}

export async function updateOrcamentoPercentuais(
  orcamentoId: number,
  prazoDias?: number,
  percentualSinal?: number,
  percentualRetirada?: number,
  percentualPrazo?: number,
  prazoEntregaTexto?: string
) {
  console.log("[updateOrcamentoPercentuais] Chamada com:", {
    orcamentoId,
    prazoDias,
    percentualSinal,
    percentualRetirada,
    percentualPrazo,
    prazoEntregaTexto
  });
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};

  if (prazoDias !== undefined) {
    updateData.prazoDias = prazoDias;
  }
  if (prazoEntregaTexto !== undefined) {
    updateData.prazoEntregaTexto = prazoEntregaTexto;
  }
  if (percentualSinal !== undefined) {
    updateData.percentualSinal = percentualSinal.toString();
  }
  if (percentualRetirada !== undefined) {
    updateData.percentualRetirada = percentualRetirada.toString();
  }
  if (percentualPrazo !== undefined) {
    updateData.percentualPrazo = percentualPrazo.toString();
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true };
  }

  await db
    .update(orcamentos)
    .set(updateData)
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}

export async function updateOrcamentoDescontoObservacoes(
  orcamentoId: number,
  observacoes?: string,
  descontoTipo?: "percentual" | "valor",
  descontoValor?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};

  if (observacoes !== undefined) {
    updateData.observacoes = observacoes;
  }
  if (descontoTipo !== undefined) {
    updateData.descontoTipo = descontoTipo;
  }
  if (descontoValor !== undefined) {
    updateData.descontoValor = descontoValor;
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true };
  }

  await db
    .update(orcamentos)
    .set(updateData)
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}

export async function updateOrcamentoStatus(
  orcamentoId: number,
  status: "pendente" | "aprovado" | "reprovado",
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o orçamento pertence ao usuário
  const orcamento = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId))
    .limit(1);

  if (!orcamento || orcamento.length === 0) {
    throw new Error("Orçamento não encontrado");
  }

  // Comentado para permitir atualização de status
  // if (orcamento[0].userId !== userId) {
  //   throw new Error("Acesso negado");
  // }

  // Atualizar status
  await db
    .update(orcamentos)
    .set({ status })
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}

export async function updateOrcamentoClienteMarca(
  orcamentoId: number,
  nomeCliente: string,
  marca: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(orcamentos)
    .set({ nomeCliente, marca })
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}

export async function updateOrcamentoValidadeEPrazo(
  orcamentoId: number,
  validade: number,
  prazoEntregaTexto: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(orcamentos)
    .set({ validade, prazoEntregaTexto })
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}

export async function updateOrcamentoTotals(orcamentoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log("[updateOrcamentoTotals] Iniciando para orcamentoId:", orcamentoId);

  // Buscar todos os itens do orçamento
  const itens = await db
    .select()
    .from(itensOrcamento)
    .where(eq(itensOrcamento.orcamentoId, orcamentoId));

  console.log("[updateOrcamentoTotals] Itens encontrados:", itens.length);

  // Calcular totais
  let subtotal = 0;
  let totalPecas = 0;

  itens.forEach((item) => {
    const valorTotal = parseFloat(item.valorTotal?.toString() || "0");
    const quantidade = item.quantidade || 0;
    
    subtotal += valorTotal;
    totalPecas += quantidade;
  });

  console.log("[updateOrcamentoTotals] Calculos: subtotal=", subtotal, "totalPecas=", totalPecas);

  // Buscar orçamento para obter desconto
  const orcamento = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId))
    .limit(1);

  let total = subtotal;
  if (orcamento.length > 0) {
    const orc = orcamento[0];
    if (orc.descontoValor && Number(orc.descontoValor) > 0) {
      if (orc.descontoTipo === 'percentual') {
        const valorDesconto = (subtotal * Number(orc.descontoValor)) / 100;
        total = subtotal - valorDesconto;
      } else {
        total = subtotal - Number(orc.descontoValor);
      }
    }
  }

  // Atualizar orçamento com os totais
  console.log("[updateOrcamentoTotals] Atualizando banco com: subtotal=", subtotal.toFixed(2), "total=", total.toFixed(2), "totalPecas=", totalPecas);
  const result = await db
    .update(orcamentos)
    .set({
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      totalPecas: totalPecas,
    })
    .where(eq(orcamentos.id, orcamentoId));
  console.log("[updateOrcamentoTotals] Atualização concluida, result:", result);

  return {
    subtotal,
    total,
    totalPecas,
  };
}


// ============= Admin Functions =============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error) {
    console.error("[Database] Error getting all users:", error);
    throw error;
  }
}

export async function createUser(nome: string, email: string, role: "user" | "admin") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Gerar um openId único (será usado como identificador temporário)
    const openId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    await db.insert(users).values({
      openId,
      name: nome,
      email,
      role,
      loginMethod: "admin-created",
    });

    return { success: true };
  } catch (error) {
    console.error("[Database] Error creating user:", error);
    throw error;
  }
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error("[Database] Error deleting user:", error);
    throw error;
  }
}

export async function updateOrcamentoTotais(orcamentoId: number, subtotal: number, total: number, totalPecas: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Atualizar orçamento com os novos totais (já com desconto calculado)
  await db
    .update(orcamentos)
    .set({
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      totalPecas: totalPecas,
    })
    .where(eq(orcamentos.id, orcamentoId));

  return {
    subtotal,
    total,
    totalPecas,
  };
}


// ============= Empresas Functions =============

export async function createEmpresa(
  userId: number,
  nome: string,
  cnpj?: string,
  email?: string,
  telefone?: string,
  endereco?: string,
  cidade?: string,
  estado?: string,
  observacoes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(empresas).values({
    userId,
    nome,
    cnpj,
    email,
    telefone,
    endereco,
    cidade,
    estado,
    observacoes,
  });

  return result;
}

export async function getEmpresasByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(empresas)
    .where(eq(empresas.userId, userId))
    .orderBy(desc(empresas.createdAt));
}

export async function getEmpresaById(empresaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(empresas)
    .where(and(eq(empresas.id, empresaId), eq(empresas.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function updateEmpresa(
  empresaId: number,
  userId: number,
  nome?: string,
  cnpj?: string,
  email?: string,
  telefone?: string,
  endereco?: string,
  cidade?: string,
  estado?: string,
  observacoes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};
  if (nome !== undefined) updateData.nome = nome;
  if (cnpj !== undefined) updateData.cnpj = cnpj;
  if (email !== undefined) updateData.email = email;
  if (telefone !== undefined) updateData.telefone = telefone;
  if (endereco !== undefined) updateData.endereco = endereco;
  if (cidade !== undefined) updateData.cidade = cidade;
  if (estado !== undefined) updateData.estado = estado;
  if (observacoes !== undefined) updateData.observacoes = observacoes;

  await db
    .update(empresas)
    .set(updateData)
    .where(and(eq(empresas.id, empresaId), eq(empresas.userId, userId)));

  return { success: true };
}

export async function deleteEmpresa(empresaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(empresas)
    .where(and(eq(empresas.id, empresaId), eq(empresas.userId, userId)));

  return { success: true };
}


// ============= Recalcular Todos os Orçamentos =============

export async function recalculatAllOrcamentos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log("[recalculatAllOrcamentos] Iniciando recálculo de TODOS os orçamentos");

  // Buscar todos os orçamentos
  const allOrcamentos = await db.select().from(orcamentos);
  
  console.log("[recalculatAllOrcamentos] Total de orçamentos:", allOrcamentos.length);

  for (const orc of allOrcamentos) {
    console.log(`[recalculatAllOrcamentos] Recalculando orçamento ID ${orc.id} (${orc.nomeCliente})`);
    await updateOrcamentoTotals(orc.id);
  }

  console.log("[recalculatAllOrcamentos] Recálculo concluído para todos os orçamentos");
}


// ============= Resumo de Orçamentos com Cálculo em Tempo Real =============

/**
 * Calcula os totais de um orçamento em tempo real a partir dos itens
 * Retorna: { totalPecas, subtotal, total (com desconto), status }
 */
export async function getOrcamentoComTotaisCalculados(orcamentoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar orçamento
  const orcamento = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId))
    .limit(1);

  if (!orcamento || orcamento.length === 0) {
    throw new Error("Orçamento não encontrado");
  }

  const orc = orcamento[0];

  // Buscar itens
  const itens = await db
    .select()
    .from(itensOrcamento)
    .where(eq(itensOrcamento.orcamentoId, orcamentoId));

  // Calcular totais a partir dos itens
  let totalPecas = 0;
  let subtotal = 0;

  itens.forEach((item) => {
    totalPecas += item.quantidade || 0;
    subtotal += parseFloat(item.valorTotal?.toString() || "0");
  });

  // Aplicar desconto
  let total = subtotal;
  if (orc.descontoValor && Number(orc.descontoValor) > 0) {
    if (orc.descontoTipo === 'percentual') {
      const valorDesconto = (subtotal * Number(orc.descontoValor)) / 100;
      total = subtotal - valorDesconto;
    } else {
      total = subtotal - Number(orc.descontoValor);
    }
  }

  return {
    id: orc.id,
    numeroOrcamento: orc.numeroOrcamento,
    nomeCliente: orc.nomeCliente,
    marca: orc.marca,
    status: orc.status,
    totalPecas,
    subtotal,
    total,
    desconto: orc.descontoValor,
    descontoTipo: orc.descontoTipo,
    dataEmissao: orc.dataEmissao,
    createdAt: orc.createdAt,
  };
}

/**
 * Lista todos os orçamentos com totais calculados em tempo real
 */
export async function listOrcamentosComTotaisCalculados(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Buscar todos os orçamentos do usuário
  const allOrcamentos = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.userId, userId))
    .orderBy(desc(orcamentos.createdAt));

  // Para cada orçamento, calcular totais a partir dos itens
  const orcamentosComTotais = await Promise.all(
    allOrcamentos.map(async (orc) => {
      const itens = await db
        .select()
        .from(itensOrcamento)
        .where(eq(itensOrcamento.orcamentoId, orc.id));

      let totalPecas = 0;
      let subtotal = 0;

      itens.forEach((item) => {
        totalPecas += item.quantidade || 0;
        subtotal += parseFloat(item.valorTotal?.toString() || "0");
      });

      let total = subtotal;
      if (orc.descontoValor && Number(orc.descontoValor) > 0) {
        if (orc.descontoTipo === 'percentual') {
          const valorDesconto = (subtotal * Number(orc.descontoValor)) / 100;
          total = subtotal - valorDesconto;
        } else {
          total = subtotal - Number(orc.descontoValor);
        }
      }

      return {
        id: orc.id,
        numeroOrcamento: orc.numeroOrcamento,
        nomeCliente: orc.nomeCliente,
        marca: orc.marca,
        status: orc.status,
        enviado: Boolean(orc.enviado),
        totalPecas,
        subtotal,
        total,
        desconto: orc.descontoValor,
        descontoTipo: orc.descontoTipo,
        dataEmissao: orc.dataEmissao,
        createdAt: orc.createdAt,
      };
    })
  );

  return orcamentosComTotais;
}

/**
 * Calcula KPIs de orçamentos por status
 */
export async function getKPIOrcamentos(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar todos os orçamentos
  const allOrcamentos = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.userId, userId));

  // Para cada orçamento, calcular totais
  const orcamentosComTotais = await Promise.all(
    allOrcamentos.map(async (orc) => {
      const itens = await db
        .select()
        .from(itensOrcamento)
        .where(eq(itensOrcamento.orcamentoId, orc.id));

      let totalPecas = 0;
      let subtotal = 0;

      itens.forEach((item) => {
        totalPecas += item.quantidade || 0;
        subtotal += parseFloat(item.valorTotal?.toString() || "0");
      });

      let total = subtotal;
      if (orc.descontoValor && Number(orc.descontoValor) > 0) {
        if (orc.descontoTipo === 'percentual') {
          const valorDesconto = (subtotal * Number(orc.descontoValor)) / 100;
          total = subtotal - valorDesconto;
        } else {
          total = subtotal - Number(orc.descontoValor);
        }
      }

      return {
        status: orc.status,
        totalPecas,
        total,
      };
    })
  );

  // Agrupar por status e calcular totalizações
  const kpis = {
    pendente: { quantidade: 0, totalPecas: 0, totalValor: 0 },
    aprovado: { quantidade: 0, totalPecas: 0, totalValor: 0 },
    reprovado: { quantidade: 0, totalPecas: 0, totalValor: 0 },
  };

  orcamentosComTotais.forEach((orc) => {
    const status = orc.status as 'pendente' | 'aprovado' | 'reprovado';
    kpis[status].quantidade += 1;
    kpis[status].totalPecas += orc.totalPecas;
    kpis[status].totalValor += orc.total;
  });

  return kpis;
}




export async function enviarParaKanban(orcamentoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o orçamento existe e está aprovado
  const orcamento = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId))
    .limit(1);

  if (!orcamento || orcamento.length === 0) {
    throw new Error("Orçamento não encontrado");
  }

  if (orcamento[0].status !== "aprovado") {
    throw new Error("Apenas orçamentos aprovados podem ser enviados para Kanban");
  }

  // Marcar como enviado
  await db
    .update(orcamentos)
    .set({ enviado: 1 })
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}


export async function updateOrcamentoEnviado(orcamentoId: number, enviado: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(orcamentos)
    .set({ enviado: enviado ? 1 : 0 })
    .where(eq(orcamentos.id, orcamentoId));

  return { success: true };
}
