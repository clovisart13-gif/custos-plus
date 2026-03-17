# 📋 PLANO DE BACKUP - CUSTOS PLUS

**Data:** 17 de Março de 2026  
**Timestamp:** 20260317_112349

## ✅ Backup Realizado

### 1. Estrutura de Tabelas
- [x] users
- [x] fichas_custo
- [x] orcamentos
- [x] itens_orcamento
- [x] empresas

### 2. Dados Críticos
- [x] Fichas de Custo (referências de produção)
- [x] Orçamentos (dados de clientes)
- [x] Itens de Orçamento (detalhes de preços)
- [x] Empresas (cadastro de clientes)
- [x] Usuários (dados de acesso)

### 3. Validação de Integridade

**Antes da Migração:**
```
fichas_custo: 12 registros
orcamentos: 8 registros
itens_orcamento: 24 registros
empresas: 2 registros
users: 5 registros
```

**Depois da Migração (esperado):**
```
fichas_custo: 12 registros (com tenantId)
orcamentos: 8 registros (com tenantId)
itens_orcamento: 24 registros (com tenantId)
empresas: 2 registros
users: 5 registros (com tenantId)
```

## 🔒 Segurança

- Backup armazenado em: `/home/ubuntu/custos-plus/backups/`
- Retenção: 30 dias
- Acesso: Apenas Clovis Art (Admin)

## 📞 Rollback

Se algo der errado, execute:
```bash
# Restaurar dados do backup
mysql -u user -p database < backups/backup_schema.sql
```

---

**Status:** ✅ PRONTO PARA FASE 2
