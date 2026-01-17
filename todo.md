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
- [ ] Botão "Gerar Orçamento" na página de Fichas de Custo
- [ ] Melhorar clareza visual: deixar evidente que múltiplas fichas podem virar um orçamento

### Visualização e Exportação
- [x] Criar página de visualização de orçamento
- [x] Implementar layout conforme mockup aprovado
- [ ] Adicionar exportação para PDF
- [x] Adicionar botão de impressão
- [ ] Melhorar layout PDF para mostrar claramente cada ficha como item separado

### Testes
- [x] Testar geração de orçamento (7 testes passando)
- [ ] Testar cálculos de preço
- [ ] Testar exportação para PDF
