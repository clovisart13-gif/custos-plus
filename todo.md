# Custos Plus - TODO

## Campos de Observações e Desconto no Orçamento (22/01/2026)

- [x] Adicionar campos de observações e desconto no schema do banco de dados
  - Objetivo: Permitir incluir observações personalizadas e aplicar descontos nos orçamentos
  - Implementação:
    * ✅ Campos já existiam no schema (linhas 87-89 do schema.ts)
    * ✅ Executado db:push para garantir sincronização
  - Status: ✅ CONCLUÍDO - Schema já estava atualizado

- [x] Atualizar backend para aceitar observações e desconto
  - Objetivo: Modificar procedures tRPC para aceitar e retornar novos campos
  - Implementação:
    * ✅ Backend já aceitava os campos (routers.ts linhas 197-213)
    * ✅ Validações Zod já configuradas
  - Status: ✅ CONCLUÍDO - Backend já estava atualizado

- [x] Atualizar frontend para exibir e editar observações e desconto
  - Objetivo: Adicionar campos no formulário e visualização
  - Implementação:
    * ✅ Textarea de observações já existia (CriarOrcamentoSimples.tsx linhas 179-186)
    * ✅ Campos de tipo e valor de desconto já existiam (linhas 189-213)
    * ✅ Visualização já exibia os campos (VisualizarOrcamento.tsx linhas 667-676)
    * ✅ PDF já exibia os campos (linhas 843-874)
  - Teste: Orçamento ORC-2026-011 exibindo observações e desconto corretamente
  - Status: ✅ CONCLUÍDO - Frontend já estava atualizado

- [x] Aumentar fontes gerais no PDF mantendo margens A4
  - Objetivo: Melhorar legibilidade na impressão física
  - Implementação:
    * ✅ Aumentadas fontes de texto: 11px (antes 10px)
    * ✅ Aumentadas fontes de tabela: 10px (antes 9px)
    * ✅ Aumentados títulos: 14px (antes 12px)
    * ✅ Classes print:text-* aumentadas em ~15%
    * ✅ Logo mantido em 45px
    * ✅ Margens A4 preservadas (15mm)
  - Status: ✅ CONCLUÍDO - Fontes aumentadas sem extrapolar margens
