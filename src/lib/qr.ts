import QRCode from "qrcode";

/** Deep link the QR resolves to — the client portal with the code prefilled. */
export function bookingDeepLink(origin: string, code: string): string {
  return `${origin}/my-booking?code=${encodeURIComponent(code)}`;
}

/** Brand-tinted QR PNG (warm ink on cream — scans reliably in both themes). */
export async function bookingQrPng(origin: string, code: string): Promise<Buffer> {
  return QRCode.toBuffer(bookingDeepLink(origin, code), {
    type: "png",
    width: 480,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1710", light: "#f8f1df" },
  });
}

/** Canonical absolute origin for links that leave the site (emails, QR). */
export function siteOrigin(requestOrigin: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || requestOrigin;
}
