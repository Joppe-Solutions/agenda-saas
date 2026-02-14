import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { TawkTo } from "@/components/tawk-to";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={inter.className}>
          {children}
          <TawkTo />
        </body>
      </html>
    </ClerkProvider>
  );
}
