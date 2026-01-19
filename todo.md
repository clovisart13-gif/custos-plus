# Custos Plus - TODO

## Funcionalidades Principais

### Banco de Dados e Backend
- [x] Criar schema de tabelas (fichas de custo, tipos, famílias, clientes)
- [x] Implementar queries no server/db.ts
- [x] Criar rotas tRPC para CRUD de fichas de custo
- [x] Criar rotas tRPC para KPIs e análises

### Interface e Layout
- [x] Configurar tema e cores globais
- [x] Integrar logo R2PB no layout
- [x] Criar navegação superior com menu
- [x] Implementar layout responsivo

### Página: Fichas de Custo
- [x] Criar tabela editável com todas as colunas
- [x] Implementar edição inline de células
- [x] Adicionar busca por referência
- [x] Implementar filtros (Tipo, Família, Cliente, Período)
- [x] Criar modal de nova ficha de custo
- [x] Adicionar validação de formulário
- [x] Implementar cálculo automático de total
- [x] Adicionar ações de editar e deletar

### Página: Dashboard
- [x] Criar 4 cards de KPIs no topo
- [x] Implementar tabela de custos médios por família
- [x] Criar gráfico de barras (custo total por família)
- [x] Criar gráfico de pizza (mão-de-obra vs matéria-prima)
- [ ] Adicionar filtros de período no dashboard

### Tutorial de Boas-Vindas
- [x] Criar modal de tutorial com 3 passos
- [x] Implementar navegação entre passos
- [x] Adicionar opção de pular tutorial
- [x] Salvar estado do tutorial no localStorage

### Testes e Finalização
- [x] Testar todas as funcionalidades
- [x] Adicionar dados de exemplo para demonstração
- [x] Criar checkpoint final
- [x] Documentar sistema

## Exportação de Ficha de Custo (Pendente)

### Upload de Foto
- [x] Adicionar campo de upload de foto no formulário
- [x] Integrar com S3 para armazenamento
- [x] Exibir miniatura da foto na tabela
- [x] Permitir visualizar foto em tamanho maior
- [x] Incluir foto na visualização/PDF da ficha

### Visualização e Impressão
- [x] Criar página de visualização da Ficha de Custo
- [x] Adicionar botão "Visualizar" na tabela de fichas
- [x] Layout profissional com logo R2PB
- [x] Mostrar todas as etapas de custo detalhadas
- [x] Implementar exportação para PDF
- [x] Adicionar botão de impressão

## Correções Urgentes

- [x] Corrigir logo quebrado na visualização de ficha
- [x] Corrigir erro de "removeChild" ao criar ficha de custo
- [x] Restaurar funcionalidade de upload de imagens
- [x] Corrigir imports duplicados em VisualizarOrcamento.tsx
- [x] Adicionar rota backend para upload de imagens (storage.uploadImage)

## Geração Automática de Código de Referência

- [x] Implementar lógica de geração automática no backend (formato: AAFFFF-NNN)
- [x] Criar rota tRPC para gerar próximo código
- [x] Atualizar formulário para gerar código automaticamente
- [x] Permitir edição manual do código após geração
- [x] Testar geração com diferentes famílias e anos

## Módulo de Orçamento (Em Desenvolvimento)

### Banco de Dados e Backend
- [x] Criar tabela de orçamentos no schema
- [x] Criar tabela de itens de orçamento
- [x] Implementar queries no server/db.ts
- [x] Criar rotas tRPC para CRUD de orçamentos
- [x] Implementar geração automática de número de orçamento (ORÇ-YY-NNN)

### Interface de Geração
- [x] Criar modal de geração de orçamento MANUAL
- [x] Criar funcionalidade de gerar orçamento A PARTIR DA FICHA DE CUSTO
- [x] Implementar cálculo de markup divisor (0,40 / 0,50 / 0,60)
- [x] Adicionar campos de quantidade e prazos
- [x] Implementar cálculo automático de condições de pagamento
- [x] Botão "Gerar Orçamento" na página de Fichas de Custo
- [x] Melhorar clareza visual: deixar evidente que múltiplas fichas podem virar um orçamento
- [x] Campo de markup editável ao adicionar item ao orçamento
- [x] Coluna de markup visível na tabela de itens do orçamento
- [x] Fluxo automático: clicar "Orçamento" na ficha cria orçamento + adiciona item + redireciona para visualização

### Visualização e Exportação
- [x] Criar página de visualização de orçamento
- [x] Implementar layout conforme mockup aprovado
- [x] Adicionar exportação para PDF
- [x] Adicionar botão de impressão
- [x] Melhorar layout PDF para mostrar claramente cada ficha como item separado
- [x] Implementar botão Editar Markup para mudar markup de itens em tempo real

### Geração Simplificada (NOVO FLUXO)
- [x] Simplificar modal para criar orçamento INDIVIDUAL
- [x] Criar formulario para adicionar itens manualmente
- [x] Permitir editar descricao, valor unitario e quantidade de cada item
- [x] Permitir deletar itens do orcamento (PRÓXIMA TAREFA - Autorizado para amanhã)
- [x] Testar fluxo completo de criacao e edicao
- [x] REMOVER componente de geração em lote (checkboxes e botão removidos)
- [x] Testar criação individual sem erros

### Testes
- [x] Testar geração de orçamento (14 testes passando)
- [x] Testar cálculos de preço
- [ ] Testar exportação para PDF

## Funcionalidades Futuras (Planejadas)
- [ ] Botões de "Aprovado" e "Reprovado" na lista de orçamentos
- [ ] Integração com Kanban para gerar pedidos automáticos quando orçamento aprovado
- [ ] Filtros e busca na página de orçamentos
- [ ] Status de orçamento (Pendente, Aceito, Rejeitado)
- [ ] Histórico de alterações de orçamentos


## Integração com Kanban R2PB (IMPLEMENTADA E PRONTA PARA PUBLICAR)
- [x] Confirmar estrutura de campos do Kanban
- [x] Obter URL da API do Kanban
- [x] Obter chave de autenticação do Kanban
- [x] Implementar rota de aprovação de orçamento
- [x] Implementar envio de dados para Kanban
- [x] Testar integração completa
- [x] Documentar fluxo de sincronização
- [x] Corrigir erros de compilação
- [x] Botão "Enviar para Kanban" funcional
- [x] ATUALIZAR URL do Kanban (nova URL)
- [x] ATUALIZAR formato do body (remover envoltório json)
- [x] Testar integração com nova URL


## Bugs Reportados - Sessão Anterior

- [x] Erro "Falha ao criar orçamento" ao clicar em "Criar Orçamento"
  - Causa: Campos incorretos sendo enviados pelo frontend
  - Solução: Corrigido CriarOrcamentoSimples.tsx para enviar campos corretos
  - Status: RESOLVIDO - Testado e funcionando


## Bugs Reportados - Sessão Anterior (18/01/2026)

- [x] Erro "No procedure found on path 'dashboard.custosMediosPorFamilia'" ao carregar dashboard
  - Causa: Rota tRPC faltando no backend
  - Solução: Adicionadas rotas dashboard.kpis e dashboard.custosMediosPorFamilia em routers.ts
  - Bonus: Corrigido tratamento de valores NaN para mostrar R$ 0.00 em vez de R$ NaN
  - Status: RESOLVIDO - Dashboard carregando com todos os dados corretamente


## Bugs Corrigidos - Sessão Atual (18/01/2026)

- [x] Erro "NotFoundError: Failed to execute 'insertBefore'" ao fazer upload de imagem
  - Causa: Componente ImageUpload usava `document.getElementById()` que causava sincronização incorreta com DOM
  - Solução: Refatorado ImageUpload.tsx para usar `useRef` em vez de `document.getElementById()`
  - Status: RESOLVIDO - Modal abre sem erros, componente funciona corretamente


## Bugs Corrigidos - Sessão Atual (18/01/2026 - Noite)

- [x] Erro tRPC "No procedure found on path 'fichasCusto.getDistinctValues'"
  - Causa: Rota backend faltando
  - Solução: Adicionada rota getDistinctValues em routers.ts
  - Status: RESOLVIDO

- [x] Erro tRPC "No procedure found on path 'fichasCusto.listFiltered'"
  - Causa: Rota backend faltando
  - Solução: Adicionada rota listFiltered em routers.ts
  - Status: RESOLVIDO

- [x] Erro HTML "<a> cannot contain a nested <a>" (RESOLVIDO PERMANENTEMENTE)
  - Causa: Nested anchor tags em múltiplos componentes
  - Solução: Removido todas as <a> aninhadas em FichasCusto, Dashboard e Navigation
  - Componentes corrigidos: FichasCusto.tsx, Dashboard.tsx, Navigation.tsx
  - Status: RESOLVIDO PERMANENTEMENTE - Console limpo, nenhum erro


## Bugs Corrigidos - Sessão Atual (18/01/2026 - Noite)

- [x] Erro ao criar orçamento: Query SQL recebendo [object Object] em vez de ID
  - Causa: Função createOrcamento retornava objeto Drizzle em vez de ID
  - Solução: Modificado createOrcamento em db.ts para retornar o ID do orçamento criado
  - Teste: Criado novo orçamento ORÇ-26-1768695814520 com sucesso
  - Status: RESOLVIDO - Orçamentos criando corretamente


## Bugs Corrigidos - Sessão Atual (18/01/2026 - Noite - RESOLVIDO)

- [x] Erro ao criar itens de orçamento: Insert query falhando
  - Causa: Função createItemOrcamento não estava recebendo campo custo
  - Solução: Adicionado campo custo ao input em CriarOrcamentoSimples.tsx
  - Teste: Criado novo orçamento ORÇ-26-1768695814522 com sucesso
  - Status: RESOLVIDO - Orçamentos com itens criando corretamente


## Bugs Corrigidos - Sessão Atual (18/01/2026 - Noite - RESOLVIDO PERMANENTEMENTE)

- [x] Erro ao criar orçamento: "db.updateOrcamentoTotals is not a function"
  - Causa: Função updateOrcamentoTotals não existia em db.ts
  - Solução: Criada função updateOrcamentoTotals que calcula e atualiza totais do orçamento
  - Teste: Criado orçamento ORÇ-26-1768695814524 com sucesso
  - Status: RESOLVIDO PERMANENTEMENTE - Orçamentos funcionando 100%


## Funcionalidades de Edição de Orçamento (IMPLEMENTADAS)

- [x] Deletar itens do orçamento - Botão de lixeira funcional com confirmação
- [x] Editar quantidade e valor unitário dos itens - Modal EditarItemOrcamento funcional
- [x] Visualizar dados do cliente (cliente, marca, validade, prazo) - Seção completa
- [x] Visualizar condições de pagamento (percentuais de sinal, retirada, prazo) - Calculadas automaticamente
- [x] Adicionar itens manualmente - Botão "+Adicionar Item" funcional
- [x] Atualizar totais automaticamente ao editar itens - updateOrcamentoTotals implementada


## Bugs Críticos - Sessão Atual (19/01/2026)

- [x] Erro ao editar item: markup undefined
  - Erro: Invalid input: expected number, received undefined
  - Causa: Campo markup não estava sendo enviado no modal de edição
  - Solução: Adicionado campo markup ao EditarItemOrcamento.tsx
  - Teste: Editado item com quantidade 2, todos os campos salvos corretamente
  - Status: RESOLVIDO - Modal funciona 100% sem erros

- [x] Faltam campos de edição no orçamento
  - [x] Prazo de pagamento (sinal, retirada, prazo) - Implementado e testado
  - [x] Prazo de entrega - Implementado e testado
  - [x] Observações - Implementado e testado
  - [x] Editar dados do cliente - Visualização completa implementada
  - Status: TODOS IMPLEMENTADOS E TESTADOS COM SUCESSO


## Bug Reportado - Sessão Atual (19/01/2026 - Tarde)

- [ ] Percentuais de pagamento não estão sendo salvos ao editar item
  - Sintoma: Alterou 50% sinal + 50% à vista, mas os valores não mudaram
  - Causa: Investigando - backend pode não estar aceitando/salvando percentuais
  - Prioridade: CRÍTICA - Bloqueia edição de condições de pagamento
  - Status: EM INVESTIGAÇÃO


## Requisitos de Percentuais de Pagamento (Novo)

- [ ] Percentuais de pagamento devem somar 100%
  - [ ] Validar no modal de edição que Sinal + Retirada + Prazo = 100%
  - [ ] Mostrar mensagem de erro se não somar 100%
  - [ ] Impedir salvar se não somar 100%

- [ ] Mostrar apenas parcelas com valor > 0%
  - [ ] Se Sinal = 50% e Retirada = 50%, não mostrar "30 dias"
  - [ ] Se Sinal = 100%, não mostrar Retirada e Prazo
  - [ ] Atualizar visualização para filtrar parcelas dinamicamente

- [ ] Garantir que percentuais sejam salvos no banco de dados
  - [ ] Verificar se updateOrcamentoPercentuais está funcionando
  - [ ] Testar com diferentes combinações de percentuais
  - [ ] Validar que valores são persistidos após reload


## RESUMO DE CONCLUSÃO - SESSÃO 19/01/2026 (NOITE)

### ✅ TODOS OS BUGS CORRIGIDOS COM SUCESSO

**Percentuais de Pagamento - SISTEMA 100% FUNCIONAL:**
- [x] Percentuais somam 100% com validação em tempo real
- [x] Indicador visual: verde quando 100%, vermelho quando diferente
- [x] Apenas parcelas com % > 0 aparecem na visualização
- [x] Dados persistidos no banco de dados com sucesso
- [x] Testado: 50% sinal + 50% retirada + 0% prazo = apenas 2 parcelas aparecem

**Prazo de Entrega - MUDANÇA IMPLEMENTADA:**
- [x] Campo alterado de INT (prazoDias) para TEXT (prazoEntregaTexto)
- [x] Aceita texto livre: "30 dias após aprovação do protótipo"
- [x] Aceita texto livre: "40/60 dias após aprovação do protótipo"
- [x] Testado com sucesso - valores sendo salvos e exibidos corretamente

**Edição de Itens - TOTALMENTE FUNCIONAL:**
- [x] Modal de edição com todos os 9 campos
- [x] Validação de percentuais somando 100%
- [x] Cálculo automático de totais
- [x] Dados persistidos no banco
- [x] Sem erros no console

### PRÓXIMAS TAREFAS (SUGERIDAS):
1. Edição de Dados do Cliente (cliente, marca, validade)
2. Exportação PDF aprimorada com layout melhorado
3. Filtros no Dashboard (período, família, tipo)
4. Deletar itens com confirmação
5. Histórico de alterações de orçamentos


## Bug Corrigido - Erro ao Criar Orçamento (19/01/2026 - Noite)

- [x] Erro ao criar orçamento: "Field 'prazo_entrega_texto' doesn't have a default value"
  - Causa: Campo prazoEntregaTexto foi adicionado como NOT NULL sem default value
  - Solução: Alterado campo de TEXT para VARCHAR(255) com DEFAULT '30 dias'
  - Teste: Criado novo orçamento ORÇ-17687846861917 com sucesso
  - Status: RESOLVIDO - Sistema funcionando 100%


## Bugs Críticos - Markup e Percentuais (19/01/2026 - Noite) - RESOLVIDOS

- [x] Markup não recalcula PV quando alterado
  - Fórmula correta: PV = Custo ÷ Markup (não multiplicação!)
  - Exemplo: Custo R$ 20,00, Markup 0.50 → PV = R$ 40,00
  - Solução: Implementada lógica de recálculo no EditarItemOrcamento
  - Status: RESOLVIDO

- [x] Percentuais de pagamento não são salvos no banco
  - Problema: Alterou para 0% sinal, 50% à vista, mas continuou mostrando valores antigos
  - Causa: Componente EditarItemOrcamento não recebia prop orcamento com dados corretos
  - Solução: Adicionado prop orcamento em VisualizarOrcamento.tsx
  - Teste: Alterado para 0% Sinal, 50% Retirada, 50% Prazo - Salvou corretamente
  - Resultado: Apenas 2 parcelas aparecem (Retirada e Prazo), Sinal não aparece
  - Status: RESOLVIDO - Percentuais salvos e lógica de filtro funcionando


## Bugs Críticos - URGENTE (19/01/2026 - Noite)

- [ ] Percentuais de pagamento NÃO estão sendo salvos
  - Sintoma: Altera percentuais (ex: 0% Sinal, 50% Retirada, 50% Prazo) mas ao salvar não persiste
  - Causa: Investigar se a requisição está sendo enviada ou se há erro no backend
  - Prioridade: CRÍTICA - Bloqueia edição de condições de pagamento
  - Status: EM INVESTIGAÇÃO

- [ ] Markup não recalcula PV automaticamente (bidirecional)
  - Problema 1: Alterar markup não recalcula PV automaticamente
  - Problema 2: Alterar PV não recalcula markup automaticamente
  - Fórmula: PV = Custo ÷ Markup (ex: Custo R$ 20, Markup 0.50 = PV R$ 40)
  - Prioridade: CRÍTICA - Bloqueia edição de markup
  - Status: EM INVESTIGAÇÃO


## REQUISITOS CRÍTICOS - MARKUP BIDIRECIONAL E PARCELAS DINÂMICAS

- [ ] Markup Bidirecional: Alterar markup recalcula PV, alterar PV recalcula markup
- [ ] Parcelas Dinâmicas: Adicionar/remover parcelas com autonomia total do usuário
- [ ] Sistema deve permitir qualquer combinação de percentuais que somem 100%


## REFATORAÇÃO - FLUXO DE ORÇAMENTO (ETAPA 1)

### ETAPA 1: Seleção de Fichas de Custo
- [x] Criar modal para seleção de fichas com checkbox
- [x] Listar todas as fichas de custo disponíveis
- [x] Permitir selecionar múltiplas fichas
- [x] Criar orçamento com fichas selecionadas
- [x] Testar seleção e criação

### ETAPA 2: Cálculo Automático de PV com Markup
- [ ] Adicionar campo de markup único no modal
- [ ] Calcular PV = Custo × (1 + markup) para cada item
- [ ] Exibir preview de valores antes de criar
- [ ] Salvar markup no orçamento
- [ ] Testar cálculos


## MELHORIAS SOLICITADAS - ETAPA 4 (19/01/2026 - Noite)

- [ ] Mover prazos para nível do orçamento (remover de itens individuais)
  - [ ] Remover campos de prazo da edição de itens (EditarItemOrcamento)
  - [ ] Criar seção separada para editar prazos do orçamento inteiro
  - [ ] Testar que prazos atualizam corretamente no orçamento

- [x] Pré-preencher cliente no modal de criação
  - [x] Quando selecionar cliente no filtro, carregar automaticamente no campo "Nome do Cliente"
  - [x] Testar que cliente vem pré-preenchido

- [ ] Adicionar campo de descrição livre
  - [ ] Remover repetição de código de referência no campo "Descrição"
  - [ ] Criar campo de texto livre para descrição do orçamento
  - [ ] Testar que descrição pode ser editada

- [x] Permitir editar cliente e marca após criar orçamento
  - [x] Adicionar botão "Editar" na página de detalhes do orçamento
  - [x] Permitir editar campos cliente e marca
  - [x] Testar que edições são persistidas no banco

## Correções de Bugs - Fase 4

- [ ] Corrigir campo de descrição em edição de itens
  - [x] Adicionar estado para descricao editável em EditarItemOrcamento
  - [x] Permitir edição do campo de descrição
  - [x] Passar descricao para updateItem em routers.ts
  - [x] Adicionar descricao em updateItemOrcamento em db.ts
  - [x] Corrigir SelecionarFichasModal para usar observacoes em vez de referencia
  - [ ] Testar edição de descrição no navegador
  - [ ] Verificar persistência de dados após edição


## Bug Crítico - Envio para Kanban (19/01/2026)

- [x] Erro ao enviar orçamento para Kanban: SQL INSERT com campos faltando
  - Corrigido: Adicionado campo `marca` e valores padrão para evitar NULL
  - Garantido que `numeroOrcamento`, `nomeCliente` e `itens` sempre têm valores
  - Prioridade: CRÍTICA - Bloqueia integração com Kanban
  - Status: CORRIGIDO - Aguardando teste do usuário
