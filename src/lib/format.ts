export function formatPrice(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function getWhatsAppHref(whatsapp: string, text?: string): string {
  const match = whatsapp.match(/wa\.me\/(\d+)/);
  const base = match ? `https://wa.me/${match[1]}` : whatsapp;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
