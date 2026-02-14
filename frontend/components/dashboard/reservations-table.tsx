"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";

interface ReservationsTableProps {
  merchantId: string;
  initialBookings: Booking[];
}

export function ReservationsTable({ merchantId, initialBookings }: ReservationsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function setStatus(bookingId: string, status: BookingStatus) {
    setLoadingId(bookingId);
    try {
      await updateBookingStatus(merchantId, bookingId, status);
      setBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status } : item)));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Pessoas</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{booking.customer_name}</p>
                <p className="text-xs text-slate-500">{booking.customer_phone}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{booking.booking_date}</td>
              <td className="px-4 py-3 text-slate-700">{booking.people_count}</td>
              <td className="px-4 py-3 text-slate-700">{booking.status}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    className="h-9 px-3 text-xs"
                    disabled={loadingId === booking.id}
                    onClick={() => setStatus(booking.id, "CONFIRMED")}
                    type="button"
                    variant="secondary"
                  >
                    Confirmar
                  </Button>
                  <Button
                    className="h-9 px-3 text-xs"
                    disabled={loadingId === booking.id}
                    onClick={() => setStatus(booking.id, "CANCELLED")}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
