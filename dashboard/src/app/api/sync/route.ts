import { NextResponse } from "next/server";

export async function POST() {
  const webhookUrl = process.env.GOOGLE_SYNC_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "GOOGLE_SYNC_WEBHOOK_URL not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(webhookUrl, { method: "GET" });
    const text = await res.text();
    return NextResponse.json({ ok: true, message: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
