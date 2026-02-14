import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";

const footerLinks = {
  produto: [
    { label: "Recursos", href: "#recursos" },
    { label: "Preços", href: "#precos" },
    { label: "Como Funciona", href: "#como-funciona" },
  ],
  empresa: [
    { label: "Sobre", href: "/sobre" },
    { label: "Blog", href: "/blog" },
    { label: "Contato", href: "mailto:contato@reserva.online" },
  ],
  legal: [
    { label: "Termos de Uso", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary sm:h-8 sm:w-8">
                <CalendarCheck className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
              </div>
              <span className="text-lg font-bold sm:text-xl">reserva.online</span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
              O sistema de reservas mais simples e completo do Brasil.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold">Produto</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold">Empresa</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border bg-muted/50 p-6 sm:mt-10 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold">Baixe o aplicativo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie suas reservas pelo celular
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#"
              className="transition-transform hover:scale-105"
              aria-label="Baixar na App Store"
            >
              <Image
                src="/images/app-store-badge.png"
                alt="Disponível na App Store"
                width={120}
                height={36}
                className="h-[36px] w-auto"
              />
            </Link>
            <Link
              href="#"
              className="transition-transform hover:scale-105"
              aria-label="Baixar no Google Play"
            >
              <Image
                src="/images/google-play-badge.png"
                alt="Disponível no Google Play"
                width={120}
                height={36}
                className="h-[36px] w-auto"
              />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:mt-12 sm:flex-row sm:pt-8">
          <p className="text-xs text-muted-foreground sm:text-sm">
            © {new Date().getFullYear()} reserva.online. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
              Instagram
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
              LinkedIn
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
              YouTube
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
