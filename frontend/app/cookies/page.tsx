import { LegalLayout } from "@/components/legal";

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" lastUpdated="14 de fevereiro de 2026">
      <h2>1. O que são Cookies?</h2>
      <p>
        Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita
        um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente,
        bem como fornecer informações aos proprietários do site.
      </p>

      <h2>2. Como Usamos Cookies</h2>
      <p>Utilizamos cookies para os seguintes propósitos:</p>
      <ul>
        <li>
          <strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site, como
          autenticação e segurança.
        </li>
        <li>
          <strong>Cookies de Desempenho:</strong> Nos ajudam a entender como os visitantes interagem
          com o site, coletando informações anônimas.
        </li>
        <li>
          <strong>Cookies de Funcionalidade:</strong> Permitem que o site lembre suas preferências
          e forneça recursos aprimorados.
        </li>
        <li>
          <strong>Cookies de Marketing:</strong> Usados para rastrear visitantes em sites e exibir
          anúncios relevantes.
        </li>
      </ul>

      <h2>3. Cookies que Utilizamos</h2>
      <p>Os principais cookies utilizados em nosso site incluem:</p>
      <ul>
        <li>
          <strong>__clerk_session:</strong> Cookie de autenticação do Clerk para manter sua sessão ativa.
        </li>
        <li>
          <strong>_ga, _gid:</strong> Cookies do Google Analytics para análise de tráfego do site.
        </li>
        <li>
          <strong>tawk_*:</strong> Cookies do Tawk.to para o chat de suporte ao vivo.
        </li>
      </ul>

      <h2>4. Cookies de Terceiros</h2>
      <p>
        Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. Não temos
        controle sobre esses cookies. Os terceiros incluem:
      </p>
      <ul>
        <li>Google Analytics (análise de tráfego)</li>
        <li>Clerk (autenticação)</li>
        <li>Tawk.to (chat ao vivo)</li>
      </ul>

      <h2>5. Gerenciando Cookies</h2>
      <p>
        Você pode controlar e gerenciar cookies de várias maneiras. A maioria dos navegadores permite
        que você:
      </p>
      <ul>
        <li>Veja quais cookies estão armazenados e os exclua individualmente</li>
        <li>Bloqueie cookies de terceiros</li>
        <li>Bloqueie cookies de sites específicos</li>
        <li>Bloqueie todos os cookies</li>
        <li>Exclua todos os cookies ao fechar o navegador</li>
      </ul>
      <p>
        Lembre-se de que desabilitar cookies pode afetar a funcionalidade deste e de muitos outros
        sites que você visita.
      </p>

      <h2>6. Mais Informações</h2>
      <p>
        Para mais informações sobre cookies, incluindo como ver quais cookies foram configurados e
        como gerenciá-los e excluí-los, visite{" "}
        <a
          href="https://www.allaboutcookies.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          www.allaboutcookies.org
        </a>
        .
      </p>

      <h2>7. Contato</h2>
      <p>
        Se você tiver dúvidas sobre nossa política de cookies, entre em contato através do e-mail{" "}
        <a href="mailto:contato@reserva.online" className="text-primary hover:underline">
          contato@reserva.online
        </a>
        .
      </p>
    </LegalLayout>
  );
}
