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


## Controle de Acesso por Role (27/01/2026)

- [ ] Implementar verificacao de role no backend
  - Objetivo: Bloquear acesso a Fichas de Custo para usuarios comuns
  - Implementacao:
    * Criar middleware adminProcedure para procedures que requerem admin
    * Adicionar verificacao ctx.user.role === 'admin' em procedures sensveis
    * Retornar erro FORBIDDEN se usuario nao for admin
  - Status: PENDENTE

- [ ] Bloquear acesso a pagina de Fichas de Custo para usuarios comuns
  - Objetivo: Esconder rota /fichas-custo para usuarios normais
  - Implementacao:
    * Adicionar verificacao de role no App.tsx
    * Redirecionar para /orcamentos se usuario nao for admin
    * Remover link de Fichas do menu para usuarios comuns
  - Status: PENDENTE

## Modulo de Empresas/Clientes (27/01/2026)

- [ ] Criar schema de empresas no banco de dados
  - Objetivo: Armazenar informacoes de clientes/empresas
  - Campos: id, nome, cnpj, email, telefone, endereco, cidade, estado, observacoes
  - Status: PENDENTE

- [ ] Criar procedures de CRUD para empresas
  - Objetivo: Criar, listar, atualizar, deletar empresas
  - Procedures: createEmpresa, listEmpresas, getEmpresa, updateEmpresa, deleteEmpresa
  - Status: PENDENTE

- [ ] Criar pagina de gerenciamento de empresas (admin only)
  - Objetivo: Interface para gerenciar clientes
  - Componentes: tabela com lista, modal de criar/editar, botao deletar
  - Status: PENDENTE

- [ ] Vincular empresas aos orcamentos
  - Objetivo: Permitir selecionar empresa ao criar orcamento
  - Implementacao:
    * Adicionar campo empresaId na tabela orcamentos
    * Criar select de empresas no formulario de orcamento
    * Exibir nome da empresa no resumo de orcamentos
  - Status: PENDENTE

- [ ] Testar fluxo completo
  - Objetivo: Validar controle de acesso e modulo de empresas
  - Testes:
    * Login como admin → acesso a Fichas de Custo e Empresas
    * Login como usuario → sem acesso a Fichas de Custo
    * Criar empresa → vincular a orcamento
    * Listar orcamentos → mostrar empresa vinculada
  - Status: PENDENTE


## STATUS FINAL: Controle de Acesso e Modulo de Empresas (27/01/2026)

✅ CONCLUIDO:
- Controle de acesso por role implementado
- Fichas de Custo bloqueadas para usuarios comuns
- Schema de empresas criado no banco de dados
- Procedures de CRUD para empresas implementadas
- Router tRPC de empresas criado
- Pagina de gerenciamento de empresas criada
- Rota e link de Empresas adicionados no menu
- Protecao de rotas por role (admin only) implementada

PROXIMA FASE:
- Vincular empresas aos orcamentos (adicionar campo empresaId)
- Criar select de empresas no formulario de orcamento
- Exibir nome da empresa no resumo de orcamentos

## NOVO: Resumo de Orçamentos com Status e KPIs (27/01/2026)

**PROBLEMA IDENTIFICADO:**
O resumo de orçamentos está mostrando valores errados (ex: fence 3pcs - 117,70 em vez de 144pcs - R$ 10.152). 
O detalhe do orçamento mostra valores corretos, mas o resumo (usado para aprovar/reprovar) está errado.
Isso é crítico porque o usuário fecha um orçamento com R$ 20.000 e o resumo mostra R$ 37,80.

**SOLUÇÃO PROPOSTA:**
Em vez de armazenar totais no banco e tentar atualizar (que está falhando), calcular os totais em tempo real:
- Quando buscar lista de orçamentos, calcular totais a partir dos itens
- Isso garante que o resumo SEMPRE estará correto
- Adicionar status (pendente/aprovado/reprovado) aos orçamentos
- Implementar KPIs de totalizações por status

- [x] Coluna `status` já existia na tabela orcamentos
- [x] Criar procedure `listOrcamentosComTotaisCalculados` que busca itens e calcula totais em tempo real
- [x] Criar procedure `getKPIOrcamentos` que retorna KPIs (total pendente, aprovado, reprovado)
- [x] Implementar página de resumo de orçamentos com filtros e KPI cards
- [x] Adicionar procedures tRPC: listComTotaisCalculados, getKPIs
- [x] Adicionar rota /resumo-orcamentos no App.tsx
- [x] Adicionar link no menu de navegação
- [x] Remover status e botões de aprovação da aba Orçamentos
- [x] Remover coluna de valores (total/pecas) da aba Orçamentos
- [x] Redesenhar Resumo com layout kanban moderno (3 colunas por status)
- [x] Adicionar barra de busca no Resumo
- [x] KPI stats simplificados no topo
- [ ] Testar cálculos com todos os orçamentos existentes (be green, fence, ballet, sara regina)
- [ ] Validar que totais calculados correspondem aos valores detalhados no orçamento


## Consolidar Abas Orçamentos e Resumo em Uma Única Aba (29/01/2026)

- [ ] Mover botões "Novo Orçamento" e "Criar de Fichas" para Resumo
  - Objetivo: Consolidar funcionalidades de criação na aba Resumo
  - Implementação:
    * Adicionar botões no topo do Resumo
    * Manter modais de criação funcionando
  - Status: PENDENTE

- [ ] Adicionar botões "Visualizar" e "Deletar" na lista do Resumo
  - Objetivo: Permitir visualizar e deletar orçamentos diretamente do Resumo
  - Implementação:
    * Adicionar coluna de ações com botões
    * Integrar com modais de visualização (PDF/Imprimir)
  - Status: PENDENTE

- [ ] Reorganizar layout para UX agradável
  - Objetivo: Manter interface limpa e intuitiva mesmo com mais funcionalidades
  - Implementação:
    * Agrupar botões de ação por seção
    * Melhorar espaçamento e hierarquia visual
  - Status: PENDENTE

- [ ] Remover aba "Orçamentos"
  - Objetivo: Eliminar redundância de abas
  - Implementação:
    * Remover rota /orcamentos do App.tsx
    * Remover link do menu de navegação
  - Status: PENDENTE

- [ ] Testar fluxo completo
  - Objetivo: Validar todas as funcionalidades consolidadas
  - Testes:
    * Criar novo orçamento
    * Criar de fichas
    * Visualizar (PDF/Imprimir)
    * Deletar
    * Aprovar/Reprovar
    * Enviar para Kanban
  - Status: PENDENTE


## Multi-Tenant Architecture (17/03/2026)

- [x] Adicionar tenantId ao schema (fichas_custo, orcamentos, itens_orcamento, users, empresas)
- [x] Atualizar todas as queries para filtrar por tenantId
- [x] Criar sistema de usuários por empresa
- [x] Implementar edição de usuários
- [x] Otimizar dependências (remover 8 desnecessárias, -115MB)
- [x] Implementar seletor dinâmico de tenant para admin (Mirage)
  - Objetivo: Permitir que admin (Clovis/Mirage) alterne entre empresas
  - Implementação:
    * ✅ Contexto React (TenantContext) criado e funcionando
    * ✅ Dropdown no header mostrando tenant atual (Mirage, R2PB, KMC)
    * ✅ Queries atualizadas para aceitar tenantId: fichasCusto.list, fichasCusto.listFiltered, orcamentos.listComTotaisCalculados, orcamentos.getKPIs
    * ✅ Preferência de tenant salva no localStorage
  - Status: ✅ CONCLUÍDO - FUNCIONANDO

- [x] Atualizar queries para retornar dados de todas as empresas para admin
  - Objetivo: Admin (Mirage) deve ver dados de qualquer empresa selecionada
  - Implementação:
    * ✅ Procedure list aceita tenantId e valida role === 'admin'
    * ✅ Procedure listFiltered aceita tenantId e valida role === 'admin'
    * ✅ Procedure generateNextCode aceita tenantId e valida role === 'admin'
    * ✅ Procedure listComTotaisCalculados aceita tenantId e valida role === 'admin'
    * ✅ Procedure getKPIs aceita tenantId e valida role === 'admin'
  - Status: ✅ CONCLUÍDO - FUNCIONANDO

- [ ] Testar isolamento de dados entre tenants
  - Objetivo: Validar que usuários de uma empresa não veem dados de outra
  - Testes:
    * Login como Jackson (R2PB) → ver apenas dados de R2PB
    * Login como Marcelo (KMC) → ver apenas dados de KMC
    * Login como Clovis (Mirage) → ver dados de qualquer empresa selecionada
  - Status: PENDENTE

- [ ] Criar página de Empresas/Clientes com cards
  - Objetivo: Dashboard mostrando todas as empresas com estatísticas
  - Implementação:
    * Card por empresa com: nome, usuários, fichas, orçamentos
    * Botão "Acessar" para entrar na empresa (selecionar tenant)
    * Botão "Gerenciar" para editar empresa (admin only)
  - Status: PENDENTE

- [ ] Implementar auditoria de acesso
  - Objetivo: Registrar logs de quem acessou quais dados
  - Implementação:
    * Criar tabela audit_logs com: user_id, tenant_id, action, timestamp
    * Registrar: login, visualização de fichas/orçamentos, edições
  - Status: PENDENTE
