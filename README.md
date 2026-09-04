# 🚀 CRM Nexus — Nexus Flow Tech

CRM B2B Consultivo de Alta Performance para automação, gestão de oportunidades, inteligência comercial e alocação de consultores da **Nexus Flow Tech**.

---

## 👥 Estrutura de Liderança & Perfis de Acesso

O CRM Nexus opera sob o modelo de **Governança Executiva & Isolamento de Carteira de Consultores**, alinhado à liderança oficial da Nexus Flow Tech:

### 🏛️ Diretoria & Liderança Técnica (Acesso Administrativo Total)
- **Marcel Wachowicz** — *Founder & CEO / CFO* (`admin_ceo`)
  - Gestão financeira, visão do pipeline global consolidado e breakdown por consultor.
- **Patrik Rodrigues** — *CTO & IA e Automação* (`admin_tech`)
  - Gestão tecnológica, automações, arquitetura de IA e gestão completa de equipe/leads.
- **Carlos Eduardo da Silva Ribeiro** — *Tech Lead Full Stack & IA* (`admin_tech`)
  - Liderança de engenharia de software, pipelines de dados e infraestrutura.

### 💼 Consultores Comerciais (Isolamento Estrito de Carteira)
- **Thiago Mendes** — *Consultor Comercial* (`consultant`)
- **Larissa Santos** — *Consultora Comercial* (`consultant`)
- **Bruno Carvalho** — *Consultor Comercial* (`consultant`)
> *Regra de Isolamento:* Cada consultor visualiza exclusivamente os leads e métricas da sua própria carteira. Botões administrativos (como adição de colaboradores ou exclusão global) permanecem restritos à diretoria.

---

## ⚡ Principais Funcionalidades

1. **Pipeline de Vendas Kanban:**
   - Visualização em colunas por etapas do funil com drag-and-drop dinâmico (`@hello-pangea/dnd`).
   - Cálculo automático de Forecast ponderado e comissões estimadas por consultor.

2. **Quick Capture em Menos de 1 Minuto:**
   - Cadastro rápido de novas oportunidades com enriquecimento automático via CNPJ/Receita Federal (BrasilAPI).
   - Validação da **Regra Nexus: Nenhuma oportunidade sem próximo passo agendado**.

3. **Carteira de Clientes & Exclusão Segura:**
   - Módulo de clientes agrupados por volume e probabilidade.
   - Exclusão seletiva com integridade relacional permanente garantida no banco de dados.

4. **Agenda da Equipe (Google Calendar):**
   - Sincronização bidirecional via OAuth 2.0 com Google Calendar.
   - Painel multi-colaborador com suporte individual para conexões e desconexões seguras de agenda.

5. **Nexus Copilot AI (Hermes Agent):**
   - Agente de IA consultiva conectado ao **Hermes Agent** na VPS Hostinger.
   - Gera abordagens consultivas ultra-personalizadas por canal (WhatsApp, LinkedIn, E-mail, Reunião de Diagnóstico) com base no histórico do lead.

6. **Meu Dia & Ações + Central de Sugestões:**
   - Painel diário de follow-ups obrigatórios e reuniões do dia.
   - Canal interno de melhorias contínuas e feedbacks com votação.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI & Estilização:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Banco de Dados & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Supabase Auth SSR)
- **Agente de IA:** Hermes Agent via OmniRoute VPS Hostinger
- **Testes E2E:** Puppeteer-Core com automação de navegador Chromium/Edge

---

## 🏁 Inicialização Rápida

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/Kadu-Developer/crm-nexus.git
cd crm-nexus
npm install
```

### 2. Variáveis de Ambiente
Crie ou configure o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Google Calendar OAuth
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hermes Agent AI (Hostinger VPS)
HERMES_API_URL=http://187.16.2.222:8000
HERMES_API_KEY=sua_chave_hermes
```

### 3. Rodar em Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:3000`.

### 4. Build de Produção
```bash
npm run build
```

---

## 🧪 Bateria de Testes Automatizados (10 Pontos E2E)

O projeto conta com uma suíte de testes de ponta a ponta que valida os 10 módulos críticos:
1. Cards de Login Rápido (Quick Fill) para 3 diretores e 3 consultores.
2. Privilégios administrativos e badge de Patrik Rodrigues (`admin_tech`).
3. Visão consolidada executiva de Marcel Wachowicz (`admin_ceo`).
4. Isolamento estrito de carteira dos consultores.
5. Criação de novos leads via Quick Capture Modal.
6. Exclusão segura de lead com persistência garantida após F5.
7. Agenda Google da liderança.
8. Módulo de tarefas ("Meu Dia & Ações").
9. Módulo de sugestões.
10. Geração consultiva do Nexus Copilot AI (Hermes).

Para executar:
```bash
npm run test:e2e
```

---

## 🔒 Segurança & Governança

- **RLS & Server Actions:** Validação estrita no servidor para impedir manipulação indevida de dados entre consultores.
- **Tokens Criptografados:** Tokens OAuth do Google Calendar armazenados com isolamento por usuário.
- **Clean Code & Tipagem:** 100% tipado com TypeScript, 0 erros de compilação.
