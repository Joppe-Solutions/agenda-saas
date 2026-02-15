import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import type { ComponentProps } from "react";
import { Inter } from "next/font/google";
import { JivoChat } from "@/components/jivo-chat";
import { ThemeProvider } from "@/components/theme-provider";
import { clerkTheme, clerkThemeDark } from "@/lib/clerk-theme";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const clerkLocalization = ptBR as unknown as ComponentProps<typeof ClerkProvider>["localization"];

export const metadata: Metadata = {
  title: {
    default: "agendae.me - Sistema de Reservas Online",
    template: "%s | agendae.me",
  },
  description: "Simplifique suas reservas. Gerencie agendamentos, receba pagamentos e escale seu negócio com facilidade.",
  keywords: ["reservas online", "agendamento", "booking", "gestão de reservas", "pagamentos", "PIX"],
  authors: [{ name: "agendae.me" }],
  creator: "agendae.me",
  openGraph: {
    title: "agendae.me - Sistema de Reservas Online",
    description: "Simplifique suas reservas. Gerencie agendamentos, receba pagamentos e escale seu negócio.",
    type: "website",
    locale: "pt_BR",
    siteName: "agendae.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "agendae.me - Sistema de Reservas Online",
    description: "Simplifique suas reservas. Gerencie agendamentos, receba pagamentos e escale seu negócio.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider 
      localization={clerkLocalization}
      appearance={{
        baseTheme: undefined,
        variables: clerkTheme.variables,
        elements: clerkTheme.elements,
        layout: {
          logoImageUrl: "/brand/logo-icon.png",
        },
      }}
    >
      <html lang="pt-BR" className={`${inter.variable} light`} suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={["light"]}
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="light"
          >
            {children}
            <JivoChat />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
