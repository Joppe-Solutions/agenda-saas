import { LegalLayout } from "@/components/legal";

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" lastUpdated="14 de fevereiro de 2026">
      <h2>1. Informações que Coletamos</h2>
      <p>Coletamos informações que você nos fornece diretamente, incluindo:</p>
      <ul>
        <li>Informações de cadastro (nome, e-mail, telefone)</li>
        <li>Informações de pagamento</li>
        <li>Dados de reservas e transações</li>
        <li>Comunicações conosco</li>
      </ul>

      <h2>2. Como Usamos Suas Informações</h2>
      <p>Utilizamos as informações coletadas para:</p>
      <ul>
        <li>Fornecer, manter e melhorar nossos serviços</li>
        <li>Processar transações e enviar notificações relacionadas</li>
        <li>Enviar comunicações de marketing (com seu consentimento)</li>
        <li>Responder a suas solicitações e fornecer suporte</li>
        <li>Proteger contra atividades fraudulentas</li>
      </ul>

      <h2>3. Compartilhamento de Informações</h2>
      <p>
        Não vendemos suas informações pessoais. Podemos compartilhar suas informações nas seguintes circunstâncias:
      </p>
      <ul>
        <li>Com provedores de serviços que nos auxiliam nas operações</li>
        <li>Para cumprir obrigações legais</li>
        <li>Para proteger direitos, privacidade, segurança ou propriedade</li>
        <li>Em conexão com uma fusão ou aquisição</li>
      </ul>

      <h2>4. Segurança de Dados</h2>
      <p>
        Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra
        acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia SSL, backups
        regulares e controles de acesso rigorosos.
      </p>

      <h2>5. Seus Direitos</h2>
      <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:</p>
      <ul>
        <li>Acessar seus dados pessoais</li>
        <li>Corrigir dados incompletos ou desatualizados</li>
        <li>Solicitar a exclusão de seus dados</li>
        <li>Revogar o consentimento para processamento</li>
        <li>Solicitar a portabilidade de seus dados</li>
      </ul>

      <h2>6. Retenção de Dados</h2>
      <p>
        Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir obrigações
        legais. Quando não forem mais necessárias, excluiremos ou anonimizaremos suas informações.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Utilizamos cookies e tecnologias similares para melhorar sua experiência. Para mais informações,
        consulte nossa{" "}
        <a href="/cookies" className="text-primary hover:underline">
          Política de Cookies
        </a>
        .
      </p>

      <h2>8. Alterações nesta Política</h2>
      <p>
        Podemos atualizar esta política periodicamente. Notificaremos você sobre alterações significativas
        por e-mail ou através de um aviso em nosso site.
      </p>

      <h2>9. Contato</h2>
      <p>
        Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato através do e-mail{" "}
        <a href="mailto:privacidade@agendae.me" className="text-primary hover:underline">
          privacidade@agendae.me
        </a>
        .
      </p>
    </LegalLayout>
  );
}
