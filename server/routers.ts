import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

const fichaCustoSchema = z.object({
  referencia: z.string().min(1, "Referência é obrigatória"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  familia: z.string().min(1, "Família é obrigatória"),
  cliente: z.string().min(1, "Cliente é obrigatório"),
  fotoUrl: z.string().optional(),
  modelagem: z.number().min(0).default(0),
  piloto: z.number().min(0).default(0),
  corte: z.number().min(0).default(0),
  beneficiamento: z.number().min(0).default(0),
  costura: z.number().min(0).default(0),
  lavanderia: z.number().min(0).default(0),
  acabamento: z.number().min(0).default(0),
  passadoria: z.number().min(0).default(0),
  tecido: z.number().min(0).default(0),
  aviamento: z.number().min(0).default(0),
  observacoes: z.string().optional(),
});

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

  fichasCusto: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFichasCustoByUser(ctx.user.id);
    }),

    generateNextCode: protectedProcedure
      .input(z.object({
        familia: z.string().min(1),
      }))
      .query(async ({ ctx, input }) => {
        return await db.generateNextReferenceCode(ctx.user.id, input.familia);
      }),

    create: protectedProcedure
      .input(fichaCustoSchema)
      .mutation(async ({ ctx, input }) => {
        const ficha = await db.createFichaCusto({
          userId: ctx.user.id,
          referencia: input.referencia,
          tipo: input.tipo,
          familia: input.familia,
          cliente: input.cliente,
          fotoUrl: input.fotoUrl,
          modelagem: input.modelagem,
          piloto: input.piloto,
          corte: input.corte,
          beneficiamento: input.beneficiamento,
          costura: input.costura,
          lavanderia: input.lavanderia,
          acabamento: input.acabamento,
          passadoria: input.passadoria,
          tecido: input.tecido,
          aviamento: input.aviamento,
          observacoes: input.observacoes,
        });
        return ficha;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getFichaCustoById(input.id, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        ...fichaCustoSchema.shape,
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateFichaCusto(id, ctx.user.id, data);
        return await db.getFichaCustoById(id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFichaCusto(input.id, ctx.user.id);
        return { success: true };
      }),

    getDistinctValues: protectedProcedure
      .input(z.object({
        field: z.enum(['tipo', 'familia', 'cliente']),
      }))
      .query(async ({ ctx, input }) => {
        const fichas = await db.getFichasCustoByUser(ctx.user.id);
        const values = new Set<string>();
        fichas.forEach((ficha: any) => {
          const value = ficha[input.field];
          if (value) values.add(value);
        });
        return Array.from(values).sort();
      }),

    listFiltered: protectedProcedure
      .input(z.object({
        tipo: z.string().optional(),
        familia: z.string().optional(),
        cliente: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const fichas = await db.getFichasCustoByUser(ctx.user.id);
        return fichas.filter((ficha: any) => {
          if (input.tipo && ficha.tipo !== input.tipo) return false;
          if (input.familia && ficha.familia !== input.familia) return false;
          if (input.cliente && ficha.cliente !== input.cliente) return false;
          if (input.search) {
            const search = input.search.toLowerCase();
            return (
              ficha.referencia.toLowerCase().includes(search) ||
              ficha.tipo.toLowerCase().includes(search) ||
              ficha.familia.toLowerCase().includes(search) ||
              ficha.cliente.toLowerCase().includes(search)
            );
          }
          return true;
        });
      }),
  }),

  orcamentos: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrcamentosByUser(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getOrcamentoById(input.id, ctx.user.id);
      }),

    getItens: protectedProcedure
      .input(z.object({ orcamentoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getItensOrcamento(input.orcamentoId);
      }),

    generateNextNumber: protectedProcedure.query(async ({ ctx }) => {
      return await db.generateNextOrcamentoNumber(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        nomeCliente: z.string().min(1),
        marca: z.string().min(1),
        numeroOrcamento: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await db.createOrcamento({
            userId: ctx.user.id,
            nomeCliente: input.nomeCliente,
            marca: input.marca,
            numeroOrcamento: input.numeroOrcamento,
          });
          
          // Obter o ID do orçamento criado
          let orcamentoId: number | undefined;
          
          // Tentar diferentes formas de obter o ID
          if ((result as any).insertId) {
            orcamentoId = (result as any).insertId;
          } else if ((result as any).lastInsertRowid) {
            orcamentoId = (result as any).lastInsertRowid;
          } else if ((result as any)[0]) {
            orcamentoId = (result as any)[0];
          } else if (typeof result === 'number') {
            orcamentoId = result as number;
          }
          
          if (!orcamentoId || orcamentoId === 0) {
            console.error('Erro ao obter ID do orcamento:', { result, input });
            throw new Error('ID nao obtido');
          }
          
          // Buscar o orçamento criado para retornar os dados completos
          const orcamentoCriado = await db.getOrcamentoById(orcamentoId, ctx.user.id);
          
          if (!orcamentoCriado) {
            console.error('Orcamento nao encontrado:', { orcamentoId, userId: ctx.user.id });
            throw new Error('Orcamento nao recuperado');
          }
          
          return orcamentoCriado;
        } catch (error) {
          console.error('Erro ao criar orcamento:', error);
          const msg = error instanceof Error ? error.message : 'Erro desconhecido';
          throw new Error(`Falha ao criar orcamento: ${msg}`);
        }
      }),

    createItem: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
        fichaId: z.number(),
        referencia: z.string(),
        descricao: z.string(),
        quantidade: z.number().min(1),
        custo: z.number().min(0),
        valorUnitario: z.number().min(0),
        markup: z.number().min(0).default(0.5),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orçamento não encontrado");
        }

        const valorTotal = input.quantidade * input.valorUnitario;

        const item = await db.createItemOrcamento({
          orcamentoId: input.orcamentoId,
          fichaId: input.fichaId,
          referencia: input.referencia,
          descricao: input.descricao,
          quantidade: input.quantidade,
          custo: input.custo,
          valorUnitario: input.valorUnitario,
          valorTotal,
          markupDivisor: input.markup,
        });

        await db.updateOrcamentoTotals(input.orcamentoId);

        return item;
      }),

    updateItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantidade: z.number().min(1),
        valorUnitario: z.number().min(0),
        markup: z.number().min(0),
        custo: z.number().optional(),
        prazoDias: z.number().optional(),
        prazoEntregaTexto: z.string().optional(),
        percentualSinal: z.number().optional(),
        percentualRetirada: z.number().optional(),
        percentualPrazo: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log("[updateItem] Input recebido:", input);
        const valorTotal = input.quantidade * input.valorUnitario;
        // PV = Custo ÷ Markup (não é 1 - markup!)
        const valorComMarkup = input.valorUnitario / input.markup;
        console.log("[updateItem] Valores calculados - valorTotal:", valorTotal, "valorComMarkup:", valorComMarkup);

        await db.updateItemOrcamento(
          input.itemId,
          input.quantidade,
          input.valorUnitario,
          valorTotal,
          input.markup,
          valorComMarkup
        );

        // Atualizar dados do orçamento se fornecidos
        if (input.prazoDias !== undefined || input.prazoEntregaTexto !== undefined || input.percentualSinal !== undefined || input.percentualRetirada !== undefined || input.percentualPrazo !== undefined) {
          // Buscar o orcamentoId do item
          const orcamentoId = await db.getOrcamentoIdFromItem(input.itemId);
          
          // Atualizar percentuais e prazo do orçamento
          await db.updateOrcamentoPercentuais(
            orcamentoId,
            input.prazoDias,
            input.percentualSinal,
            input.percentualRetirada,
            input.percentualPrazo,
            input.prazoEntregaTexto
          );
        }

        return { success: true };
      }),

    deleteItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteItemOrcamento(input.itemId);
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
        status: z.enum(["pendente", "aprovado", "reprovado"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateOrcamentoStatus(input.orcamentoId, input.status, ctx.user.id);
        return { success: true };
      }),

    enviarParaKanban: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orçamento não encontrado");
        }

        const itens = await db.getItensOrcamento(input.orcamentoId);

        const payload = {
          pedido: orcamento.numeroOrcamento,
          cliente: orcamento.nomeCliente,
          email: ctx.user.email || "",
          telefone: "",
          referencia: itens.map((i: any) => i.referencia).join(", "),
          cor: "",
          descricao: itens.map((i: any) => i.descricao).join(" | "),
          grade: "",
          quantidade: orcamento.totalPecas,
          valorUnitario: Math.round(parseFloat(orcamento.subtotal) * 100),
          prazoDias: orcamento.prazoDias,
          totalPecas: orcamento.totalPecas,
          subtotal: Math.round(parseFloat(orcamento.subtotal) * 100),
          total: Math.round(parseFloat(orcamento.total) * 100),
          percentualSinal: parseFloat(orcamento.percentualSinal),
          percentualRetirada: parseFloat(orcamento.percentualRetirada),
          percentualPrazo: parseFloat(orcamento.percentualPrazo),
          itens: itens.map((item: any) => ({
            referencia: item.referencia,
            descricao: item.descricao,
            quantidade: item.quantidade,
            valorUnitario: Math.round(parseFloat(item.valorUnitario) * 100),
            valorTotal: Math.round(parseFloat(item.valorTotal) * 100),
          })),
          apiKey: "r2pb-custos-plus-2026",
        };

        // Enviar para Kanban
        const response = await fetch(
          "https://kanbanprod-phheyds3.manus.space/api/custos-plus/importar-orcamento",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Erro ao enviar para Kanban: ${response.status} - ${error}`);
        }

        const result = await response.json();
        return { success: true, result };
      }),
  }),

  dashboard: router({
    kpis: protectedProcedure.query(async ({ ctx }) => {
      const fichas = await db.getFichasCustoByUser(ctx.user.id);
      const orcamentos = await db.getOrcamentosByUser(ctx.user.id);
      
      const totalReferencias = fichas.length;
      const custoMedioGeral = fichas.length > 0
        ? fichas.reduce((sum, f: any) => {
            const total = (f.modelagem || 0) + (f.piloto || 0) + (f.corte || 0) + 
                         (f.beneficiamento || 0) + (f.costura || 0) + (f.lavanderia || 0) + 
                         (f.acabamento || 0) + (f.passadoria || 0) + (f.tecido || 0) + (f.aviamento || 0);
            return sum + total;
          }, 0) / fichas.length
        : 0;
      
      const familiasMaisCaras = fichas.length > 0
        ? [...new Map(fichas.map((f: any) => [
            f.familia,
            {
              familia: f.familia,
              total: (f.modelagem || 0) + (f.piloto || 0) + (f.corte || 0) + 
                    (f.beneficiamento || 0) + (f.costura || 0) + (f.lavanderia || 0) + 
                    (f.acabamento || 0) + (f.passadoria || 0) + (f.tecido || 0) + (f.aviamento || 0)
            }
          ])).values()]
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 1)
          .map((item: any) => item.familia)
          .join(', ')
        : 'N/A';
      
      const familiasMaisBaratas = fichas.length > 0
        ? [...new Map(fichas.map((f: any) => [
            f.familia,
            {
              familia: f.familia,
              total: (f.modelagem || 0) + (f.piloto || 0) + (f.corte || 0) + 
                    (f.beneficiamento || 0) + (f.costura || 0) + (f.lavanderia || 0) + 
                    (f.acabamento || 0) + (f.passadoria || 0) + (f.tecido || 0) + (f.aviamento || 0)
            }
          ])).values()]
          .sort((a: any, b: any) => a.total - b.total)
          .slice(0, 1)
          .map((item: any) => item.familia)
          .join(', ')
        : 'N/A';
      
      return {
        totalReferencias,
        custoMedioGeral: Number(custoMedioGeral.toFixed(2)),
        familiasMaisCaras,
        familiasMaisBaratas,
      };
    }),

    custosMediosPorFamilia: protectedProcedure.query(async ({ ctx }) => {
      const fichas = await db.getFichasCustoByUser(ctx.user.id);
      
      const familias = new Map<string, any>();
      
      fichas.forEach((ficha: any) => {
        if (!familias.has(ficha.familia)) {
          familias.set(ficha.familia, {
            familia: ficha.familia,
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
            count: 0,
          });
        }
        
        const familia = familias.get(ficha.familia)!;
        familia.modelagem += ficha.modelagem || 0;
        familia.piloto += ficha.piloto || 0;
        familia.corte += ficha.corte || 0;
        familia.beneficiamento += ficha.beneficiamento || 0;
        familia.costura += ficha.costura || 0;
        familia.lavanderia += ficha.lavanderia || 0;
        familia.acabamento += ficha.acabamento || 0;
        familia.passadoria += ficha.passadoria || 0;
        familia.tecido += ficha.tecido || 0;
        familia.aviamento += ficha.aviamento || 0;
        familia.count += 1;
      });
      
      return Array.from(familias.values()).map((familia: any) => {
        const modelagem = isNaN(familia.modelagem / familia.count) ? 0 : Number((familia.modelagem / familia.count).toFixed(2));
        const piloto = isNaN(familia.piloto / familia.count) ? 0 : Number((familia.piloto / familia.count).toFixed(2));
        const corte = isNaN(familia.corte / familia.count) ? 0 : Number((familia.corte / familia.count).toFixed(2));
        const beneficiamento = isNaN(familia.beneficiamento / familia.count) ? 0 : Number((familia.beneficiamento / familia.count).toFixed(2));
        const costura = isNaN(familia.costura / familia.count) ? 0 : Number((familia.costura / familia.count).toFixed(2));
        const lavanderia = isNaN(familia.lavanderia / familia.count) ? 0 : Number((familia.lavanderia / familia.count).toFixed(2));
        const acabamento = isNaN(familia.acabamento / familia.count) ? 0 : Number((familia.acabamento / familia.count).toFixed(2));
        const passadoria = isNaN(familia.passadoria / familia.count) ? 0 : Number((familia.passadoria / familia.count).toFixed(2));
        const tecido = isNaN(familia.tecido / familia.count) ? 0 : Number((familia.tecido / familia.count).toFixed(2));
        const aviamento = isNaN(familia.aviamento / familia.count) ? 0 : Number((familia.aviamento / familia.count).toFixed(2));
        const totalMedio = modelagem + piloto + corte + beneficiamento + costura + lavanderia + acabamento + passadoria + tecido + aviamento;
        return {
          ...familia,
          modelagem,
          piloto,
          corte,
          beneficiamento,
          costura,
          lavanderia,
          acabamento,
          passadoria,
          tecido,
          aviamento,
          totalMedio: Number(totalMedio.toFixed(2)),
        };
      });
    }),
  }),

  storage: router({
    uploadImage: protectedProcedure
      .input(z.object({
        filename: z.string(),
        data: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const base64Data = input.data.split(',')[1] || input.data;
          const buffer = Buffer.from(base64Data, 'base64');
          
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileKey = `fichas-custo/${timestamp}-${random}-${input.filename}`;
          
          const result = await storagePut(fileKey, buffer, input.mimeType);
          
          return {
            url: result.url,
            key: result.key,
          };
        } catch (error) {
          console.error('Erro ao fazer upload:', error);
          throw new Error('Erro ao fazer upload da imagem');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
