import { NextRequest, NextResponse } from 'next/server';

interface LeadContext {
  companyName?: string;
  contactName?: string;
  contactJob?: string;
  segment?: string;
  bottleneck?: string;
  stage?: string;
  estimatedValue?: number;
}

interface RequestBody {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  leadContext?: LeadContext;
  channel?: 'whatsapp' | 'linkedin' | 'email' | 'objection' | 'spin' | 'chat';
  customInstruction?: string;
}

const HERMES_SYSTEM_PROMPT = `Você é o HERMES AGENT, o Copilot Especialista em Vendas Consultivas B2B e Diagnóstico de Processos da Nexus Flow Tech.

Sua missão é ajudar os consultores comerciais da Nexus a criarem abordagens de altíssima conversão para Leads e Decisores (CEOs, Diretores de Operações, CFOs, CTOs).

### Regras de Ouro da Abordagem Consultiva Nexus:
1. **Nunca pareça um vendedor chato ou agressivo**: Não faça pitches genéricos de "somos líderes de mercado".
2. **Foco no Gargalo Operacional**: Toda mensagem deve tocar em dores reais de processos (ex: retrabalho com planilhas, falta de integração entre sistemas, dados descentralizados, perda de margem operacional).
3. **Proposta de Baixo Atrito**: O objetivo nunca é vender um contrato de imediato, mas sim propor um **Pré-Diagnóstico Técnico ou Bate-papo de 10 a 15 minutos**.
4. **Tom Executivo & Humano**: Seja direto, profissional, empático e focado no segmento do cliente.
5. **Formatação Impecável**: Use quebras de linha limpas, destaques em negrito nas palavras-chave e chamadas para ação (CTA) claras.`;

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { messages, leadContext, channel = 'chat', customInstruction } = body;

    const apiKey = process.env.HERMES_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const apiUrl = process.env.HERMES_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    const model = process.env.HERMES_MODEL || 'nousresearch/hermes-3-llama-3.1-70b-instruct:free';

    // Montar o contexto detalhado do Lead
    let contextPrompt = '';
    if (leadContext) {
      contextPrompt = `\n\n[CONTEXTO DO LEAD ATUAL]:
- Empresa: ${leadContext.companyName || 'Empresa em prospecção'}
- Decisor / Cargo: ${leadContext.contactName || 'Decisor'} (${leadContext.contactJob || 'Diretoria'})
- Segmento de Atuação: ${leadContext.segment || 'Geral'}
- Gargalo / Dor Principal: ${leadContext.bottleneck || 'Processos manuais, planilhas e falta de integração'}
- Canal de Abordagem Desejado: ${channel.toUpperCase()}`;
    }

    // Se houver chave configurada, chamamos a API do Hermes
    if (apiKey) {
      const hermesMessages = [
        { role: 'system', content: HERMES_SYSTEM_PROMPT + contextPrompt },
        ...messages,
      ];

      if (customInstruction) {
        hermesMessages.push({ role: 'user', content: customInstruction });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'CRM Nexus Hermes Copilot',
        },
        body: JSON.stringify({
          model,
          messages: hermesMessages,
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyContent = data.choices?.[0]?.message?.content;
        if (replyContent) {
          return NextResponse.json({
            content: replyContent,
            source: 'hermes_api',
            model,
          });
        }
      }
    }

    // Fallback Heurístico Inteligente se nenhuma chave externa estiver configurada
    const comp = leadContext?.companyName || 'sua empresa';
    const cont = leadContext?.contactName || 'Gestor';
    const cargo = leadContext?.contactJob || 'Diretoria';
    const seg = leadContext?.segment || 'do setor';
    const dor = leadContext?.bottleneck || 'processos manuais em planilhas e falta de integração';

    let fallbackReply = '';
    if (channel === 'whatsapp') {
      fallbackReply = `Olá ${cont}, tudo bem? Aqui é o consultor especialista da Nexus Flow Tech.\n\nEstive analisando a estrutura operacional da **${comp}** no setor de ${seg} e notei que muitas empresas enfrentam um desafio central: **${dor}**.\n\nRecentemente mapeamos um cenário similar e estruturamos um fluxo automatizado que eliminou mais de 15h semanais de retrabalho na equipe.\n\nFaz sentido batermos um papo rápido de 10 minutos esta semana para você conhecer como identificamos esses gargalos na prática?`;
    } else if (channel === 'linkedin') {
      fallbackReply = `Olá ${cont}, espero que esteja tendo uma excelente semana!\n\nAcompanho seu trabalho à frente da área de **${cargo}** na **${comp}** e me chamou atenção a relevância da empresa no mercado de ${seg}.\n\nNa Nexus Flow, ajudamos executivos C-Level a eliminarem perdas invisíveis causadas por **${dor}**, conectando sistemas e automatizando fluxos críticos.\n\nCompartilhamos recentemente um benchmark sobre ganho de margem e redução de custos operacionais. Você teria 15 minutos na quinta ou sexta-feira para um café virtual rápido?`;
    } else if (channel === 'email') {
      fallbackReply = `Assunto: Eficiência operacional e processos na ${comp}\n\nOlá ${cont},\n\nAcompanhando o crescimento da **${comp}** no segmento de ${seg}, imagino que manter a agilidade das operações sem sobrecarregar a equipe seja uma prioridade estratégica para você como ${cargo}.\n\nConversando com empresas do mesmo setor, um ponto frequente de atrito é **${dor}**, o que costuma gerar perda de produtividade e falta de visibilidade em tempo real.\n\nAqui na Nexus, oferecemos um **Pré-Diagnóstico Técnico de 15 minutos**, onde mapeamos os pontos de atrito de processos e calculamos a economia potencial com integrações inteligentes.\n\nVocê teria disponibilidade para um alinhamento rápido nesta quarta ou quinta-feira?\n\nAtenciosamente,\nConsultor Nexus Flow Tech`;
    } else {
      const userLastMessage = messages[messages.length - 1]?.content || '';
      fallbackReply = `💡 **Hermes Agent (Análise Consultiva para ${comp})**:\n\nCom base no seu pedido ("*${userLastMessage}*") para o cargo de **${cargo}** (${seg}):\n\n📌 **Diagnóstico Estratégico**:\nExecutivos de ${seg} respondem com muito mais aderência quando a conversa inicia por indicadores de perda operacional (${dor}) em vez de funcionalidades técnicas.\n\n💬 **Sugestão de Fala/Abordagem**:\n"Olá ${cont}, acompanhando empresas de ${seg}, percebemos que o maior desafio de ${cargo} é manter as decisões rápidas sem depender de consolidação manual em planilhas. Na ${comp}, como vocês estão lidando com ${dor}? Temos um modelo enxuto de 10 min para te mostrar como resolver isso."`;
    }

    return NextResponse.json({
      content: fallbackReply,
      source: 'hermes_heuristic',
      model: 'hermes-3-local-engine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao processar com Hermes Agent' },
      { status: 500 }
    );
  }
}
