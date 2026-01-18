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
- [ ] Adicionar exportação para PDF
- [x] Adicionar botão de impressão
- [ ] Melhorar layout PDF para mostrar claramente cada ficha como item separado
- [ ] Implementar botão Editar Markup para mudar markup de itens em tempo real

### Geração Simplificada (NOVO FLUXO)
- [x] Simplificar modal para criar orçamento INDIVIDUAL
- [x] Criar formulario para adicionar itens manualmente
- [x] Permitir editar descricao, valor unitario e quantidade de cada item
- [ ] Permitir deletar itens do orcamento (PRÓXIMA TAREFA - Autorizado para amanhã)
- [x] Testar fluxo completo de criacao e edicao

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
