import { FACILITIES } from "./facilities";
import { type BookingRecord } from "./booking-store";
import { bookingDeepLink, bookingQrPng } from "./qr";

export type EmailResult = { sent: boolean; reason?: string };

/** Addis Ababa is UTC+3 year-round — convert a local date + HH:MM to a UTC ICS stamp. */
function icsUtc(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, hh, mm + addMinutes) - 3 * 60 * 60 * 1000);
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildIcs(booking: BookingRecord, portalUrl: string): string {
  const facility = FACILITIES[booking.facility];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Go'Buzz Wellness//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.code}@gobuzzwellness.com`,
    `DTSTAMP:${icsUtc(booking.date, booking.start)}`,
    `DTSTART:${icsUtc(booking.date, booking.start)}`,
    `DTEND:${icsUtc(booking.date, booking.start, facility.duration)}`,
    `SUMMARY:Go'Buzz — ${facility.name}`,
    `DESCRIPTION:Booking code ${booking.code}. Arrive 10 minutes early.\\nManage: ${portalUrl}`,
    "LOCATION:Go'Buzz Wellness\\, Bole\\, Addis Ababa",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Your Go'Buzz session starts in one hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function prettyDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function buildHtml(booking: BookingRecord, portalUrl: string, qrUrl: string): string {
  const facility = FACILITIES[booking.facility];
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;font:600 11px/1 Arial,sans-serif;letter-spacing:2px;color:#94896f;text-transform:uppercase;">${label}</td>
      <td style="padding:8px 0;font:500 15px/1.4 Georgia,serif;color:#1b1710;text-align:right;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f1e6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="padding:0 8px 24px;" align="center">
    <div style="font:700 26px Georgia,serif;color:#86691c;">Go&rsquo;Buzz</div>
    <div style="font:600 10px Arial,sans-serif;letter-spacing:3px;color:#94896f;text-transform:uppercase;margin-top:6px;">Move &middot; Think &middot; Recover</div>
  </td></tr>
  <tr><td style="background:#fffdf7;border:1px solid rgba(134,105,28,0.25);border-radius:20px;padding:36px 36px 28px;">
    <div style="font:400 30px Georgia,serif;color:#1b1710;">You&rsquo;re booked${booking.name ? `, ${booking.name.split(" ")[0]}` : ""}.</div>
    <p style="font:400 15px/1.6 Arial,sans-serif;color:#5d5546;margin:14px 0 26px;">
      Show the code below at the front desk — or just let them scan your QR.
      Please arrive 10 minutes early. Towels and water are on us.
    </p>
    <div style="text-align:center;padding:20px 0 8px;border-top:1px solid rgba(134,105,28,0.18);">
      <div style="font:600 10px Arial,sans-serif;letter-spacing:3px;color:#94896f;text-transform:uppercase;">Booking code</div>
      <div style="font:500 40px Georgia,serif;color:#86691c;letter-spacing:3px;margin:8px 0 16px;">${booking.code}</div>
      <img src="${qrUrl}" alt="Booking QR code" width="180" height="180" style="border:1px solid rgba(134,105,28,0.25);border-radius:14px;" />
      <div style="font:400 12px Arial,sans-serif;color:#94896f;margin-top:10px;">Save this image to your phone or wallet app.</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid rgba(134,105,28,0.18);padding-top:8px;">
      ${row("Experience", facility.name)}
      ${row("Date", prettyDate(booking.date))}
      ${row("Time", `${booking.start} &middot; ${facility.duration} minutes`)}
      ${row(facility.capacity === 1 ? "Occupancy" : "Spots", facility.capacity === 1 ? "Private session" : `${booking.spots} of ${facility.capacity}`)}
    </table>
    <div style="text-align:center;margin-top:28px;">
      <a href="${portalUrl}" style="display:inline-block;background:#86691c;color:#fffdf7;font:600 14px Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:999px;">View my session</a>
    </div>
  </td></tr>
  <tr><td align="center" style="padding:24px 8px;font:400 12px/1.7 Arial,sans-serif;color:#94896f;">
    Go&rsquo;Buzz Wellness &middot; Bole, Addis Ababa<br/>
    Mon&ndash;Fri 6:00&ndash;21:00 &middot; Sat&ndash;Sun 7:00&ndash;20:00<br/>
    Cancellations close 2 hours before your session.
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

/**
 * Sends the confirmation via Resend. Soft-fails (never throws) so a booking
 * always succeeds even when email is down or unconfigured.
 */
export async function sendBookingConfirmation(
  booking: BookingRecord,
  origin: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not set" };

  const facility = FACILITIES[booking.facility];
  const portalUrl = bookingDeepLink(origin, booking.code);
  const qrUrl = `${origin}/api/bookings/${booking.code}/qr`;

  try {
    const qrPng = await bookingQrPng(origin, booking.code);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.BOOKING_FROM_EMAIL || "Go'Buzz Wellness <onboarding@resend.dev>",
        to: [booking.email],
        subject: `You're booked — ${facility.name}, ${prettyDate(booking.date)} at ${booking.start} · ${booking.code}`,
        html: buildHtml(booking, portalUrl, qrUrl),
        attachments: [
          {
            filename: `gobuzz-${booking.code}-qr.png`,
            content: qrPng.toString("base64"),
          },
          {
            filename: "gobuzz-session.ics",
            content: Buffer.from(buildIcs(booking, portalUrl)).toString("base64"),
            content_type: "text/calendar",
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("confirmation email rejected", res.status, body);
      return { sent: false, reason: `resend ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("confirmation email failed", err);
    return { sent: false, reason: "network error" };
  }
}
