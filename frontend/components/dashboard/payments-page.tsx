"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Copy, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMerchantPayments, checkPaymentStatus } from "@/lib/api";
import type { Payment } from "@/lib/types";

interface PaymentsPageProps {
  merchantId: string;
}

const statusColors: Record<Payment["status"], string> = {
  pending: "bg-cyan-100 text-cyan-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  expired: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<Payment["status"], string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  refunded: "Estornado",
  expired: "Expirado",
};

export function PaymentsPage({ merchantId }: PaymentsPageProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMerchantPayments(merchantId);
      setPayments(data.payments);
    } catch (err) {
      setError("Não foi possível carregar os pagamentos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [merchantId]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRefreshStatus = async (paymentId: string) => {
    try {
      await checkPaymentStatus(paymentId);
      fetchPayments();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">Histórico de pagamentos PIX</p>
        </div>
        <Button variant="outline" onClick={fetchPayments}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700">{error}</CardContent>
        </Card>
      )}

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhum pagamento registrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      R$ {payment.amount.toFixed(2)}
                    </CardTitle>
                    <CardDescription>
                      Reserva: {payment.bookingId.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[payment.status]}>
                      {statusLabels[payment.status]}
                    </Badge>
                    <Badge variant="outline">
                      {payment.provider === "MERCADO_PAGO" ? "Mercado Pago" : "Manual"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Criado em:</span>
                    <span>{new Date(payment.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  {payment.paidAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pago em:</span>
                      <span>{new Date(payment.paidAt).toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  {payment.copyPasteCode && payment.status === "pending" && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Código PIX Copia e Cola:</p>
                      <div className="flex items-start gap-2">
                        <code className="text-xs break-all flex-1 bg-background p-2 rounded">
                          {payment.copyPasteCode}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(payment.copyPasteCode!, payment.id)}
                        >
                          {copied === payment.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {payment.status === "pending" && payment.provider === "MERCADO_PAGO" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRefreshStatus(payment.id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Verificar Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
