import { randomUUID } from "node:crypto";
import { api, APIError } from "encore.dev/api";
import { db } from "../../db/db";

interface SendNotificationBody {
  bookingId: string;
  type: "confirmation" | "reminder_24h" | "reminder_2h" | "payment_pending" | "payment_expired";
}

interface NotificationLog {
  id: string;
  bookingId: string;
  type: string;
  channel: string;
  status: string;
  sentAt: string;
}

export const sendBookingNotification = api(
  { expose: true, method: "POST", path: "/notification/send" },
  async (body: SendNotificationBody): Promise<{ success: boolean; notificationId: string }> => {
    const booking = await db.queryRow<{
      id: string;
      merchant_id: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      booking_date: Date;
      start_time: string | null;
      resource_id: string;
      total_amount: number;
      deposit_amount: number;
    }>`
      SELECT id, merchant_id, customer_name, customer_phone, customer_email, 
             booking_date, start_time, resource_id, total_amount, deposit_amount
      FROM bookings
      WHERE id = ${body.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const resource = await db.queryRow<{ name: string }>`
      SELECT name FROM resources WHERE id = ${booking.resource_id}
    `;

    const merchant = await db.queryRow<{
      business_name: string;
      whatsapp_number: string;
    }>`
      SELECT business_name, whatsapp_number FROM merchants WHERE id = ${booking.merchant_id}
    `;

    const notificationId = randomUUID();
    const dateStr = booking.booking_date.toISOString().split('T')[0];
    const dateFormatted = new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR");

    let message: string;
    switch (body.type) {
      case "confirmation":
        message = `✅ *Reserva Confirmada!*\n\n` +
          `📅 Data: ${dateFormatted}${booking.start_time ? `\n⏰ Horário: ${booking.start_time}` : ''}\n` +
          `📍 Local: ${resource?.name || 'N/A'}\n` +
          `👥 Nome: ${booking.customer_name}\n\n` +
          `💰 Total: R$ ${booking.total_amount.toFixed(2)}\n` +
          `✅ Sinal pago: R$ ${booking.deposit_amount.toFixed(2)}\n\n` +
          `_Enviado por ${merchant?.business_name || 'reserva.online'}_`;
        break;

      case "reminder_24h":
        message = `⏰ *Lembrete: Sua reserva é amanhã!*\n\n` +
          `📅 ${dateFormatted}${booking.start_time ? ` às ${booking.start_time}` : ''}\n` +
          `📍 ${resource?.name || 'N/A'}\n\n` +
          `Nos vemos lá! 🎉\n\n` +
          `_${merchant?.business_name || 'reserva.online'}_`;
        break;

      case "reminder_2h":
        message = `🔔 *Sua reserva é em 2 horas!*\n\n` +
          `📍 ${resource?.name || 'N/A'}\n` +
          `⏰ ${booking.start_time || 'Confirmar horário'}\n\n` +
          `Estamos te esperando! 🚀\n\n` +
          `_${merchant?.business_name || 'reserva.online'}_`;
        break;

      case "payment_pending":
        message = `⏳ *Pagamento Pendente*\n\n` +
          `Olá ${booking.customer_name}!\n\n` +
          `Sua reserva para ${dateFormatted} está aguardando pagamento do sinal.\n` +
          `💰 Valor: R$ ${booking.deposit_amount.toFixed(2)}\n\n` +
          `Acesse o link para pagar ou entre em contato.\n\n` +
          `_${merchant?.business_name || 'reserva.online'}_`;
        break;

      case "payment_expired":
        message = `❌ *Reserva Cancelada*\n\n` +
          `Olá ${booking.customer_name},\n\n` +
          `Sua reserva para ${dateFormatted} foi cancelada por falta de pagamento do sinal.\n\n` +
          `Queira fazer uma nova reserva se ainda tiver interesse!\n\n` +
          `_${merchant?.business_name || 'reserva.online'}_`;
        break;

      default:
        message = `Notificação sobre sua reserva`;
    }

    console.log(`[NOTIFICATION] Type: ${body.type}, To: ${booking.customer_phone}`);
    console.log(`[NOTIFICATION] Message: ${message}`);

    await db.exec`
      INSERT INTO notifications (id, booking_id, type, channel, status, message, sent_at)
      VALUES (
        ${notificationId},
        ${booking.id},
        ${body.type},
        'whatsapp',
        'sent',
        ${message},
        now()
      )
    `;

    return { success: true, notificationId };
  },
);

export const getNotificationHistory = api(
  { expose: true, method: "GET", path: "/booking/:bookingId/notifications" },
  async ({ bookingId }: { bookingId: string }): Promise<{ notifications: NotificationLog[] }> => {
    const rows = await db.queryAll<{
      id: string;
      booking_id: string;
      type: string;
      channel: string;
      status: string;
      sent_at: Date;
    }>`
      SELECT id, booking_id, type, channel, status, sent_at
      FROM notifications
      WHERE booking_id = ${bookingId}
      ORDER BY sent_at DESC
    `;

    return {
      notifications: rows.map(row => ({
        id: row.id,
        bookingId: row.booking_id,
        type: row.type,
        channel: row.channel,
        status: row.status,
        sentAt: row.sent_at.toISOString(),
      })),
    };
  },
);

export const sendRemindersJob = api(
  { expose: true, method: "POST", path: "/internal/send-reminders" },
  async (): Promise<{ sent24h: number; sent2h: number }> => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings24h = await db.queryAll<{ id: string }>`
      SELECT id FROM bookings
      WHERE booking_date = ${tomorrowStr}::date
        AND status = 'confirmed'
        AND id NOT IN (
          SELECT booking_id FROM notifications 
          WHERE type = 'reminder_24h' 
          AND sent_at > now() - INTERVAL '25 hours'
        )
    `;

    for (const booking of bookings24h) {
      try {
        await sendBookingNotification({ bookingId: booking.id, type: "reminder_24h" });
      } catch (err) {
        console.error(`Failed to send 24h reminder for booking ${booking.id}:`, err);
      }
    }

    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
    const todayStr = new Date().toISOString().split('T')[0];
    const targetTime = twoHoursFromNow.toTimeString().slice(0, 5);

    const bookings2h = await db.queryAll<{ id: string }>`
      SELECT id FROM bookings
      WHERE booking_date = ${todayStr}::date
        AND start_time = ${targetTime}
        AND status = 'confirmed'
        AND id NOT IN (
          SELECT booking_id FROM notifications 
          WHERE type = 'reminder_2h' 
          AND sent_at > now() - INTERVAL '3 hours'
        )
    `;

    for (const booking of bookings2h) {
      try {
        await sendBookingNotification({ bookingId: booking.id, type: "reminder_2h" });
      } catch (err) {
        console.error(`Failed to send 2h reminder for booking ${booking.id}:`, err);
      }
    }

    return { sent24h: bookings24h.length, sent2h: bookings2h.length };
  },
);