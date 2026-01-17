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

## Módulo de Orçamento (Nova Funcionalidade)

### Cálculo de Preço de Venda
- [ ] Implementar cálculo de PV com markup divisor (0,40 / 0,50 / 0,60)
- [ ] Criar função para calcular margem de lucro

### Banco de Dados
- [ ] Criar tabela de orçamentos
- [ ] Adicionar campos: número, data, validade, prazo_entrega, prazo_pagamento, markup_usado, quantidade, observacoes
- [ ] Criar relação entre orçamento e ficha de custo

### Interface - Modal de Geração
- [ ] Adicionar botão "Gerar Orçamento" na tabela de fichas
- [ ] Criar modal com seleção de markup (0,40 / 0,50 / 0,60)
- [ ] Adicionar campos: quantidade, prazo entrega, prazo pagamento
- [ ] Mostrar preview dos 3 valores de PV calculados
- [ ] Implementar salvamento do orçamento

### Interface - Visualização de Orçamento
- [ ] Criar página de visualização de orçamento
- [ ] Design profissional com logo e dados da empresa
- [ ] Tabela com: referência, descrição, quantidade, valor unitário, valor total
- [ ] Seção de condições comerciais
- [ ] Botão de exportar para PDF

### Exportação
- [ ] Implementar geração de PDF do orçamento
- [ ] Adicionar opção de download
- [ ] Adicionar opção de impressão

### Listagem de Orçamentos
- [ ] Criar página para listar todos os orçamentos
- [ ] Adicionar filtros por cliente, data, status
- [ ] Implementar busca por número de orçamento

## Bugs Reportados

- [x] Erro 404 corrigido - visualização de ficha funciona
- [x] Dashboard corrigido - agora mostra todas as 10 colunas (8 etapas de mão-de-obra + Tecido + Aviamento)

## Melhorias Críticas Solicitadas

- [ ] Permitir adicionar campos personalizados de mão-de-obra (bordado, silk, etc.)
- [ ] Remover campos fixos de mão-de-obra e tornar dinâmicos
- [ ] Sincronizar campos entre dashboard e ficha de custo
