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


## Adicionar Observações e Desconto no Orçamento de Fichas (22/01/2026)

- [x] Verificar componentes de orçamento de fichas
  - Objetivo: Identificar onde adicionar campos de observações e desconto
  - Arquivos: CriarOrcamentoDaFichaForm.tsx
  - Status: ✅ CONCLUÍDO - Componente identificado

- [x] Adicionar campos de observações e desconto no formulário
  - Objetivo: Permitir incluir observações e desconto ao criar orçamento de fichas
  - Implementação:
    * ✅ Adicionada textarea de observações (linha 102-109)
    * ✅ Adicionado select de tipo de desconto (linha 112-119)
    * ✅ Adicionado input de valor do desconto (linha 121-126)
    * ✅ Campos enviados ao backend no procedimento createFromFichas
  - Teste: Orçamento 450002 criado com observações e desconto de 20%
  - Status: ✅ CONCLUÍDO - Funcionalidade 100% operacional

## Funcionalidade de Duplicar Ficha (22/01/2026)

- [x] Criar backend para duplicar ficha
  - Objetivo: Criar procedimento tRPC para duplicar ficha
  - Implementação:
    * ✅ Criado procedure `duplicate` em routers.ts (após delete)
    * ✅ Busca ficha original por ID
    * ✅ Cria nova ficha com dados copiados (exceto ID)
    * ✅ Retorna ID da nova ficha
  - Status: ✅ CONCLUÍDO - Backend implementado

- [x] Criar componente de duplicação de ficha
  - Objetivo: Modal completo pré-preenchido com dados da ficha original
  - Implementação:
    * ✅ Criado componente DuplicarFichaModal.tsx
    * ✅ Pré-preenchidos TODOS os campos:
      - Referência (com sufixo -COPIA)
      - Tipo, Família, Cliente
      - Foto (URL da imagem)
      - Observações
      - Todos os custos de mão-de-obra (8 fases)
      - Custos de matéria-prima (tecido + aviamento)
    * ✅ Permitida edição de qualquer campo
    * ✅ Chama procedure duplicate ao salvar
  - Teste: Ficha 26CAM-004 duplicada para 26CAM-005 com sucesso
  - Status: ✅ CONCLUÍDO - Modal completo e funcional

- [x] Adicionar botão duplicar na tabela de fichas
  - Objetivo: Adicionar ação "Duplicar" na coluna de ações
  - Implementação:
    * ✅ Adicionado botão "Duplicar" na tabela (FichasCusto.tsx linhas 356-364)
    * ✅ Adicionado estado showDuplicarModal e selectedFichaForDuplicar
    * ✅ Adicionada função handleDuplicar (linhas 115-118)
    * ✅ Modal abre ao clicar no botão
  - Teste: Botão aparece em todas as fichas e abre modal corretamente
  - Status: ✅ CONCLUÍDO - Botão funcional


## Adicionar Observações e Desconto no Modal "Criar de Fichas" (22/01/2026)

- [x] Identificar componente do modal "Criar de Fichas"
  - Objetivo: Encontrar o componente responsável pelo modal de orçamento de múltiplas fichas
  - Arquivo: client/src/components/SelecionarFichasModal.tsx
  - Status: ✅ CONCLUÍDO - Componente identificado

- [x] Adicionar campos de observações e desconto
  - Problema: Modal "Criar de Fichas" não tinha campos de observações e desconto
  - Objetivo: Adicionar campos igual ao modal de orçamento de uma ficha
  - Implementação:
    * ✅ Adicionada textarea de observações (opcional) - linhas 198-205
    * ✅ Adicionado select de tipo de desconto (percentual/valor) - linhas 208-221
    * ✅ Adicionado input de valor do desconto - linhas 223-232
    * ✅ Backend já aceitava os campos (procedure createFromFichas)
  - Teste: Orçamento 450004 criado com 2 fichas (26CAM-005 e 26CAM-004), observações e desconto de 10%
  - Cálculo validado: Subtotal R$ 76,50 - 10% (R$ 7,65) = R$ 68,85 ✅
  - Status: ✅ CONCLUÍDO - Funcionalidade 100% operacional


## Editar Desconto e Observações Após Criação (22/01/2026)

- [x] Criar procedure backend para atualizar desconto e observações
  - Objetivo: Permitir editar desconto e observações de orçamentos já criados
  - Implementação:
    * ✅ Criado procedure `updateDescontoObservacoes` em routers.ts
    * ✅ Aceita parâmetros: orcamentoId, observacoes, descontoTipo, descontoValor
    * ✅ Atualiza registro no banco de dados
    * ✅ Retorna orçamento atualizado
  - Status: ✅ CONCLUÍDO

- [x] Criar modais de edição no frontend
  - Objetivo: Criar interfaces para editar desconto e observações
  - Implementação:
    * ✅ Criado modal EditarObservacoesModal.tsx com textarea
    * ✅ Criado modal EditarDescontoModal.tsx com select (tipo) + input (valor)
    * ✅ Chama procedure updateDescontoObservacoes ao salvar
    * ✅ Invalida cache do tRPC para atualizar visualização
  - Status: ✅ CONCLUÍDO

- [x] Adicionar botões Editar nos cards
  - Objetivo: Adicionar botões para abrir modais de edição
  - Implementação:
    * ✅ Adicionado botão "Editar" no card de Observações
    * ✅ Adicionado botão "Editar Desconto" no card de Totais
    * ✅ Modais abrem corretamente ao clicar
  - Status: ✅ CONCLUÍDO

- [x] Testar fluxo completo
  - Objetivo: Validar edição de desconto e observações
  - Testes realizados:
    * ✅ Orçamento ORC-2026-011 testado
    * ✅ Desconto alterado de 15% para 20% via botão "Editar Desconto"
    * ✅ Observações atualizadas via botão "Editar"
    * ✅ Recálculo de totais funcionando: R$ 1.000,00 - 20% = R$ 800,00
    * ✅ Persistência confirmada após reload (F5)
    * ✅ Condições de pagamento recalculadas sobre o novo total
  - Status: ✅ CONCLUÍDO - FUNCIONALIDADE 100% OPERACIONAL


## Melhorias de UX na Tabela de Fichas de Custo (22/01/2026)

- [x] Fixar coluna de Ações (sticky right)
  - Objetivo: Manter botões de ação sempre visíveis mesmo com scroll horizontal
  - Implementação:
    * ✅ Adicionado position: sticky e right: 0 na coluna de Ações
    * ✅ Adicionado background e shadow para destacar coluna fixa
    * ✅ Testado com scroll horizontal - funcionando perfeitamente
  - Status: ✅ CONCLUÍDO

- [x] Fixar coluna de Referência (sticky left)
  - Objetivo: Manter referência sempre visível para identificação
  - Implementação:
    * ✅ Adicionado position: sticky e left: 0 na coluna de Referência
    * ✅ Adicionado background e shadow para destacar coluna fixa
    * ✅ Testado com scroll horizontal - funcionando perfeitamente
  - Status: ✅ CONCLUÍDO

- [x] Reduzir largura da coluna Cliente
  - Objetivo: Otimizar espaço horizontal da tabela
  - Implementação:
    * ✅ Reduzido max-width da coluna Cliente para 150px
    * ✅ Adicionado truncamento de texto com ellipsis (truncate)
    * ✅ Adicionado tooltip com nome completo ao hover (title attribute)
  - Status: ✅ CONCLUÍDO


## Correção: Card de Observações Sempre Visível (22/01/2026)

- [x] Remover condicional que esconde card de Observações quando vazio
  - Problema: Card de Observações só aparece quando há texto, impossibilitando adicionar observações após criação do orçamento
  - Solução: Manter card sempre visível, mesmo quando observações estiverem vazias
  - Implementação:
    * ✅ Removido condicional {orcamento.observacoes && (...)}
    * ✅ Card agora renderiza sempre
    * ✅ Adicionado placeholder: "Nenhuma observação adicionada. Clique em 'Editar' para adicionar."
    * ✅ Botão "Editar" sempre acessível
  - Arquivo: client/src/pages/VisualizarOrcamento.tsx
  - Status: ✅ CONCLUÍDO


## Bug: Truncamento de Valores no PDF (23/01/2026)

- [x] Corrigir truncamento da coluna TOTAL na tabela de itens do PDF
  - Problema: Valores na coluna TOTAL estavam sendo cortados
  - Causa: Coluna muito estreita no template de PDF (width: 20%)
  - Solução: Aumentar largura da coluna TOTAL para 32%
  - Arquivo: client/src/pages/VisualizarOrcamento.tsx (linha 836-840)
  - Status: CORRIGIDO


## Bug: Resumo de Orcamentos nao Atualiza com Alteracoes (27/01/2026)

- [x] Corrigir calculo de totais quando itens sao alterados
  - Problema: Ao editar quantidade/valor de um item, o resumo na lista nao atualizava
  - Causa: Totais no banco nao eram recalculados apos alteracao de item
  - Solucao: Adicionar recalculo de totais apos updateItem
  - Status: CORRIGIDO

- [x] Corrigir calculo de totais quando desconto e alterado
  - Problema: Ao editar desconto, o resumo nao atualizava
  - Causa: Totais no banco nao eram recalculados apos alteracao de desconto
  - Solucao: Adicionar recalculo de totais apos updateDescontoObservacoes
  - Status: CORRIGIDO
