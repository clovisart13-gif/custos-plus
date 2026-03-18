# 📋 Integração Custos Plus → Kanban R2PB

## Estrutura de Dados do Orçamento

### 1. TABELA: Orçamento (orcamentos)

```typescript
interface Orcamento {
  // Identificadores
  id: number;                          // ID único do orçamento
  userId: number;                      // ID do usuário que criou
  numeroOrcamento: string;             // Ex: "ORQ-1768709928702" (ÚNICO)
  
  // Informações do Cliente
  nomeCliente: string;                 // Nome do cliente
  marca: string;                       // Marca/Coleção
  
  // Datas e Prazos
  dataEmissao: Date;                   // Data de criação do orçamento
  validade: number;                    // Dias de validade (padrão: 30)
  prazoDias: number;                   // Prazo de entrega em dias (padrão: 30)
  
  // Totalizações
  totalPecas: number;                  // Quantidade total de peças
  subtotal: decimal;                   // Soma dos valores dos itens
  total: decimal;                      // Total final (igual ao subtotal)
  
  // Condições de Pagamento
  percentualSinal: decimal;            // % do sinal (padrão: 25%)
  percentualRetirada: decimal;         // % da retirada (padrão: 25%)
  percentualPrazo: decimal;            // % do prazo (padrão: 50%)
  
  // Status
  status: "pendente" | "aprovado" | "reprovado";
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. TABELA: Itens do Orçamento (itensOrcamento)

```typescript
interface ItemOrcamento {
  // Identificadores
  id: number;                          // ID único do item
  orcamentoId: number;                 // ID do orçamento (FK)
  fichaId: number;                     // ID da ficha de custo (FK)
  
  // Informações do Produto
  referencia: string;                  // Código de referência do produto
  descricao: string;                   // Descrição do produto
  
  // Quantidades e Valores
  quantidade: number;                  // Quantidade de peças
  custo: decimal;                      // Custo unitário (da ficha de custo)
  valorUnitario: decimal;              // Valor unitário de venda
  valorTotal: decimal;                 // Valor total (valorUnitario × quantidade)
  
  // Markup
  markupDivisor: decimal;              // Divisor de markup (0.40, 0.50 ou 0.60)
  
  // Timestamps
  createdAt: Date;
}
```

---

## 📤 Payload JSON para Enviar ao Kanban

Quando um orçamento é **APROVADO**, enviar este JSON:

```json
{
  "pedido": {
    "id_origem": "ORQ-1768709928702",
    "tipo_origem": "orcamento",
    "status": "aprovado",
    
    "cliente": {
      "nome": "Cliente Teste Final",
      "marca": "Coleção Verão 2026"
    },
    
    "datas": {
      "data_pedido": "2026-01-18T23:24:00Z",
      "data_entrega": "2026-02-17",
      "prazo_dias": 30
    },
    
    "financeiro": {
      "total_pecas": 225,
      "subtotal": 9956.25,
      "total": 9956.25,
      "condicoes_pagamento": {
        "sinal_percentual": 25,
        "sinal_valor": 2489.06,
        "retirada_percentual": 25,
        "retirada_valor": 2489.06,
        "prazo_percentual": 50,
        "prazo_valor": 4978.13
      }
    },
    
    "itens": [
      {
        "id_item": 1,
        "referencia": "Camiseta Verão 2026",
        "descricao": "Camiseta Verão 2026",
        "quantidade": 150,
        "valor_unitario": 50.00,
        "valor_total": 7500.00,
        "markup_divisor": 0.50
      },
      {
        "id_item": 2,
        "referencia": "Bermuda Praia",
        "descricao": "Bermuda Praia",
        "quantidade": 75,
        "valor_unitario": 32.75,
        "valor_total": 2456.25,
        "markup_divisor": 0.50
      }
    ]
  }
}
```

---

## 🔄 Campos Recomendados para Tabela "Pedidos" no Kanban

Para sincronização perfeita, a tabela de pedidos do Kanban deve ter:

```typescript
interface PedidoKanban {
  // Identificadores
  id: number;                          // ID único do pedido no Kanban
  id_orcamento: string;                // Referência ao orçamento (numeroOrcamento)
  
  // Cliente
  nome_cliente: string;
  marca_colecao: string;
  
  // Datas
  data_pedido: Date;
  data_entrega: Date;
  prazo_dias: number;
  
  // Totalizações
  total_pecas: number;
  total_valor: decimal;
  
  // Condições de Pagamento
  valor_sinal: decimal;
  valor_retirada: decimal;
  valor_prazo: decimal;
  
  // Status do Pedido
  status: "pendente" | "em_producao" | "pronto" | "entregue" | "cancelado";
  
  // Itens (relacionamento)
  itens: PedidoItemKanban[];
  
  // Timestamps
  criado_em: Date;
  atualizado_em: Date;
}

interface PedidoItemKanban {
  id: number;
  pedido_id: number;
  referencia: string;
  descricao: string;
  quantidade: number;
  valor_unitario: decimal;
  valor_total: decimal;
  status_item: "pendente" | "cortado" | "costurado" | "acabado" | "pronto";
}
```

---

## ⚠️ Campos que Podem Estar Faltando no Kanban

Para sincronização completa, verifique se o Kanban tem:

| Campo | Tipo | Descrição | Obrigatório? |
|-------|------|-----------|-------------|
| `id_orcamento` | string | Referência ao orçamento de origem | ✅ SIM |
| `marca_colecao` | string | Marca/Coleção do pedido | ✅ SIM |
| `data_entrega` | date | Data prometida de entrega | ✅ SIM |
| `prazo_dias` | int | Prazo em dias | ✅ SIM |
| `valor_sinal` | decimal | Valor do sinal (25%) | ✅ SIM |
| `valor_retirada` | decimal | Valor da retirada (25%) | ✅ SIM |
| `valor_prazo` | decimal | Valor do prazo (50%) | ✅ SIM |
| `total_pecas` | int | Total de peças do pedido | ✅ SIM |
| `markup_divisor` | decimal | Markup de cada item | ⚠️ RECOMENDADO |

---

## 🚀 Fluxo de Integração

```
1. Usuário aprova orçamento no Custos Plus
   ↓
2. Sistema envia POST para API do Kanban
   ↓
3. Kanban cria novo pedido com status "pendente"
   ↓
4. Kanban cria itens do pedido
   ↓
5. Kanban retorna ID do pedido criado
   ↓
6. Custos Plus salva referência ao pedido (opcional)
   ↓
7. Usuário vê pedido no Kanban automaticamente
```

---

## 📝 Exemplo de Código TypeScript para Enviar

```typescript
// No Custos Plus - server/routers.ts
async function enviarParaKanban(orcamento: Orcamento, itens: ItemOrcamento[]) {
  const payload = {
    pedido: {
      id_origem: orcamento.numeroOrcamento,
      tipo_origem: "orcamento",
      status: "aprovado",
      
      cliente: {
        nome: orcamento.nomeCliente,
        marca: orcamento.marca
      },
      
      datas: {
        data_pedido: orcamento.dataEmissao,
        data_entrega: new Date(
          Date.now() + orcamento.prazoDias * 24 * 60 * 60 * 1000
        ),
        prazo_dias: orcamento.prazoDias
      },
      
      financeiro: {
        total_pecas: orcamento.totalPecas,
        subtotal: orcamento.subtotal,
        total: orcamento.total,
        condicoes_pagamento: {
          sinal_percentual: orcamento.percentualSinal,
          sinal_valor: (orcamento.total * orcamento.percentualSinal) / 100,
          retirada_percentual: orcamento.percentualRetirada,
          retirada_valor: (orcamento.total * orcamento.percentualRetirada) / 100,
          prazo_percentual: orcamento.percentualPrazo,
          prazo_valor: (orcamento.total * orcamento.percentualPrazo) / 100
        }
      },
      
      itens: itens.map(item => ({
        id_item: item.id,
        referencia: item.referencia,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario,
        valor_total: item.valorTotal,
        markup_divisor: item.markupDivisor
      }))
    }
  };
  
  // Enviar para API do Kanban
  const response = await fetch(
    process.env.KANBAN_API_URL + "/pedidos/criar",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.KANBAN_API_KEY}`
      },
      body: JSON.stringify(payload)
    }
  );
  
  return response.json();
}
```

---

## ✅ Checklist para Integração

- [ ] Kanban tem endpoint `/pedidos/criar` para receber pedidos
- [ ] Kanban tem campos: `id_orcamento`, `marca_colecao`, `data_entrega`, `prazo_dias`
- [ ] Kanban tem campos de pagamento: `valor_sinal`, `valor_retirada`, `valor_prazo`
- [ ] Kanban tem tabela de itens com campos: `referencia`, `descricao`, `quantidade`, `valor_unitario`, `valor_total`
- [ ] Custos Plus tem rota para aprovar orçamento e chamar Kanban
- [ ] Ambos os sistemas têm variáveis de ambiente configuradas
- [ ] Teste de integração realizado com sucesso

---

## 📞 Próximas Etapas

1. **Você confirma quais campos faltam no Kanban?**
2. **Qual é a URL da API do Kanban?**
3. **Qual é a chave de autenticação (API Key)?**
4. Depois implementamos a integração completa!
