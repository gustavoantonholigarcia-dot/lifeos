// Edge Function: Resumo da Manhã
// Cron: 0 11 * * * (8h BRT = 11h UTC)
// Monta resumo do dia e salva em `resumos` + manda push via Expo

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceKey);
  const hoje = new Date().toISOString().slice(0, 10);

  // Buscar todos os users com push token
  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("user_id, token");

  if (!tokens || tokens.length === 0) {
    return new Response("Nenhum token registrado", { status: 200 });
  }

  const userIds = [...new Set(tokens.map((t: any) => t.user_id))];

  for (const userId of userIds) {
    // Tarefas pendentes do user
    const { data: tarefas } = await supabase
      .from("tarefas")
      .select("id, titulo, modulo, prioridade, prazo_em, status")
      .eq("user_id", userId)
      .in("status", ["a_fazer", "em_andamento"]);

    const total = tarefas?.length ?? 0;
    const tawa = tarefas?.filter((t: any) => t.modulo === "tawa").length ?? 0;
    const utfpr = tarefas?.filter((t: any) => t.modulo === "utfpr").length ?? 0;

    // Prazos hoje/amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaISO = amanha.toISOString().slice(0, 10);

    const urgentes = tarefas?.filter((t: any) => {
      if (!t.prazo_em) return false;
      const prazoData = t.prazo_em.slice(0, 10);
      return prazoData <= amanhaISO;
    }) ?? [];

    // Montar texto
    const partes: string[] = [];
    partes.push(`${total} tarefa${total !== 1 ? "s" : ""} pendente${total !== 1 ? "s" : ""}`);
    if (tawa > 0) partes.push(`${tawa} TAWA`);
    if (utfpr > 0) partes.push(`${utfpr} UTFPR`);
    if (urgentes.length > 0) {
      partes.push(
        `${urgentes.length} com prazo até amanhã: ${urgentes
          .slice(0, 3)
          .map((t: any) => t.titulo)
          .join(", ")}`,
      );
    }

    const conteudo = partes.join(" · ");

    // Salvar resumo
    await supabase.from("resumos").upsert(
      { user_id: userId, tipo: "manha", conteudo, data: hoje },
      { onConflict: "user_id,tipo,data" },
    ).then(() => {});

    // Push via Expo
    const userTokens = tokens.filter((t: any) => t.user_id === userId);
    const pushBody = userTokens.map((t: any) => ({
      to: t.token,
      title: "Bom dia",
      body: conteudo,
      data: { tipo: "resumo_manha" },
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
