import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
