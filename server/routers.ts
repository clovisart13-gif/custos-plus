import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router, adminProcedure } from "./_core/trpc";
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
        referencia: z.string().min(1),
        tipo: z.string().min(1),
        familia: z.string().min(1),
        cliente: z.string().min(1),
        fotoUrl: z.string().optional(),
        modelagem: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        piloto: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        corte: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        beneficiamento: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        costura: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        lavanderia: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        acabamento: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        passadoria: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        tecido: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        aviamento: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const convertedData = {
          ...data,
          modelagem: data.modelagem.toString(),
          piloto: data.piloto.toString(),
          corte: data.corte.toString(),
          beneficiamento: data.beneficiamento.toString(),
          costura: data.costura.toString(),
          lavanderia: data.lavanderia.toString(),
          acabamento: data.acabamento.toString(),
          passadoria: data.passadoria.toString(),
          tecido: data.tecido.toString(),
          aviamento: data.aviamento.toString(),
        };
        await db.updateFichaCusto(id, ctx.user.id, convertedData);
        return await db.getFichaCustoById(id, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFichaCusto(input.id, ctx.user.id);
        return { success: true };
      }),

    duplicate: protectedProcedure
      .input(fichaCustoSchema)
      .mutation(async ({ ctx, input }) => {
        const ficha = await db.createFichaCusto({
          userId: ctx.user.id,
          referencia: input.referencia,
          tipo: input.tipo,
          familia: input.familia,
          cliente: input.cliente,
          fotoUrl: input.fotoUrl,
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
          observacoes: input.observacoes,
        });
        return ficha;
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
        marca: z.string().optional(),
        observacoes: z.string().optional(),
        descontoTipo: z.enum(["percentual", "valor"]).optional(),
        descontoValor: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Gerar numeroOrcamento no backend
          const numeroOrcamento = await db.generateNextOrcamentoNumber(ctx.user.id);
          
          const result = await db.createOrcamento({
            userId: ctx.user.id,
            nomeCliente: input.nomeCliente,
            marca: input.marca || "",
            numeroOrcamento,
            observacoes: input.observacoes,
            descontoTipo: input.descontoTipo,
            descontoValor: input.descontoValor ? input.descontoValor.toString() : undefined,
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
          custo: input.custo.toString(),
          valorUnitario: input.valorUnitario.toString(),
          valorTotal: valorTotal.toString(),
          markupDivisor: input.markup.toString(),
        });

        console.log("[createItem] Chamando updateOrcamentoTotals para orcamentoId:", input.orcamentoId);
        await db.updateOrcamentoTotals(input.orcamentoId);
        console.log("[createItem] updateOrcamentoTotals concluido");

        return item;
      }),

    updateItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantidade: z.number().min(1),
        valorUnitario: z.number().min(0),
        markup: z.number().min(0),
        descricao: z.string().optional(),
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
          valorComMarkup,
          input.descricao
        );

        // Buscar o orcamentoId do item para recalcular totais
        const orcamentoId = await db.getOrcamentoIdFromItem(input.itemId);
        
        // Atualizar totais do orcamento (funcao ja faz todo o recalculo)
        console.log("[updateItem] Chamando updateOrcamentoTotals para orcamentoId:", orcamentoId);
        await db.updateOrcamentoTotals(orcamentoId);
        console.log("[updateItem] updateOrcamentoTotals concluido");

        // Atualizar dados do orçamento se fornecidos
        if (input.prazoDias !== undefined || input.prazoEntregaTexto !== undefined || input.percentualSinal !== undefined || input.percentualRetirada !== undefined || input.percentualPrazo !== undefined) {
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

    updateClienteMarca: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
        nomeCliente: z.string().min(1),
        marca: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orçamento não encontrado");
        }
        await db.updateOrcamentoClienteMarca(input.orcamentoId, input.nomeCliente, input.marca || "");
        return { success: true };
      }),

    updateValidadeEPrazo: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
        validade: z.number().min(1),
        prazoEntregaTexto: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orcamento nao encontrado");
        }
        await db.updateOrcamentoValidadeEPrazo(input.orcamentoId, input.validade, input.prazoEntregaTexto);
        return { success: true };
      }),

    updateCondicoesPagamento: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
        percentualSinal: z.number().min(0),
        percentualRetirada: z.number().min(0),
        percentualPrazo: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orcamento nao encontrado");
        }
        await db.updateOrcamentoPercentuais(
          input.orcamentoId,
          undefined,
          input.percentualSinal,
          input.percentualRetirada,
          input.percentualPrazo
        );
        return { success: true };
      }),

    updateDescontoObservacoes: protectedProcedure
      .input(z.object({
        orcamentoId: z.number(),
        observacoes: z.string().optional(),
        descontoTipo: z.enum(["percentual", "valor"]).optional(),
        descontoValor: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamento) {
          throw new Error("Orçamento não encontrado");
        }
        await db.updateOrcamentoDescontoObservacoes(
          input.orcamentoId,
          input.observacoes,
          input.descontoTipo,
          input.descontoValor ? input.descontoValor.toString() : undefined
        );
        
        // Recalcular totais do orcamento apos alterar desconto
        const itens = await db.getItensOrcamento(input.orcamentoId);
        const totalPecas = itens.reduce((sum: number, item: any) => sum + item.quantidade, 0);
        const subtotal = itens.reduce((sum: number, item: any) => sum + Number(item.valorTotal), 0);
        
        // Buscar desconto atualizado
        const orcamentoAtualizado = await db.getOrcamentoById(input.orcamentoId, ctx.user.id);
        if (!orcamentoAtualizado) {
          throw new Error("Orcamento nao encontrado apos atualizacao");
        }
        let valorDesconto = 0;
        if (orcamentoAtualizado.descontoValor && Number(orcamentoAtualizado.descontoValor) > 0) {
          if (orcamentoAtualizado.descontoTipo === 'percentual') {
            valorDesconto = (subtotal * Number(orcamentoAtualizado.descontoValor)) / 100;
          } else {
            valorDesconto = Number(orcamentoAtualizado.descontoValor);
          }
        }
        const total = subtotal - valorDesconto;
        
        // Atualizar totais no banco
        await db.updateOrcamentoTotais(input.orcamentoId, subtotal, total, totalPecas);
        
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

        // Validar campos obrigatórios
        if (!orcamento.numeroOrcamento || !orcamento.nomeCliente) {
          throw new Error(`Campos obrigatórios faltando: numeroOrcamento=${orcamento.numeroOrcamento}, nomeCliente=${orcamento.nomeCliente}`);
        }

        if (!itens || itens.length === 0) {
          throw new Error("Orçamento não possui itens");
        }

        // Calcular totais em tempo real a partir dos itens
        const totalPecas = itens.reduce((sum: number, item: any) => sum + (item.quantidade || 0), 0);
        const subtotal = itens.reduce((sum: number, item: any) => sum + parseFloat(item.valorTotal || "0"), 0);
        const percentualSinal = typeof orcamento.percentualSinal === 'string' ? parseFloat(orcamento.percentualSinal) : (orcamento.percentualSinal || 0);
        const percentualRetirada = typeof orcamento.percentualRetirada === 'string' ? parseFloat(orcamento.percentualRetirada) : (orcamento.percentualRetirada || 0);
        const percentualPrazo = typeof orcamento.percentualPrazo === 'string' ? parseFloat(orcamento.percentualPrazo) : (orcamento.percentualPrazo || 0);
        
        // Total é igual ao subtotal (Kanban calcula o sinal)
        const total = subtotal;

        const payload = {
          numeroOrcamento: orcamento.numeroOrcamento,
          nomeCliente: orcamento.nomeCliente,
          marca: orcamento.marca || "",
          prazoDias: orcamento.prazoDias || 30,
          totalPecas: totalPecas,
          subtotal: Math.round(subtotal * 100),
          total: Math.round(total * 100),
          percentualSinal: percentualSinal,
          percentualRetirada: percentualRetirada,
          percentualPrazo: percentualPrazo,
          itens: itens.map((item: any) => ({
            referencia: item.referencia || "",
            descricao: item.descricao || "",
            quantidade: item.quantidade || 0,
            valorUnitario: Math.round(parseFloat(item.valorUnitario || "0") * 100),
            valorTotal: Math.round(parseFloat(item.valorTotal || "0") * 100),
          })),
          apiKey: "r2pb-custos-plus-2026",
        };

        // Log para debug
        console.log("[Kanban] Payload sendo enviado:", JSON.stringify(payload, null, 2));

        // Enviar para Kanban
        let response;
        try {
          response = await fetch(
          "https://kanbanprod-phheyds3.manus.space/api/custos-plus/importar-orcamento",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        } catch (fetchError) {
          console.error("[Kanban] Fetch error:", fetchError);
          throw new Error(`Erro de conexao com Kanban: ${fetchError instanceof Error ? fetchError.message : 'Desconhecido'}`);
        }

        console.log("[Kanban] Response status:", response.status);

        if (!response.ok) {
          const error = await response.text();
          console.error("[Kanban] Error response:", error);
          throw new Error(`Erro ao enviar para Kanban: ${response.status} - ${error}`);
        }

        const result = await response.json();
        console.log("[Kanban] Success:", result);
        return { success: true, result };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteOrcamento(input.id, ctx.user.id);
        return { success: true };
      }),

    listComTotaisCalculados: protectedProcedure.query(async ({ ctx }) => {
      return await db.listOrcamentosComTotaisCalculados(ctx.user.id);
    }),

    getKPIs: protectedProcedure.query(async ({ ctx }) => {
      return await db.getKPIOrcamentos(ctx.user.id);
    }),


  }),

  dashboard: router({
    kpis: protectedProcedure
      .input(z.object({ familia: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        const fichas = await db.getFichasCustoByUser(ctx.user.id);
      const orcamentos = await db.getOrcamentosByUser(ctx.user.id);
      
      // Filtrar fichas por família se fornecida
      const fichasFiltradas = input.familia && input.familia !== 'todos'
        ? fichas.filter((f: any) => f.familia === input.familia)
        : fichas;
      
      const totalReferencias = fichasFiltradas.length;
      const custoMedioGeral = fichasFiltradas.length > 0
        ? fichasFiltradas.reduce((sum, f: any) => {
            const total = (Number(f.modelagem) || 0) + (Number(f.piloto) || 0) + (Number(f.corte) || 0) + 
                         (Number(f.beneficiamento) || 0) + (Number(f.costura) || 0) + (Number(f.lavanderia) || 0) + 
                         (Number(f.acabamento) || 0) + (Number(f.passadoria) || 0) + (Number(f.tecido) || 0) + (Number(f.aviamento) || 0);
            return sum + total;
          }, 0) / fichas.length
        : 0;
      
      // Calcular média por família para encontrar a mais cara e mais barata
      const familiasMedias = new Map<string, { familia: string; totalMedio: number; count: number }>();
      
      fichas.forEach((ficha: any) => {
        const total = (Number(ficha.modelagem) || 0) + (Number(ficha.piloto) || 0) + (Number(ficha.corte) || 0) + 
                     (Number(ficha.beneficiamento) || 0) + (Number(ficha.costura) || 0) + (Number(ficha.lavanderia) || 0) + 
                     (Number(ficha.acabamento) || 0) + (Number(ficha.passadoria) || 0) + (Number(ficha.tecido) || 0) + (Number(ficha.aviamento) || 0);
        
        if (!familiasMedias.has(ficha.familia)) {
          familiasMedias.set(ficha.familia, { familia: ficha.familia, totalMedio: 0, count: 0 });
        }
        
        const familia = familiasMedias.get(ficha.familia)!;
        familia.totalMedio += total;
        familia.count += 1;
      });
      
      // Calcular média de cada família
      const familiasComMedia = Array.from(familiasMedias.values()).map(f => ({
        ...f,
        totalMedio: f.count > 0 ? f.totalMedio / f.count : 0
      }));
      
      const familiasMaisCaras = familiasComMedia.length > 0
        ? familiasComMedia
          .sort((a: any, b: any) => b.totalMedio - a.totalMedio)
          .slice(0, 1)
          .map((item: any) => item.familia)
          .join(', ')
        : 'N/A';
      
      const familiasMaisBaratas = familiasComMedia.length > 0
        ? familiasComMedia
          .sort((a: any, b: any) => a.totalMedio - b.totalMedio)
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
        familia.modelagem += Number(ficha.modelagem) || 0;
        familia.piloto += Number(ficha.piloto) || 0;
        familia.corte += Number(ficha.corte) || 0;
        familia.beneficiamento += Number(ficha.beneficiamento) || 0;
        familia.costura += Number(ficha.costura) || 0;
        familia.lavanderia += Number(ficha.lavanderia) || 0;
        familia.acabamento += Number(ficha.acabamento) || 0;
        familia.passadoria += Number(ficha.passadoria) || 0;
        familia.tecido += Number(ficha.tecido) || 0;
        familia.aviamento += Number(ficha.aviamento) || 0;
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

  admin: router({
    listUsers: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem listar usuários');
        }
        return await db.getAllUsers();
      }),

    createUser: protectedProcedure
      .input(z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem criar usuários');
        }
        return await db.createUser(input.nome, input.email, input.role);
      }),

    deleteUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Apenas administradores podem deletar usuários');
        }
        return await db.deleteUser(input.userId);
      }),

    recalculateAllOrcamentos: adminProcedure
      .mutation(async ({ ctx }) => {
        console.log("[Admin] Iniciando recálculo de TODOS os orçamentos");
        await db.recalculatAllOrcamentos();
        return { success: true, message: "Todos os orçamentos foram recalculados" };
      }),
  }),

  empresas: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getEmpresasByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        cnpj: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createEmpresa(
          ctx.user.id,
          input.nome,
          input.cnpj,
          input.email,
          input.telefone,
          input.endereco,
          input.cidade,
          input.estado,
          input.observacoes
        );
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        nome: z.string().optional(),
        cnpj: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateEmpresa(
          input.empresaId,
          ctx.user.id,
          input.nome,
          input.cnpj,
          input.email,
          input.telefone,
          input.endereco,
          input.cidade,
          input.estado,
          input.observacoes
        );
      }),

    delete: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteEmpresa(input.empresaId, ctx.user.id);
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
