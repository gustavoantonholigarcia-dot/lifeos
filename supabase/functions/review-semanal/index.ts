// Edge Function: Review Semanal
// Cron: 0 23 * * 0 (domingo 20h BRT = 23h UTC)
// Monta resumo da semana e salva em `resumos` + manda push

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceKey);
  const hoje = new Date();
  const hojeISO = hoje.toISOString().slice(0, 10);

  // 7 dias atrás
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const semanaISO = seteDiasAtras.toISOString().slice(0, 10);

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("user_id, token");

  if (!tokens || tokens.length === 0) {
    return new Response("Nenhum token", { status: 200 });
  }

  const userIds = [...new Set(tokens.map((t: any) => t.user_id))];

  for (const userId of userIds) {
    // Dias que abriu o app na semana
    const { data: opens } = await supabase
      .from("app_opens")
      .select("data")
      .eq("user_id", userId)
      .gte("data", semanaISO)
      .lte("data", hojeISO);

    const diasAbriu = opens?.length ?? 0;

    // Tarefas criadas na semana
    const { count: criadas } = await supabase
      .from("tarefas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", seteDiasAtras.toISOString());

    // Tarefas concluídas na semana
    const { count: concluidas } = await supabase
      .from("tarefas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "concluido")
      .gte("concluida_em", seteDiasAtras.toISOString());

    // Tarefas ainda pendentes
    const { count: pendentes } = await supabase
      .from("tarefas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["a_fazer", "em_andamento"]);

    const partes: string[] = [];
    partes.push(`Abriu o app ${diasAbriu}/7 dias`);
    partes.push(`${criadas ?? 0} criadas · ${concluidas ?? 0} concluídas`);
    partes.push(`${pendentes ?? 0} pendentes`);

    if (diasAbriu >= 4) {
      partes.push("GATE OK esta semana");
    } else {
      partes.push(`Faltam ${4 - diasAbriu} dias pra bater o GATE`);
    }

    const conteudo = partes.join("\n");

    await supabase.from("resumos").insert({
      user_id: userId,
      tipo: "semanal",
      conteudo,
      data: hojeISO,
    });

    // Push
    const userTokens = tokens.filter((t: any) => t.user_id === userId);
    const pushBody = userTokens.map((t: any) => ({
      to: t.token,
      title: "Review da semana",
      body: `${diasAbriu}/7 dias · ${concluidas ?? 0} concluídas`,
      data: { tipo: "review_semanal" },
      sound: "default",
    }));

    if (pushBody.length > 0) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pushBody),
      }).catch(() => {});
    }
  }

  return new Response("OK", { status: 200 });
});
