import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/booking-form";
import { Card } from "@/components/ui/card";
import { getPublicMerchant } from "@/lib/api";

interface MerchantBookingPageProps {
  params: Promise<{ merchantSlug: string }>;
}

export default async function MerchantBookingPage({ params }: MerchantBookingPageProps) {
  const { merchantSlug } = await params;

  let data: Awaited<ReturnType<typeof getPublicMerchant>>;
  try {
    data = await getPublicMerchant(merchantSlug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <p className="text-xs uppercase tracking-wider text-brand-700">{data.merchant.niche}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{data.merchant.businessName}</h1>
        <p className="mt-2 text-sm text-slate-600">Escolha data, quantidade de pessoas e realize o pagamento do sinal via PIX.</p>

        <div className="mt-6">
          <BookingForm
            assets={data.assets}
            merchantId={data.merchant.id}
            merchantName={data.merchant.businessName}
            merchantWhatsapp={data.merchant.whatsappNumber}
          />
        </div>
      </Card>
    </main>
  );
}
