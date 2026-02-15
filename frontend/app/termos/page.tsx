import { LegalLayout } from "@/components/legal";

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Uso" lastUpdated="14 de fevereiro de 2026">
      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e usar o agendae.me, você concorda em cumprir e estar vinculado a estes Termos de Uso.
        Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O agendae.me é uma plataforma de gestão de agendamentos online que permite a empresários e prestadores
        de serviços gerenciar horários, receber pagamentos e se comunicar com clientes.
      </p>

      <h2>3. Cadastro e Conta</h2>
      <p>
        Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas.
        Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem
        em sua conta.
      </p>

      <h2>4. Uso Aceitável</h2>
      <p>Você concorda em usar o serviço apenas para fins legais e de acordo com estes Termos. Você não deve:</p>
      <ul>
        <li>Usar o serviço de forma que viole qualquer lei aplicável</li>
        <li>Tentar obter acesso não autorizado a qualquer parte do serviço</li>
        <li>Transmitir vírus ou código malicioso</li>
        <li>Usar o serviço para enviar spam ou conteúdo não solicitado</li>
      </ul>

      <h2>5. Pagamentos e Taxas</h2>
      <p>
        Os planos pagos são cobrados mensalmente. Você concorda em pagar todas as taxas aplicáveis ao seu plano.
        As taxas não são reembolsáveis, exceto conforme expressamente estabelecido nestes Termos.
      </p>

      <h2>6. Propriedade Intelectual</h2>
      <p>
        O serviço e seu conteúdo original, recursos e funcionalidade são de propriedade exclusiva do agendae.me
        e estão protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
      </p>

      <h2>7. Limitação de Responsabilidade</h2>
      <p>
        Em nenhum caso o agendae.me será responsável por danos indiretos, incidentais, especiais, consequenciais
        ou punitivos, incluindo perda de lucros, dados ou outras perdas intangíveis.
      </p>

      <h2>8. Modificações dos Termos</h2>
      <p>
        Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos você sobre quaisquer
        alterações publicando os novos Termos de Uso nesta página.
      </p>

      <h2>9. Contato</h2>
      <p>
        Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do e-mail{" "}
        <a href="mailto:contato@agendae.me" className="text-primary hover:underline">
          contato@agendae.me
        </a>
        .
      </p>
    </LegalLayout>
  );
}
