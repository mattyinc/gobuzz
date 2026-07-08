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

function shortDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

/**
 * "Quick add" deep link — no API key or app required, works in any browser.
 * This is the calendar half of "save to your phone"; Apple Mail and Outlook
 * also pick up the .ics attachment automatically without needing this link.
 */
function buildGoogleCalendarUrl(booking: BookingRecord, portalUrl: string): string {
  const facility = FACILITIES[booking.facility];
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Go'Buzz — ${facility.name}`,
    dates: `${icsUtc(booking.date, booking.start)}/${icsUtc(booking.date, booking.start, facility.duration)}`,
    details: `Booking code ${booking.code}. Arrive 10 minutes early.\nManage your session: ${portalUrl}`,
    location: "Go'Buzz Wellness, Bole, Addis Ababa",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildHtml(
  booking: BookingRecord,
  portalUrl: string,
  qrUrl: string,
  gcalUrl: string
): string {
  const facility = FACILITIES[booking.facility];
  const occupancy =
    facility.capacity === 1 ? "Private session" : `${booking.spots} of ${facility.capacity} spots`;

  return `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f1e6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td style="padding:0 8px 24px;" align="center">
    <div style="font:700 26px Georgia,serif;color:#86691c;">Go&rsquo;Buzz</div>
    <div style="font:600 10px Arial,sans-serif;letter-spacing:3px;color:#94896f;text-transform:uppercase;margin-top:6px;">Move &middot; Think &middot; Recover</div>
  </td></tr>
  <tr><td style="background:#fffdf7;border:1px solid rgba(134,105,28,0.25);border-radius:20px;padding:36px 36px 8px;">
    <div style="font:400 30px Georgia,serif;color:#1b1710;">You&rsquo;re booked${booking.name ? `, ${booking.name.split(" ")[0]}` : ""}.</div>
    <p style="font:400 15px/1.6 Arial,sans-serif;color:#5d5546;margin:14px 0 4px;">
      Your pass is below — show it at the front desk, or let them scan the QR.
      Please arrive 10 minutes early. Towels and water are on us.
    </p>
  </td></tr>

  <!-- pass card -->
  <tr><td style="padding:0 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border:1px solid rgba(134,105,28,0.3);border-radius:18px;overflow:hidden;">
      <tr><td style="background:#1b1710;padding:22px 26px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font:600 10px Arial,sans-serif;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">Go&rsquo;Buzz Pass</td>
            <td align="right" style="font:600 10px Arial,sans-serif;letter-spacing:2px;color:#8a8062;text-transform:uppercase;">${facility.duration} min</td>
          </tr>
        </table>
        <div style="font:500 25px Georgia,serif;color:#f8f1df;margin-top:8px;">${facility.name}</div>
        <div style="font:400 13px Arial,sans-serif;color:#b3a98f;margin-top:4px;">${shortDate(booking.date)} &middot; ${booking.start} &middot; ${occupancy}</div>
      </td></tr>
      <tr><td style="line-height:0;font-size:0;">
        <div style="border-top:2px dashed rgba(134,105,28,0.45);"></div>
      </td></tr>
      <tr><td style="background:#fffdf7;padding:28px 26px 30px;text-align:center;">
        <img src="${qrUrl}" alt="Booking QR code" width="172" height="172" style="border:1px solid rgba(134,105,28,0.25);border-radius:14px;" />
        <div style="font:600 10px Arial,sans-serif;letter-spacing:3px;color:#94896f;text-transform:uppercase;margin-top:16px;">Booking code</div>
        <div style="font:500 34px Georgia,serif;color:#86691c;letter-spacing:3px;margin-top:4px;">${booking.code}</div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 36px 36px;text-align:center;">
    <a href="${gcalUrl}" style="display:inline-block;background:#fffdf7;border:1.5px solid #86691c;color:#86691c;font:600 13px Arial,sans-serif;text-decoration:none;padding:12px 26px;border-radius:999px;">Add to Calendar</a>
    <div style="height:12px;line-height:12px;font-size:1px;">&nbsp;</div>
    <a href="${portalUrl}" style="display:inline-block;background:#86691c;color:#fffdf7;font:600 13px Arial,sans-serif;text-decoration:none;padding:12px 26px;border-radius:999px;">View My Session</a>
    <p style="font:400 12px/1.6 Arial,sans-serif;color:#94896f;margin:18px 0 0;">
      Using Apple Mail or Outlook? The calendar file attached to this email adds it automatically.
    </p>
  </td></tr>

  <tr><td align="center" style="padding:0 8px 24px;font:400 12px/1.7 Arial,sans-serif;color:#94896f;">
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
  const gcalUrl = buildGoogleCalendarUrl(booking, portalUrl);

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
        html: buildHtml(booking, portalUrl, qrUrl, gcalUrl),
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
