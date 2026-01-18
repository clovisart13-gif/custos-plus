import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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

    listFiltered: protectedProcedure
      .input(z.object({
        tipo: z.string().optional(),
        familia: z.string().optional(),
        cliente: z.string().optional(),
        search: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getFichasCustoFiltered({
          userId: ctx.user.id,
          ...input,
        });
      }),

    create: protectedProcedure
      .input(fichaCustoSchema)
      .mutation(async ({ ctx, input }) => {
        await db.createFichaCusto({
          ...input,
          modelagem: input.modelagem.toString(),
          piloto: input.piloto.toString(),
          corte: input.corte.toString(),
          beneficiamento: input.beneficiamento.toString(),
          costura: input.costura.toString(),
          lavanderia: input.lavanderia.toString(),
          acabamento: input.acabamento.toString(),
          passadoria: input.passadoria.toString(),
          tecido: input.tecido.toString(),
          aviamento: input.aviamento.toString(),
          userId: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: fichaCustoSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dataToUpdate: any = { ...input.data };
        const numericFields = ['modelagem', 'piloto', 'corte', 'beneficiamento', 'costura', 'lavanderia', 'acabamento', 'passadoria', 'tecido', 'aviamento'];
        numericFields.forEach(field => {
          if (dataToUpdate[field] !== undefined) {
            dataToUpdate[field] = dataToUpdate[field].toString();
          }
        });
        await db.updateFichaCusto(input.id, ctx.user.id, dataToUpdate);
        return { success: true };
      }),

    updateField: protectedProcedure
      .input(z.object({
        id: z.number(),
        field: z.string(),
        value: z.union([z.string(), z.number()]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateFichaCusto(input.id, ctx.user.id, {
          [input.field]: input.value,
        });
        return { success: true };
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
        return await db.getDistinctValues(ctx.user.id, input.field);
      }),
  }),

  dashboard: router({
    kpis: protectedProcedure.query(async ({ ctx }) => {
      return await db.getKPIs(ctx.user.id);
    }),

    custosMediosPorFamilia: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCustosMediosPorFamilia(ctx.user.id);
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
        const result = await db.createOrcamento({
          userId: ctx.user.id,
          nomeCliente: input.nomeCliente,
          marca: input.marca,
          numeroOrcamento: input.numeroOrcamento,
        });
        
        // Obter o ID do orçamento criado
        const orcamentoId = result.insertId || (result as any).lastInsertRowid;
        if (!orcamentoId) {
          throw new Error("Falha ao criar orçamento");
        }
        
        // Buscar o orçamento criado para retornar os dados completos
        const orcamentos = await db.getOrcamentosByUser(ctx.user.id);
        const orcamentoCriado = orcamentos.find((o: any) => o.id === orcamentoId);
        
        return orcamentoCriado || { id: orcamentoId };
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
        valorTotal: z.number().min(0),
        markupDivisor: z.number().min(0.1).max(1),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createItemOrcamento({
          orcamentoId: input.orcamentoId,
          fichaId: input.fichaId,
          referencia: input.referencia,
          descricao: input.descricao,
          quantidade: input.quantidade,
          custo: input.custo.toString(),
          valorUnitario: input.valorUnitario.toString(),
          valorTotal: input.valorTotal.toString(),
          markupDivisor: input.markupDivisor.toString(),
        });
        return result;
      }),

    updateItemMarkup: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        markupDivisor: z.number().min(0.1).max(1),
        custo: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        const result = await db.updateItemMarkup(
          input.itemId,
          input.markupDivisor,
          input.custo
        );
        return result;
      }),

    updateItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantidade: z.number().min(1),
        valorUnitario: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        const valorTotal = input.quantidade * input.valorUnitario;
        const result = await db.updateItemOrcamento(
          input.itemId,
          input.quantidade,
          input.valorUnitario,
          valorTotal
        );
        return result;
      }),

    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteItemOrcamento(input.id);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteItensOrcamento(input.id);
        await db.deleteOrcamento(input.id, ctx.user.id);
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "aprovado", "reprovado"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateOrcamentoStatus(input.id, input.status, ctx.user.id);
        return { success: true };
      }),

    enviarParaKanban: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Obter orcamento
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orcamento nao encontrado");
        }

        // Validar status
        if (orcamento.status !== "aprovado") {
          throw new Error("Orcamento deve estar aprovado para enviar");
        }

        // Obter itens
        const itens = await db.getItensOrcamento(input.orcamentoId);

        // Preparar payload com valores em centavos
        const payload = {
          numeroOrcamento: orcamento.numeroOrcamento,
          nomeCliente: orcamento.nomeCliente,
          marca: orcamento.marca || "",
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
});

export type AppRouter = typeof appRouter;
