import { describe, expect, it } from 'vitest';

import { mapSupabaseToOpportunity } from './crm-service';

/**
 * `estimated_revenue_tier` é uma afirmação sobre o cliente, não um campo
 * obrigatório de exibição: a coluna é `TEXT` nullable no schema e o tipo TS
 * marca como opcional. Ausência é um valor legítimo — 'não sabemos' é
 * diferente de 'fatura entre R$ 15 mi e R$ 50 mi'.
 *
 * O que estes testes travam é a regra do outro lado: a hidratação não pode
 * transformar silêncio em dado. Um lead sem tier gravado voltava do banco
 * exibindo uma faixa de faturamento que ninguém informou, e essa faixa
 * alimenta filtro e ordenação do funil — o erro deixa de ser cosmético
 * quando alguém decide sobre ele.
 */
const LINHA_SEM_TIER = {
  id: 'a1b2c3d4-0000-4000-8000-000000000001',
  company_id: 'a1b2c3d4-0000-4000-8000-000000000002',
  company: { corporate_name: 'Empresa Sem Tier' },
};

describe('mapSupabaseToOpportunity — estimated_revenue_tier', () => {
  it('preserva o valor quando a empresa tem um tier gravado', () => {
    const opp = mapSupabaseToOpportunity({
      ...LINHA_SEM_TIER,
      company: { corporate_name: 'Empresa Com Tier', estimated_revenue_tier: 'acima_50m' },
    });

    expect(opp.estimatedRevenueTier).toBe('acima_50m');
  });

  it('deixa indefinido quando a coluna é NULL, em vez de inventar uma faixa', () => {
    const opp = mapSupabaseToOpportunity({
      ...LINHA_SEM_TIER,
      company: { corporate_name: 'Empresa Sem Tier', estimated_revenue_tier: null },
    });

    expect(opp.estimatedRevenueTier).toBeUndefined();
  });

  it('deixa indefinido quando a coluna não existe na linha', () => {
    const opp = mapSupabaseToOpportunity(LINHA_SEM_TIER);

    expect(opp.estimatedRevenueTier).toBeUndefined();
  });

  it('rejeita um valor forjado que nao pertence ao enum, sem cair numa faixa real', () => {
    const opp = mapSupabaseToOpportunity({
      ...LINHA_SEM_TIER,
      company: {
        corporate_name: 'Empresa Com Lixo',
        // `acima_500m` é uma faixa de `RevenueBracket` (o formulário de 6
        // opções), não de `RevenueTier` (5). Uma linha com esse valor veio
        // de fora do contrato e não pode virar uma faixa do funil.
        estimated_revenue_tier: 'acima_500m',
      },
    });

    expect(opp.estimatedRevenueTier).toBeUndefined();
  });

  it('aceita as cinco faixas do enum, incluindo a colisao de 15m_a_50m', () => {
    const faixas = ['ate_360k', '360k_a_4_8m', '4_8m_a_15m', '15m_a_50m', 'acima_50m'] as const;

    faixas.forEach((tier) => {
      const opp = mapSupabaseToOpportunity({
        ...LINHA_SEM_TIER,
        company: { corporate_name: 'Empresa', estimated_revenue_tier: tier },
      });

      expect(opp.estimatedRevenueTier).toBe(tier);
    });
  });
});
