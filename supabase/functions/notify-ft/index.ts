// DRAFT — Supabase Edge Function: send Web Push "full time" result to every participant of a match.
// Not active until Supabase is connected. Secrets are set with `supabase secrets set` (never committed):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...), NOTIFY_SECRET
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
// Call: POST /functions/v1/notify-ft  header x-notify-secret: <NOTIFY_SECRET>  body {"match_id":"<uuid>"}
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  if (req.headers.get("x-notify-secret") !== Deno.env.get("NOTIFY_SECRET")) return new Response("forbidden", { status: 403 });
  const { match_id } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(String(match_id || ""))) return new Response("bad id", { status: 400 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);
  const { data: m } = await db.from("matches").select("id,home,away,home_score,away_score").eq("id", match_id).single();
  if (!m) return new Response("no match", { status: 404 });
  const { data: preds } = await db.from("predictions").select("user_id,points,profiles(name)").eq("match_id", match_id).order("points", { ascending: false });
  const top = preds?.[0] as any;
  const hs = m.home_score ?? 0, as = m.away_score ?? 0;
  const winner = hs > as ? m.home : as > hs ? m.away : "Draw / תיקו";
  const body = `${m.home} ${hs}:${as} ${m.away} · 🏆 ${winner} · ⚽ ${top?.profiles?.name ?? "—"}`;
  const ids = (preds || []).map((p: any) => p.user_id);
  const { data: subs } = await db.from("push_subscriptions").select("endpoint,p256dh,auth").in("user_id", ids);
  let sent = 0;
  for (const s of subs || []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: "BulGol 🏁", body, m: match_id }));
      sent++;
    } catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) await db.from("push_subscriptions").delete().eq("endpoint", s.endpoint); }
  }
  return Response.json({ sent });
});
