import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, MapPin, Phone, Ship, Users, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/components/booking/booking-form";
import { getPublicMerchant } from "@/lib/api";

interface MerchantBookingPageProps {
  params: Promise<{ merchantSlug: string }>;
}

const nicheLabels: Record<string, string> = {
  FISHING: "Pesca Esportiva",
  SPORTS: "Esportes",
  TOURISM: "Turismo",
  SERVICES: "Serviços",
};

const nicheIcons: Record<string, typeof Ship> = {
  FISHING: Ship,
  SPORTS: Users,
  TOURISM: MapPin,
  SERVICES: Clock,
};

export default async function MerchantBookingPage({ params }: MerchantBookingPageProps) {
  const { merchantSlug } = await params;

  let data: Awaited<ReturnType<typeof getPublicMerchant>>;
  try {
    data = await getPublicMerchant(merchantSlug);
  } catch {
    notFound();
  }

  const NicheIcon = nicheIcons[data.merchant.niche] || Ship;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CalendarCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">reserva.online</span>
          </Link>
          <Badge variant="secondary" className="gap-1">
            <NicheIcon className="h-3 w-3" />
            {nicheLabels[data.merchant.niche] || data.merchant.niche}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Merchant Info */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {data.merchant.businessName}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Faça sua reserva online de forma rápida e segura
                </p>
              </div>

              {/* Contact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`https://wa.me/${data.merchant.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {data.merchant.whatsappNumber}
                  </a>
                </CardContent>
              </Card>

              {/* Assets/Resources */}
              {data.assets.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recursos Disponíveis</CardTitle>
                    <CardDescription>Selecione um recurso no formulário</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Até {asset.capacity} pessoas
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          R$ {asset.basePrice.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Fazer Reserva</CardTitle>
                <CardDescription>
                  Escolha a data, quantidade de pessoas e pague o sinal via PIX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm
                  assets={data.assets}
                  merchantId={data.merchant.id}
                  merchantName={data.merchant.businessName}
                  merchantWhatsapp={data.merchant.whatsappNumber}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="font-medium text-foreground hover:underline">
            reserva.online
          </Link>
        </div>
      </footer>
    </div>
  );
}
