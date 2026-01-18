    custosMediosPorFamilia: protectedProcedure.query(async ({ ctx }) => {
      const fichas = await db.getFichasCustoByUser(ctx.user.id);
      
      const familias = new Map<string, any>();
      
      fichas.forEach((ficha: any) => {
        if (!familias.has(ficha.familia)) {
          familias.set(ficha.familia, {
            familia: ficha.familia,
            modelagem: 0,
            piloto: 0,
            corte: 0,
            beneficiamento: 0,
            costura: 0,
            lavanderia: 0,
            acabamento: 0,
            passadoria: 0,
            tecido: 0,
            aviamento: 0,
            count: 0,
          });
        }
        
        const familia = familias.get(ficha.familia)!;
        familia.modelagem += ficha.modelagem || 0;
        familia.piloto += ficha.piloto || 0;
        familia.corte += ficha.corte || 0;
        familia.beneficiamento += ficha.beneficiamento || 0;
        familia.costura += ficha.costura || 0;
        familia.lavanderia += ficha.lavanderia || 0;
        familia.acabamento += ficha.acabamento || 0;
        familia.passadoria += ficha.passadoria || 0;
        familia.tecido += ficha.tecido || 0;
        familia.aviamento += ficha.aviamento || 0;
        familia.count += 1;
      });
      
      return Array.from(familias.values()).map((familia: any) => {
        const modelagem = isNaN(familia.modelagem / familia.count) ? 0 : Number((familia.modelagem / familia.count).toFixed(2));
        const piloto = isNaN(familia.piloto / familia.count) ? 0 : Number((familia.piloto / familia.count).toFixed(2));
        const corte = isNaN(familia.corte / familia.count) ? 0 : Number((familia.corte / familia.count).toFixed(2));
        const beneficiamento = isNaN(familia.beneficiamento / familia.count) ? 0 : Number((familia.beneficiamento / familia.count).toFixed(2));
        const costura = isNaN(familia.costura / familia.count) ? 0 : Number((familia.costura / familia.count).toFixed(2));
        const lavanderia = isNaN(familia.lavanderia / familia.count) ? 0 : Number((familia.lavanderia / familia.count).toFixed(2));
        const acabamento = isNaN(familia.acabamento / familia.count) ? 0 : Number((familia.acabamento / familia.count).toFixed(2));
        const passadoria = isNaN(familia.passadoria / familia.count) ? 0 : Number((familia.passadoria / familia.count).toFixed(2));
        const tecido = isNaN(familia.tecido / familia.count) ? 0 : Number((familia.tecido / familia.count).toFixed(2));
        const aviamento = isNaN(familia.aviamento / familia.count) ? 0 : Number((familia.aviamento / familia.count).toFixed(2));
        const totalMedio = modelagem + piloto + corte + beneficiamento + costura + lavanderia + acabamento + passadoria + tecido + aviamento;
        return {
          ...familia,
          modelagem,
          piloto,
          corte,
          beneficiamento,
          costura,
          lavanderia,
          acabamento,
          passadoria,
          tecido,
          aviamento,
          totalMedio: Number(totalMedio.toFixed(2)),
        };
      });
    }),
