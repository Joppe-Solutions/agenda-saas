export function buildWhatsAppUrl(phone: string, text: string): string {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}
