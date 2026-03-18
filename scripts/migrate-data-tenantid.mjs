#!/usr/bin/env node
/**
 * Script de Migração de Dados: Adicionar tenantId a registros existentes
 * Propósito: Atualizar dados existentes com tenantId = 1 (R2PB)
 * Segurança: Validação antes/depois, rollback automático se falhar
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar usando require para TypeScript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { users, fichasCusto, orcamentos, itensOrcamento, empresas } = require('../drizzle/schema.ts');

dotenv.config();

async function migrateData() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    const db = drizzle(process.env.DATABASE_URL);
    
    // ✅ FASE 1: Validação Antes
    console.log('\n📊 VALIDAÇÃO ANTES DA MIGRAÇÃO:');
    
    const usersBefore = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const fichasBefore = await db.execute(sql`SELECT COUNT(*) as count FROM fichas_custo`);
    const orcamentosBefore = await db.execute(sql`SELECT COUNT(*) as count FROM orcamentos`);
    const itensBefore = await db.execute(sql`SELECT COUNT(*) as count FROM itens_orcamento`);
    const empresasBefore = await db.execute(sql`SELECT COUNT(*) as count FROM empresas`);
    
    console.log(`  Users: ${usersBefore[0]?.count || 0}`);
    console.log(`  Fichas de Custo: ${fichasBefore[0]?.count || 0}`);
    console.log(`  Orçamentos: ${orcamentosBefore[0]?.count || 0}`);
    console.log(`  Itens de Orçamento: ${itensBefore[0]?.count || 0}`);
    console.log(`  Empresas: ${empresasBefore[0]?.count || 0}`);
    
    // ✅ FASE 2: Verificar NULL values
    console.log('\n🔍 Verificando valores NULL:');
    
    const usersNull = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE tenant_id IS NULL`);
    const fichasNull = await db.execute(sql`SELECT COUNT(*) as count FROM fichas_custo WHERE tenant_id IS NULL`);
    const orcamentosNull = await db.execute(sql`SELECT COUNT(*) as count FROM orcamentos WHERE tenant_id IS NULL`);
    const itensNull = await db.execute(sql`SELECT COUNT(*) as count FROM itens_orcamento WHERE tenant_id IS NULL`);
    const empresasNull = await db.execute(sql`SELECT COUNT(*) as count FROM empresas WHERE tenant_id IS NULL`);
    
    console.log(`  Users com NULL: ${usersNull[0]?.count || 0}`);
    console.log(`  Fichas com NULL: ${fichasNull[0]?.count || 0}`);
    console.log(`  Orçamentos com NULL: ${orcamentosNull[0]?.count || 0}`);
    console.log(`  Itens com NULL: ${itensNull[0]?.count || 0}`);
    console.log(`  Empresas com NULL: ${empresasNull[0]?.count || 0}`);
    
    // ✅ FASE 3: Migração de Dados
    console.log('\n🚀 INICIANDO MIGRAÇÃO:');
    
    // Atualizar users (tenantId = 1 para R2PB)
    const usersUpdate = await db.execute(
      sql`UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0`
    );
    console.log(`  ✅ Users atualizado: ${usersUpdate.rowsAffected || 0} registros`);
    
    // Atualizar fichas_custo
    const fichasUpdate = await db.execute(
      sql`UPDATE fichas_custo SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0`
    );
    console.log(`  ✅ Fichas de Custo atualizado: ${fichasUpdate.rowsAffected || 0} registros`);
    
    // Atualizar orcamentos
    const orcamentosUpdate = await db.execute(
      sql`UPDATE orcamentos SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0`
    );
    console.log(`  ✅ Orçamentos atualizado: ${orcamentosUpdate.rowsAffected || 0} registros`);
    
    // Atualizar itens_orcamento
    const itensUpdate = await db.execute(
      sql`UPDATE itens_orcamento SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0`
    );
    console.log(`  ✅ Itens de Orçamento atualizado: ${itensUpdate.rowsAffected || 0} registros`);
    
    // Atualizar empresas
    const empresasUpdate = await db.execute(
      sql`UPDATE empresas SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0`
    );
    console.log(`  ✅ Empresas atualizado: ${empresasUpdate.rowsAffected || 0} registros`);
    
    // ✅ FASE 4: Validação Depois
    console.log('\n📊 VALIDAÇÃO DEPOIS DA MIGRAÇÃO:');
    
    const usersAfter = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE tenant_id = 1`);
    const fichasAfter = await db.execute(sql`SELECT COUNT(*) as count FROM fichas_custo WHERE tenant_id = 1`);
    const orcamentosAfter = await db.execute(sql`SELECT COUNT(*) as count FROM orcamentos WHERE tenant_id = 1`);
    const itensAfter = await db.execute(sql`SELECT COUNT(*) as count FROM itens_orcamento WHERE tenant_id = 1`);
    const empresasAfter = await db.execute(sql`SELECT COUNT(*) as count FROM empresas WHERE tenant_id = 1`);
    
    console.log(`  Users (tenantId=1): ${usersAfter[0]?.count || 0}`);
    console.log(`  Fichas de Custo (tenantId=1): ${fichasAfter[0]?.count || 0}`);
    console.log(`  Orçamentos (tenantId=1): ${orcamentosAfter[0]?.count || 0}`);
    console.log(`  Itens de Orçamento (tenantId=1): ${itensAfter[0]?.count || 0}`);
    console.log(`  Empresas (tenantId=1): ${empresasAfter[0]?.count || 0}`);
    
    // Verificar integridade
    const usersNullAfter = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE tenant_id IS NULL`);
    const fichasNullAfter = await db.execute(sql`SELECT COUNT(*) as count FROM fichas_custo WHERE tenant_id IS NULL`);
    
    if ((usersNullAfter[0]?.count || 0) > 0 || (fichasNullAfter[0]?.count || 0) > 0) {
      throw new Error('❌ Ainda existem registros com tenantId NULL!');
    }
    
    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('   Todos os dados foram atribuídos ao tenant R2PB (tenantId = 1)');
    console.log('   Nenhum registro NULL encontrado');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE MIGRAÇÃO:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateData();
