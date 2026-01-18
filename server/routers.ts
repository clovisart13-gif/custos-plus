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
        valorUnitario: z.number().min(0),
        markup: z.number().min(0).default(0.5),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orçamento não encontrado");
        }

        const valorTotal = input.quantidade * input.valorUnitario;
        const valorComMarkup = valorTotal / (1 - input.markup);

        const item = await db.createItemOrcamento({
          orcamentoId: input.orcamentoId,
          fichaId: input.fichaId,
          referencia: input.referencia,
          descricao: input.descricao,
          quantidade: input.quantidade,
          valorUnitario: input.valorUnitario,
          valorTotal,
          markup: input.markup,
          valorComMarkup,
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
      }))
      .mutation(async ({ input }) => {
        const valorTotal = input.quantidade * input.valorUnitario;
        const valorComMarkup = valorTotal / (1 - input.markup);

        await db.updateItemOrcamento(
          input.itemId,
          input.quantidade,
          input.valorUnitario,
          valorTotal,
          input.markup,
          valorComMarkup
        );

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
