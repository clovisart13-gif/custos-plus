#!/usr/bin/env node
/**
 * Script de Migração: Adicionar tenantId a todas as chamadas de banco de dados
 * Propósito: Atualizar routers.ts para passar ctx.user.tenantId em todas as queries
 * Segurança: Fazer backup antes de executar
 */

import fs from 'fs';
import path from 'path';

const routersPath = path.resolve('./server/routers.ts');
const backupPath = path.resolve('./server/routers.ts.backup');

// Ler o arquivo
let content = fs.readFileSync(routersPath, 'utf-8');

// Fazer backup
fs.writeFileSync(backupPath, content);
console.log(`✅ Backup criado: ${backupPath}`);

// Padrões de substituição
const replacements = [
  // getFichasCustoByUser(ctx.user.id) → getFichasCustoByUser(ctx.user.id, ctx.user.tenantId)
  {
    find: /db\.getFichasCustoByUser\(ctx\.user\.id\)/g,
    replace: 'db.getFichasCustoByUser(ctx.user.id, ctx.user.tenantId)',
    desc: 'getFichasCustoByUser'
  },
  // getFichaCustoById(input.id, ctx.user.id) → getFichaCustoById(input.id, ctx.user.id, ctx.user.tenantId)
  {
    find: /db\.getFichaCustoById\(([^,]+),\s*ctx\.user\.id\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.getFichaCustoById($1, ctx.user.id, ctx.user.tenantId)',
    desc: 'getFichaCustoById'
  },
  // updateFichaCusto(id, ctx.user.id, convertedData) → updateFichaCusto(id, ctx.user.id, ctx.user.tenantId, convertedData)
  {
    find: /db\.updateFichaCusto\(([^,]+),\s*ctx\.user\.id,\s*([^)]+)\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.updateFichaCusto($1, ctx.user.id, ctx.user.tenantId, $2)',
    desc: 'updateFichaCusto'
  },
  // deleteFichaCusto(input.id, ctx.user.id) → deleteFichaCusto(input.id, ctx.user.id, ctx.user.tenantId)
  {
    find: /db\.deleteFichaCusto\(([^,]+),\s*ctx\.user\.id\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.deleteFichaCusto($1, ctx.user.id, ctx.user.tenantId)',
    desc: 'deleteFichaCusto'
  },
  // getOrcamentosByUser(ctx.user.id) → getOrcamentosByUser(ctx.user.id, ctx.user.tenantId)
  {
    find: /db\.getOrcamentosByUser\(ctx\.user\.id\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.getOrcamentosByUser(ctx.user.id, ctx.user.tenantId)',
    desc: 'getOrcamentosByUser'
  },
  // getOrcamentoById(input.orcamentoId, ctx.user.id) → getOrcamentoById(input.orcamentoId, ctx.user.id, ctx.user.tenantId)
  {
    find: /db\.getOrcamentoById\(([^,]+),\s*ctx\.user\.id\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.getOrcamentoById($1, ctx.user.id, ctx.user.tenantId)',
    desc: 'getOrcamentoById'
  },
  // updateOrcamento(input.orcamentoId, ctx.user.id, data) → updateOrcamento(input.orcamentoId, ctx.user.id, ctx.user.tenantId, data)
  {
    find: /db\.updateOrcamento\(([^,]+),\s*ctx\.user\.id,\s*([^)]+)\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.updateOrcamento($1, ctx.user.id, ctx.user.tenantId, $2)',
    desc: 'updateOrcamento'
  },
  // deleteOrcamento(input.id, ctx.user.id) → deleteOrcamento(input.id, ctx.user.id, ctx.user.tenantId)
  {
    find: /db\.deleteOrcamento\(([^,]+),\s*ctx\.user\.id\)(?!,\s*ctx\.user\.tenantId)/g,
    replace: 'db.deleteOrcamento($1, ctx.user.id, ctx.user.tenantId)',
    desc: 'deleteOrcamento'
  },
];

// Aplicar substituições
let changeCount = 0;
replacements.forEach(({ find, replace, desc }) => {
  const matches = content.match(find);
  if (matches) {
    changeCount += matches.length;
    console.log(`  ✅ ${desc}: ${matches.length} ocorrência(s)`);
  }
  content = content.replace(find, replace);
});

// Adicionar validação de tenantId (if (!ctx.user?.tenantId)) antes das operações
// Isso é feito manualmente, pois é mais seguro

// Salvar arquivo atualizado
fs.writeFileSync(routersPath, content);

console.log(`\n✅ MIGRAÇÃO CONCLUÍDA!`);
console.log(`   Total de mudanças: ${changeCount}`);
console.log(`   Arquivo: ${routersPath}`);
console.log(`\n⚠️  PRÓXIMOS PASSOS:`);
console.log(`   1. Verificar erros de TypeScript: pnpm tsc --noEmit`);
console.log(`   2. Se houver erros, restaurar backup: cp ${backupPath} ${routersPath}`);
console.log(`   3. Adicionar validações de tenantId manualmente se necessário`);
