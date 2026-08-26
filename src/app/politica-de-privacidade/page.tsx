import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliticaDePrivacidadePage() {
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
            Política de Privacidade
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Política de Privacidade do CRM Nexus
          </h2>

          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Esta Política de Privacidade descreve como coletamos, usamos, compartilhamos e protegemos suas informações quando você usa o CRM Nexus.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            1. Informações que Coletamos
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Coletamos informações que você nos fornece diretamente, como nome, e-mail, senha e dados de perfil quando você se registra em nossa plataforma.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            2. Como Usamos suas Informações
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Usamos suas informações para: fornecer e melhorar nossos serviços, comunicar-nos com você, personalizar sua experiência e cumprir obrigações legais.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            3. Compartilhamento de Informações
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing, exceto conforme descrito nesta política ou com seu consentimento explícito.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            4. Segurança das Informações
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            5. Seus Direitos
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Você tem o direito de acessar, corrigir, excluir ou restringir o uso de suas informações pessoais. Para exercer esses direitos, entre em contato conosco.
          </p>

          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            6. Alterações nesta Política
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos que você reveja esta página ocasionalmente para se manter informado sobre como estamos protegendo suas informações.
          </p>

          <p className="text-slate-600 dark:text-slate-300">
            <strong>Última atualização:</strong> 26 de agosto de 2026
          </p>
        </div>
      </div>
    </div>
  );
}