'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { crmService } from '@/lib/supabase/crm-service';
import { Opportunity } from '@/types/crm';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Building2,
  UserCheck,
  MessageSquare,
  Mail,
  ShieldAlert,
  HelpCircle,
  PhoneCall,
  Flame,
  RotateCw,
  Search,
  ExternalLink,
  ChevronDown,
  Wand2,
  ArrowRight,
  BookOpen,
  Globe2,
  Users,
  BadgeCheck,
  FileCheck2,
  Loader2,
  MapPin,
  Phone,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

type ChannelMode = 'whatsapp' | 'linkedin' | 'email' | 'objection' | 'spin' | 'public_consult' | 'chat';

interface CopilotChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  channel?: ChannelMode;
}

const SEGMENT_LABELS: Record<string, string> = {
  industria: 'Indústria / Manufatura',
  varejo_ecom: 'Varejo & E-commerce',
  servicos: 'Serviços Corporativos',
  tecnologia: 'Tecnologia / SaaS',
  saude: 'Saúde / Clínicas / Hospitais',
  logistica: 'Logística & Transportes',
  construcao: 'Construção Civil & Engenharia',
  outro: 'Geral / Outros Setores',
};

const OBJECTIONS_LIST = [
  { id: 'already_have', label: '“Já temos sistema / fornecedor atual”' },
  { id: 'no_budget', label: '“Não temos verba / orçamento agora”' },
  { id: 'send_email', label: '“Pode me mandar apresentação por e-mail?”' },
  { id: 'no_time', label: '“Estamos em momento corrido / sem tempo”' },
  { id: 'internal_team', label: '“Nosso time interno resolve isso”' },
];

export function FloatingLeadCopilotWidget() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [activeChannel, setActiveChannel] = useState<ChannelMode>('whatsapp');
  const [selectedObjection, setSelectedObjection] = useState<string>('already_have');

  // Dados do Lead manual ou preenchido via seleção
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactJob, setContactJob] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [segment, setSegment] = useState<string>('industria');
  const [bottleneck, setBottleneck] = useState('');

  // Consulta Pública & Enriquecimento
  const [cnpjInput, setCnpjInput] = useState('');
  const [isSearchingPublic, setIsSearchingPublic] = useState(false);
  const [publicDossier, setPublicDossier] = useState<any>(null);

  // Estados de Chat e Saída
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<CopilotChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      content:
        '👋 Olá! Sou o **Nexus Copilot de Vendas Consultivas**.\n\nSelecione um Lead existente ou faça uma **Consulta Pública (CNPJ & QSA)** para eu gerar mensagens de abordagem personalizadas no WhatsApp, LinkedIn, Cold Email, quebra de objeções ou roteiro de qualificação (SPIN).',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Carregar oportunidades (filtradas pela carteira do consultor ou todas para Admin)
  const loadOpportunities = useCallback(async () => {
    try {
      const data = await crmService.getOpportunities();
      const isAdmin = profile?.role === 'admin_ceo' || profile?.role === 'admin_tech';

      const filtered = (data || []).filter((opp) => {
        if (isAdmin) return true;
        if (!opp.consultantId) return false;
        if (opp.consultantId === profile?.id) return true;
        const pName = (profile?.name || '').toLowerCase().trim();
        const cName = (opp.consultantName || '').toLowerCase().trim();
        if (pName && cName && (cName.includes(pName) || pName.includes(cName))) return true;
        const pFirst = pName.split(' ')[0];
        const cFirst = cName.split(' ')[0];
        if (pFirst && cFirst && pFirst.length > 2 && pFirst === cFirst) return true;
        return false;
      });

      setOpportunities(filtered);

      // Se o lead selecionado não está mais na carteira filtrada, limpa seleção
      setSelectedOppId((prev) => (prev && filtered.some((o) => o.id === prev) ? prev : ''));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      loadOpportunities();
    }
  }, [isOpen, loadOpportunities]);

  // Quando seleciona uma oportunidade do CRM
  const handleSelectOpportunity = (oppId: string) => {
    if (!oppId) {
      setSelectedOppId('');
      return;
    }

    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) {
      toast.error('Este lead não pertence à sua carteira de clientes.');
      setSelectedOppId('');
      return;
    }

    setSelectedOppId(oppId);
    const primaryContact = opp.contacts?.[0];
    setCompanyName(opp.companyName || '');
    setContactName(primaryContact?.name || '');
    setContactJob(primaryContact?.jobTitle || '');
    setContactPhone(primaryContact?.phone || '');
    setSegment(opp.segment || 'industria');
    setBottleneck(opp.qualification?.mainBottleneck || opp.qualification?.mainProblem || '');
    setCnpjInput(opp.cnpj || '');
    toast.info(`Lead "${opp.companyName}" carregado no Copilot!`);

    // Se tiver CNPJ, executa consulta pública automática
    if (opp.cnpj) {
      handlePublicConsultation(opp.cnpj, opp.companyName);
    }
  };

  // Consulta Pública na Receita Federal / BrasilAPI
  const handlePublicConsultation = async (targetCnpj?: string, targetCompName?: string) => {
    const searchCnpj = (targetCnpj || cnpjInput).trim();
    const searchName = (targetCompName || companyName).trim();

    if (!searchCnpj && !searchName) {
      toast.error('Informe um CNPJ ou o Nome da Empresa para consultar');
      return;
    }

    setIsSearchingPublic(true);
    try {
      const res = await fetch('/api/lead-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: searchCnpj,
          companyName: searchName,
        }),
      });

      const json = await res.json();
      if (res.ok && json.dossier) {
        setPublicDossier(json.dossier);
        if (json.data?.nome_fantasia || json.data?.razao_social) {
          setCompanyName(json.data.nome_fantasia || json.data.razao_social);
        }
        if (json.data?.cnpj) {
          setCnpjInput(json.data.cnpj);
        }
        if (json.dossier?.contatos_oficiais?.telefone_principal) {
          setContactPhone(json.dossier.contatos_oficiais.telefone_principal);
        } else if (json.data?.ddd_telefone_1) {
          setContactPhone(json.data.ddd_telefone_1);
        }
        if (json.dossier?.socios && json.dossier.socios.length > 0 && !contactName) {
          setContactName(json.dossier.socios[0].nome_socio);
          setContactJob(json.dossier.socios[0].qualificacao_socio);
        }
        toast.success('Dossiê e contatos do Lead carregados com sucesso!');
      } else {
        toast.error(json.error || 'Não foi possível encontrar dados públicos');
      }
    } catch {
      toast.error('Erro na consulta pública do CNPJ');
    } finally {
      setIsSearchingPublic(false);
    }
  };

  // Importar Sócio do QSA como Decisor do Lead
  const handleSelectPartner = (partnerName: string, role: string) => {
    setContactName(partnerName);
    setContactJob(role);
    toast.success(`Decisor ${partnerName} definido como contato principal!`);
  };

  // Motor de Geração de Abordagens Consultivas
  const generateApproach = (mode: ChannelMode, customPrompt?: string): string => {
    const comp = companyName.trim() || 'sua empresa';
    const cont = contactName.trim() || 'Gestor';
    const cargo = contactJob.trim() || 'Diretoria';
    const segName = SEGMENT_LABELS[segment] || 'no seu segmento';
    const dor =
      bottleneck.trim() ||
      'processos manuais em planilhas e falta de integração entre áreas';

    if (customPrompt) {
      return `💡 **Análise Consultiva Nexus para ${comp}**:\n\nCom base no seu pedido ("*${customPrompt}*") para o cargo de **${cargo}** (${segName}):\n\n📌 **Estratégia Recomendada**:\nAborde destacando o custo oculto de retrabalho em ${dor}. Diretores de ${segName} respondem muito melhor a perguntas diagnósticas sobre eficiência operacional do que a demonstrações de produtos.\n\n💬 **Sugestão de Fala/Texto**:\n"Olá ${cont}, acompanhando empresas de ${segName}, vejo que o maior desafio na área de ${cargo} é manter a sincronia sem depender de retrabalho manual. Na ${comp}, como vocês têm tratado ${dor}? Se fizer sentido, tenho um mapeamento rápido de 10 min sobre como líderes do setor eliminaram esse gargalo."`;
    }

    switch (mode) {
      case 'whatsapp':
        return `Olá ${cont}, tudo bem? Aqui é o ${profile?.name || 'consultor da Nexus Flow'}.\n\nEstive analisando a operação da **${comp}** no setor de ${segName} e notei um padrão que muitas diretorias enfrentam: ${dor}.\n\nRecentemente estruturamos um diagnóstico de automação para uma empresa do mesmo porte e eliminamos mais de 18h semanais de retrabalho na equipe.\n\nFaz sentido batermos um papo rápido de 10 minutos esta semana para eu te mostrar como mapeamos esse gargalo na prática?`;

      case 'linkedin':
        return `Olá ${cont}, espero que esteja tendo uma excelente semana!\n\nVi seu trabalho à frente da área de **${cargo}** na **${comp}** e me chamou atenção a solidez da empresa no mercado de ${segName}.\n\nAqui na Nexus Flow, apoiamos executivos a otimizarem fluxos operacionais, especialmente onde há gargalos com ${dor}.\n\nGostaria de compartilhar com você um benchmark recente que realizamos com empresas do setor sobre ganho de margem e automação de processos.\n\nVocê teria disponibilidade para um café virtual rápido de 15 minutos na quinta ou sexta-feira?`;

      case 'email':
        return `Assunto: Eficiência operacional e processos na ${comp}\n\nOlá ${cont},\n\nAcompanhando o crescimento da **${comp}** no segmento de ${segName}, imagino que manter a fluidez das operações sem sobrecarregar a equipe seja uma prioridade estratégica para você como ${cargo}.\n\nMuitas empresas com as quais conversamos relatam dificuldades semelhantes com **${dor}**, o que costuma gerar perda de produtividade e falta de visibilidade em tempo real.\n\nAqui na Nexus, nós realizamos um Pré-Diagnóstico Técnico sem custo de 20 minutos onde identificamos exatamente onde estão os pontos de atrito e quanto a empresa pode economizar com automações inteligentes.\n\nVocê teria 15 minutos nesta quarta ou quinta-feira para avaliarmos se esse cenário se aplica à ${comp}?\n\nAtenciosamente,\n${profile?.name || 'Consultor Especialista'}\nNexus Flow Tech`;

      case 'objection': {
        if (selectedObjection === 'already_have') {
          return `🛡️ **Quebra de Objeção: "Já temos sistema / fornecedor"**\n\n💬 **Resposta Consultiva Recomendada**:\n"Perfeito ${cont}, inclusive os nossos principais clientes já contavam com sistemas robustos quando conversamos pela primeira vez. Nosso papel na Nexus não é substituir o que vocês já usam com sucesso, mas sim construir as integrações e automações que o sistema atual não cobre — como eliminar as pontes manuais em ${dor}. Vale uma conversa rápida de 10 minutos para você ver como complementamos essa estrutura?"`;
        }
        if (selectedObjection === 'no_budget') {
          return `🛡️ **Quebra de Objeção: "Não temos verba / orçamento agora"**\n\n💬 **Resposta Consultiva Recomendada**:\n"Entendo perfeitamente ${cont}. O objetivo deste primeiro contato nem é falar de contratação de serviço, mas sim de entregar um diagnóstico claro de processos. Em empresas de ${segName}, o custo invisível de manter ${dor} costuma ser muito maior do que o investimento em resolução. Se te provarmos em 15 minutos onde a empresa está perdendo margem, podemos deixar esse plano engatilhado para o próximo ciclo orçamentário. O que acha de quinta-feira às 14h?"`;
        }
        if (selectedObjection === 'send_email') {
          return `🛡️ **Quebra de Objeção: "Pode mandar apresentação por e-mail?"**\n\n💬 **Resposta Consultiva Recomendada**:\n"Com certeza ${cont}, posso te enviar sim! Porém, como não trabalhamos com soluções engessadas de prateleira, nossa apresentação é 100% personalizada para o momento específico da ${comp}. Para eu não te tomar tempo com 20 páginas genéricas, você prefere que eu faça 3 perguntas rápidas agora ou agendamos 10 minutos amanhã para eu te mandar um material cirúrgico sobre ${dor}?"`;
        }
        if (selectedObjection === 'no_time') {
          return `🛡️ **Quebra de Objeção: "Estamos sem tempo / momento corrido"**\n\n💬 **Resposta Consultiva Recomendada**:\n"Compreendo totalmente ${cont}. Inclusive, é exatamente pela correria do dia a dia e pela sobrecarga com ${dor} que diretores de ${segName} nos procuram. Justamente por valorizar seu tempo, nosso diagnóstico é direto ao ponto e dura apenas 15 minutos. Prometo que será a conversa mais objetiva da sua semana. Terça-feira às 09h30 fica viável para você?"`;
        }
        return `🛡️ **Quebra de Objeção: "Time interno resolve"**\n\n💬 **Resposta Consultiva Recomendada**:\n"Excelente ${cont}, ter capacidade técnica interna é um grande diferencial. Nosso modelo funciona justamente em parceria com o time interno, acelerando as entregas com frameworks prontos para que sua equipe não precise reinventar a roda em ${dor}. Vale um alinhamento rápido de 10 min para ver como podemos tirar essa carga da sua equipe técnica?"`;
      }

      case 'spin':
        return `📋 **Roteiro de Qualificação SPIN Selling para ${comp} (${segName})**:\n\n1️⃣ **Situação (S)**:\n• "${cont}, atualmente como a ${comp} gerencia o fluxo de ${dor} no dia a dia?"\n• "Quais ferramentas ou sistemas a equipe utiliza para registrar e acompanhar essas etapas?"\n\n2️⃣ **Problema (P)**:\n• "Onde você sente que ocorrem os maiores atrasos ou gargalos de comunicação entre as áreas?"\n• "Com que frequência a equipe precisa retrabalhar dados ou preencher planilhas manuais?"\n\n3️⃣ **Implicação (I)**:\n• "Quando esse gargalo acontece, qual é o impacto direto no prazo de entrega e no custo operacional da ${comp}?"\n• "Como a diretoria avalia o risco de não ter esses dados centralizados em tempo real?"\n\n4️⃣ **Necessidade de Solução (N)**:\n• "Se conseguíssemos automatizar 100% desse fluxo e dar visibilidade instantânea para você, quanto tempo e custo sua equipe economizaria mensalmente?"\n• "Faz sentido agendarmos o Diagnóstico Técnico da Nexus para mapearmos essa solução em detalhes?"`;

      default:
        return 'Geração concluída.';
    }
  };

  // Gerar mensagem inicial para o canal via Hermes Agent
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: activeChannel,
          leadContext: {
            companyName,
            contactName,
            contactJob,
            segment,
            bottleneck,
          },
          messages: [
            {
              role: 'user',
              content: `Gere uma abordagem de alto impacto no canal ${activeChannel} para este lead.`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `gen_${Date.now()}`,
            sender: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            channel: activeChannel,
          },
        ]);
        setIsGenerating(false);
        return;
      }
    } catch {
      // Fallback local
    }

    const fallback = generateApproach(activeChannel);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `gen_${Date.now()}`,
        sender: 'assistant',
        content: fallback,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel: activeChannel,
      },
    ]);
    setIsGenerating(false);
  };

  // Envio de prompt customizado pelo usuário no chat via Hermes Agent
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt) return;

    const userMsg: CopilotChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: activeChannel,
          leadContext: {
            companyName,
            contactName,
            contactJob,
            segment,
            bottleneck,
          },
          messages: [
            ...chatMessages.map((m) => ({
              role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: m.content,
            })),
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsGenerating(false);
        return;
      }
    } catch {
      // fallback
    }

    const aiReply = generateApproach('chat', prompt);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `reply_${Date.now()}`,
        sender: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsGenerating(false);
  };

  // Copiar para a área de transferência
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Texto copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Abrir no WhatsApp Web
  const handleOpenWhatsApp = (text: string) => {
    const cleanPhone = contactPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encoded}`
      : `https://web.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (!profile || pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Botão Flutuante Exclusivo do Copilot AI (Posicionado diretamente acima de Sugestões) */}
      <aside aria-label="Nexus Copilot AI" className="group fixed bottom-48 sm:bottom-36 lg:bottom-[5.5rem] right-4 sm:right-6 z-50 flex items-center justify-end">
        {/* Tooltip revelado somente no hover */}
        {!isOpen && (
          <div
            className="mr-3 hidden sm:flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-xl border border-purple-200 dark:border-purple-900/50 text-xs font-bold text-purple-700 dark:text-purple-300 pointer-events-none whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out"
          >
            <Bot className="w-3.5 h-3.5 text-purple-500 animate-bounce" />
            <span>Copilot de Abordagem</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Fechar Copilot de Abordagem' : 'Abrir Copilot de Abordagem'}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-purple-900 text-white rotate-90 scale-95'
              : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 text-white hover:scale-110 hover:shadow-purple-500/40'
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-fuchsia-500 text-[9px] font-black text-white items-center justify-center">
                  IA
                </span>
              </span>
            </>
          )}
        </button>
      </aside>

      {/* Janela Flutuante do Copilot */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nexus Copilot - Assistente de Vendas Consultivas"
          className="fixed bottom-24 right-6 z-50 w-[94vw] sm:w-[520px] max-h-[660px] flex flex-col rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-fuchsia-700 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                  <Bot className="h-6 w-6 text-fuchsia-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold leading-tight">Nexus Copilot AI</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-purple-100">
                      Hermes Agent
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-100/80">Consulta Pública, Decisores & Abordagens B2B</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Seleção rápida de Lead do CRM */}
            <div className="mt-3 bg-black/20 p-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                <select
                  value={selectedOppId}
                  disabled={opportunities.length === 0}
                  onChange={(e) => handleSelectOpportunity(e.target.value)}
                  className={`w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer [&>option]:text-slate-900 [&>option]:bg-white ${
                    opportunities.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {opportunities.length === 0 ? (
                    <option value="">Nenhum lead na sua carteira de clientes</option>
                  ) : (
                    <>
                      <option value="">✨ Selecionar Lead da sua Carteira ({opportunities.length})...</option>
                      {opportunities.map((opp) => (
                        <option key={opp.id} value={opp.id}>
                          {opp.companyName} — {opp.contacts?.[0]?.name || 'Sem contato'} ({SEGMENT_LABELS[opp.segment] || opp.segment})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Chips Rápidos de Leads para clicar com 1 toque */}
              {opportunities.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <span className="text-[10px] font-bold text-purple-200/70 uppercase tracking-wider shrink-0">Atalhos:</span>
                  {opportunities.slice(0, 6).map((opp) => (
                    <button
                      key={opp.id}
                      type="button"
                      onClick={() => handleSelectOpportunity(opp.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 transition cursor-pointer ${
                        selectedOppId === opp.id
                          ? 'bg-white text-purple-900 font-bold shadow-xs'
                          : 'bg-white/15 text-purple-100 hover:bg-white/25'
                      }`}
                      title={`Clique para carregar ${opp.companyName}`}
                    >
                      {opp.companyName}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2 pt-1.5 border-t border-white/10">
                  <p className="text-[10px] text-purple-200/70 italic">
                    Sua carteira está sem leads no momento (0 cadastrados). Você ainda pode pesquisar qualquer empresa pelo CNPJ na aba &quot;Consulta Pública&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Canais e Playbooks */}
          <div className="bg-slate-100 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveChannel('public_consult')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeChannel === 'public_consult'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>Consulta Pública (QSA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('whatsapp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeChannel === 'whatsapp'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('linkedin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeChannel === 'linkedin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <span>LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('email')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeChannel === 'email'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Cold Email</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('objection')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeChannel === 'objection'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Objeções</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('spin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeChannel === 'spin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SPIN</span>
            </button>
          </div>

          {/* ABA: CONSULTA PÚBLICA DE CNPJ E SÓCIOS */}
          {activeChannel === 'public_consult' && (
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[460px] bg-slate-50/60 dark:bg-slate-950/60">
              {/* Barra de busca de CNPJ */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pesquisar Empresa / CNPJ na Receita Federal
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Digite o CNPJ (ex: 42.158.963/0001-52) ou Nome da Empresa..."
                      value={cnpjInput || companyName}
                      onChange={(e) => {
                        setCnpjInput(e.target.value);
                        setCompanyName(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePublicConsultation()}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePublicConsultation()}
                    disabled={isSearchingPublic}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingPublic ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Globe2 className="w-3.5 h-3.5" />
                        <span>Consultar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dossiê Carregado */}
              {publicDossier ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Cartão Principal da Empresa */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {publicDossier.empresa}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {publicDossier.situacao}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {publicDossier.razao_social} • CNPJ: {publicDossier.cnpj}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Capital Social</span>
                        <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                          {publicDossier.capital_social}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Tempo de Mercado</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{publicDossier.tempo_mercado}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Porte Registrado</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{publicDossier.porte}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">CNAE Principal</span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                        {publicDossier.cnae_principal}
                      </p>
                    </div>

                    {publicDossier.endereco_completo && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{publicDossier.endereco_completo}</span>
                      </div>
                    )}
                  </div>

                  {/* Cartão de Dados de Contato Oficiais do Lead */}
                  {publicDossier.contatos_oficiais && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                          <PhoneCall className="w-4 h-4 text-blue-500" />
                          <span>Canais de Contato Oficiais</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Dados da Receita Federal
                        </span>
                      </div>

                      {/* Telefones */}
                      {publicDossier.contatos_oficiais.telefones?.length > 0 ? (
                        <div className="space-y-2">
                          {publicDossier.contatos_oficiais.telefones.map((tel: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <div>
                                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    {tel.formatted}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 font-medium">{tel.label}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(tel.formatted)}
                                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                                  title="Copiar telefone"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <a
                                  href={tel.telUrl}
                                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition"
                                  title="Ligar agora"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={tel.whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold shadow-xs transition"
                                  title="Abrir no WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhum telefone registrado na base pública.</p>
                      )}

                      {/* E-mail Oficial */}
                      {publicDossier.contatos_oficiais.email && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {publicDossier.contatos_oficiais.email}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-medium">E-mail Cadastrado</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(publicDossier.contatos_oficiais.email)}
                              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                              title="Copiar e-mail"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={publicDossier.contatos_oficiais.mailto_url}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shadow-xs transition"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Enviar E-mail</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Endereço com Google Maps */}
                      {publicDossier.endereco?.endereco_completo && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 truncate text-[11px]">
                              {publicDossier.endereco.endereco_completo}
                            </span>
                          </div>
                          {publicDossier.endereco.google_maps_url && (
                            <a
                              href={publicDossier.endereco.google_maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold shrink-0 ml-2 transition"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Maps</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quadro de Sócios e Administradores (QSA) */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>Quadro de Sócios & Decisores (QSA)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {publicDossier.socios.length} decisor(es) localizado(s)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {publicDossier.socios.map((socio: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{socio.nome_socio}</p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {socio.qualificacao_socio}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {socio.linkedin_url && (
                              <a
                                href={socio.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition"
                                title="Buscar perfil no LinkedIn"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSelectPartner(socio.nome_socio, socio.qualificacao_socio)}
                              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[10px] font-bold shadow-xs transition cursor-pointer"
                            >
                              Usar como Decisor
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights do Hermes Agent */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4 rounded-2xl border border-purple-200/70 dark:border-purple-800/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Diagnóstico Estratégico do Hermes Agent</span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {publicDossier.insights_consultivos.map((insight: string, idx: number) => (
                        <div key={idx} className="p-2 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-purple-100 dark:border-purple-900/40">
                          {insight}
                        </div>
                      ))}
                    </div>

                    {/* Gancho Pronto */}
                    <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Gancho Personalizado de Abordagem:
                      </span>
                      <p className="mt-1 p-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 border border-purple-200 dark:border-purple-800 font-sans">
                        {publicDossier.gancho_de_abordagem}
                      </p>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(publicDossier.gancho_de_abordagem)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar Gancho</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(publicDossier.gancho_de_abordagem)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold transition cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Enviar WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <Globe2 className="w-8 h-8 text-indigo-400 mx-auto stroke-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nenhum CNPJ consultado no momento
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Digite o CNPJ ou selecione um Lead no topo para buscar o Quadro de Sócios, CNAE, Capital Social e Dossiê com IA.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* DEMAIS ABAS (WhatsApp, LinkedIn, Email, Objeções, SPIN) */}
          {activeChannel !== 'public_consult' && (
            <>
              {/* Configuração rápida do Contexto do Lead */}
              <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Empresa</label>
                  <input
                    type="text"
                    placeholder="Ex: Alfa Logística"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Contato / Cargo</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos (CFO)"
                    value={contactName ? `${contactName}${contactJob ? ` (${contactJob})` : ''}` : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setContactName(val.split('(')[0].trim());
                      if (val.includes('(')) {
                        setContactJob(val.split('(')[1].replace(')', '').trim());
                      }
                    }}
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Segmento</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg px-2 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Gerando...' : 'Gerar Roteiro'}</span>
                  </button>
                </div>
              </div>

              {/* Seletor específico quando em Objeções */}
              {activeChannel === 'objection' && (
                <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0">Objeção:</span>
                  <select
                    value={selectedObjection}
                    onChange={(e) => {
                      setSelectedObjection(e.target.value);
                      setTimeout(handleGenerate, 100);
                    }}
                    className="flex-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-amber-500/30 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {OBJECTIONS_LIST.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Área de Mensagens / Respostas do Copilot */}
              <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[300px] bg-slate-50/50 dark:bg-slate-950/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                      {msg.sender === 'assistant' && msg.id !== 'welcome_1' && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.content)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition cursor-pointer"
                            >
                              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenWhatsApp(msg.content)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold transition cursor-pointer"
                              title="Enviar via WhatsApp Web"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Chat Interativo */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Peça uma variação ao Hermes Agent (Ex: 'Mais persuasiva', 'Foque em custo')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isGenerating}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
