import { NextRequest, NextResponse } from "next/server";
import { requestInvitation } from "@/lib/invitation-store";

type Body = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  website?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The request could not be read. Please try again." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 160) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone.length > 30) {
    return NextResponse.json({ error: "Please enter a shorter phone number." }, { status: 400 });
  }

  try {
    const result = await requestInvitation({
      name,
      email,
      phone: phone || undefined,
      source: "teaser",
    });
    return NextResponse.json({ ok: true, alreadyExists: result.alreadyExists }, { status: result.alreadyExists ? 200 : 201 });
  } catch (error) {
    console.error("invitation request failed", error);
    return NextResponse.json(
      { error: "We could not save your request. Please try again shortly." },
      { status: 500 }
    );
  }
}
