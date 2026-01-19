export async function updateOrcamentoPercentuais(
  orcamentoId: number,
  prazoDias?: number,
  percentualSinal?: number,
  percentualRetirada?: number,
  percentualPrazo?: number,
  prazoEntregaTexto?: string
) {
  console.log("[updateOrcamentoPercentuais] Chamada com:", {
    orcamentoId,
    prazoDias,
    percentualSinal,
    percentualRetirada,
    percentualPrazo,
    prazoEntregaTexto
  });
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};

  if (prazoDias !== undefined) {
    updateData.prazoDias = prazoDias;
  }
  if (prazoEntregaTexto !== undefined) {
    updateData.prazoEntregaTexto = prazoEntregaTexto;
  }
  if (percentualSinal !== undefined) {
    updateData.percentualSinal = percentualSinal;
  }
  if (percentualRetirada !== undefined) {
    updateData.percentualRetirada = percentualRetirada;
  }
  if (percentualPrazo !== undefined) {
    updateData.percentualPrazo = percentualPrazo;
  }

  if (Object.keys(updateData).length === 0) {
    console.log("[updateOrcamentoPercentuais] Nenhum dado para atualizar");
    return { success: true };
  }

  console.log("[updateOrcamentoPercentuais] Dados a atualizar:", updateData);
  console.log("[updateOrcamentoPercentuais] OrcamentoId:", orcamentoId);

  const result = await db
    .update(orcamentos)
    .set(updateData)
    .where(eq(orcamentos.id, orcamentoId));

  console.log("[updateOrcamentoPercentuais] Resultado da atualização:", result);

  // Verificar se a atualização foi bem-sucedida
  const verificacao = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId))
    .limit(1);
  
  console.log("[updateOrcamentoPercentuais] Verificação pós-atualização:", verificacao[0]);

  return { success: true };
}
