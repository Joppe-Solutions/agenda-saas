import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import type { ComponentProps } from "react";
import { Inter } from "next/font/google";
import { JivoChat } from "@/components/jivo-chat";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const clerkLocalization = ptBR as unknown as ComponentProps<typeof ClerkProvider>["localization"];

export const metadata: Metadata = {
  title: "reserva.online - Sistema de Reservas Online",
  description: "Simplifique suas reservas. Gerencie agendamentos, receba pagamentos e escale seu negócio com facilidade.",
  keywords: ["reservas online", "agendamento", "booking", "gestão de reservas", "pagamentos"],
  openGraph: {
    title: "reserva.online - Sistema de Reservas Online",
    description: "Simplifique suas reservas. Gerencie agendamentos, receba pagamentos e escale seu negócio.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="pt-BR">
        <body className={inter.className}>
          {children}
          <JivoChat />
        </body>
      </html>
    </ClerkProvider>
  );
}
