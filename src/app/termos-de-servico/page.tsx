import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermosDeServicoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para home</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Termos de Serviço
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Termos de Serviço do CRM Nexus
          </h2>

          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Estes Termos de Serviço regulam o uso da plataforma CRM Nexus. Ao acessar ou usar nossos serviços, você concorda em cumprir estes termos.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            1. Aceitação dos Termos
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Ao se registrar ou usar o CRM Nexus, você declara que leu, compreendeu e concordou com estes Termos de Serviço, bem como com nossa Política de Privacidade.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            2. Descrição do Serviço
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            O CRM Nexus é uma plataforma de gestão de relacionamento com clientes (CRM) destinada a empresas para gerenciamento de leads, oportunidades, calendários e colaboração entre equipes.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            3. Cadastro e Conta
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Para usar o CRM Nexus, você deve criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            4. Uso Aceitável
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Você concorda em usar o CRM Nexus apenas para fins legais e de acordo com estes termos. É proibido usar a plataforma para quaisquer atividades ilegais, fraudulentas, prejudiciais ou que violem direitos de terceiros.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            5. Propriedade Intelectual
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Todo o conteúdo, recursos e funcionalidades do CRM Nexus, incluindo mas não limitado a texto, gráficos, logotipos, ícones, imagens e software, são propriedade da Nexus Flow Tech ou de seus licenciadores e estão protegidos por leis de direitos autorais e marcas registradas.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            6. Limitação de Responsabilidade
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Na medida máxima permitida por lei, a Nexus Flow Tech não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, ou por qualquer perda de lucros ou receitas, decorrentes do uso ou da incapacidade de usar o CRM Nexus.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            7. Indenização
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Você concorda em indenizar e isentar a Nexus Flow Tech, seus diretores, funcionários e agentes de e contra quaisquer reivindicações, responsabilidades, danos, perdas e despesas, incluindo honorários advocatícios razoáveis, decorrentes de ou relacionados à sua violação destes Termos de Serviço ou ao seu uso do CRM Nexus.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            8. Alterações nos Termos
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. Publicaremos uma versão atualizada nesta página e a data de "Última atualização" será revisada conforme apropriado.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            9. Lei Aplicável e Foro
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            Estes Termos de Serviço serão regidos e interpretados de acordo com as leis da República Federativa do Brasil, sem considerar seus princípios de conflito de leis. Qualquer disputa relacionada a estes termos será submetida ao foro da comarca de [Cidade], [Estado], Brasil.
          </p>

          <p className="text-slate-600 dark:text-slate-300">
            <strong>Última atualização:</strong> 26 de agosto de 2026
          </p>
        </div>
      </div>
    </div>
  );
}