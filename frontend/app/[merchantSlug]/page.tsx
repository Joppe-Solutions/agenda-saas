import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, MapPin, Phone, Tag, Users, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentForm } from "@/components/booking/appointment-form";
import { getPublicMerchant } from "@/lib/api";

import type { BusinessCategory } from "@/lib/types";

interface MerchantBookingPageProps {
  params: Promise<{ merchantSlug: string }>;
}

const categoryLabels: Record<BusinessCategory, string> = {
  BEAUTY: "Beleza e Estética",
  HEALTH: "Saúde",
  WELLNESS: "Bem-estar",
  EDUCATION: "Educação",
  SERVICES: "Serviços",
  PET: "Pet",
};

const categoryIcons: Record<BusinessCategory, typeof Tag> = {
  BEAUTY: Tag,
  HEALTH: Users,
  WELLNESS: Clock,
  EDUCATION: Users,
  SERVICES: Clock,
  PET: Tag,
};

export default async function MerchantBookingPage({ params }: MerchantBookingPageProps) {
  const { merchantSlug } = await params;

  let data;
  try {
    data = await getPublicMerchant(merchantSlug);
  } catch {
    notFound();
  }

  const CategoryIcon = categoryIcons[data.merchant.businessCategory] || Tag;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CalendarCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">agendae.me</span>
          </Link>
          <Badge variant="secondary" className="gap-1">
            <CategoryIcon className="h-3 w-3" />
            {categoryLabels[data.merchant.businessCategory] || data.merchant.businessCategory}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {data.merchant.businessName}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Agende seu horário online de forma rápida e segura
                </p>
              </div>

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
                  {data.merchant.address && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {data.merchant.address}
                      {data.merchant.city && ` - ${data.merchant.city}`}
                    </div>
                  )}
                </CardContent>
              </Card>

              {data.services.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Serviços</CardTitle>
                    <CardDescription>{data.services.length} serviço{data.services.length > 1 ? "s" : ""} disponíve{data.services.length > 1 ? "is" : "l"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.services.slice(0, 5).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.durationMinutes} min
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          R$ {service.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {data.services.length > 5 && (
                      <p className="text-xs text-center text-muted-foreground">
                        +{data.services.length - 5} outros serviços
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {data.staff.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Equipe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.staff.slice(0, 4).map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))}
                    {data.staff.length > 4 && (
                      <p className="text-xs text-center text-muted-foreground">
                        +{data.staff.length - 4} profissionais
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Agendar Horário</CardTitle>
                <CardDescription>
                  Escolha o serviço, profissional e horário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentForm
                  services={data.services}
                  staff={data.staff}
                  merchantId={data.merchant.id}
                  merchantName={data.merchant.businessName}
                  merchantWhatsapp={data.merchant.whatsappNumber}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card py-6">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="font-medium text-foreground hover:underline">
            agendae.me
          </Link>
        </div>
      </footer>
    </div>
  );
}