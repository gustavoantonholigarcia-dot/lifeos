// Edge Function: Analisar Ideia (sócio crítico via Claude)
// Disparada pelo app (botão "Analisar com IA" no detalhe da ideia).
// Lê a ideia + provocações + hipóteses, manda pro Claude e grava em
// `ideia_insights` (fonte = 'ia'). Respeita RLS: usa o JWT do usuário.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// System prompt FIXO (estável) — fica no início pra aproveitar prompt caching.
const SYSTEM = `Você é um sócio crítico e experiente de negócios, analisando uma ideia que um jovem empreendedor brasileiro (sucessor de uma indústria) registrou no app dele.

Seu papel NÃO é validar nem animar. É afiar a ideia: apontar onde o raciocínio falha, o que ele não está vendo, e o próximo passo mais concreto e barato pra testar a hipótese mais arriscada.

Regras:
- Português brasileiro, direto, sem enrolação e sem floreio.
- Baseie-se SÓ no que foi preenchido. Onde faltar informação, diga que falta — não invente fatos sobre o mercado.
- Para ideia tipo "oportunidade" (investimento/ativo, ex: comprar terra), foque em retorno x risco, custo de entrada, pior cenário e liquidez de saída. Para "construir" (produto/serviço), foque em demanda real, primeiro cliente, canal e diferencial defensável.
- Cada insight deve ser específico e acionável, não genérico.

Responda APENAS com um objeto JSON válido, sem markdown, no formato:
{"insights":[{"tipo":"analise|risco|concorrencia|proximo_passo","titulo":"curto","conteudo":"2-4 frases"}]}
Gere de 3 a 5 insights, incluindo obrigatoriamente pelo menos um "risco" e um "proximo_passo".`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Não autenticado" }, 401);
    }
    const { ideia_id } = await req.json();
    if (!ideia_id) return json({ error: "ideia_id obrigatório" }, 400);

    // Client com o JWT do usuário → RLS garante que ele só vê a própria ideia.
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Sessão inválida" }, 401);

    const { data: ideia, error: eIdeia } = await supabase
      .from("ideias")
      .select("*")
      .eq("id", ideia_id)
      .maybeSingle();
    if (eIdeia) throw eIdeia;
    if (!ideia) return json({ error: "Ideia não encontrada" }, 404);

    const [{ data: hipoteses }, { data: provocacoes }] = await Promise.all([
      supabase.from("ideia_hipoteses").select("texto, como_testar, status, aprendizado").eq("ideia_id", ideia_id),
      supabase.from("ideia_provocacoes").select("prompt_id, resposta").eq("ideia_id", ideia_id),
    ]);

    // Conteúdo volátil DEPOIS do system fixo (mantém o cache do prefixo).
    const contexto = montarContexto(ideia, hipoteses ?? [], provocacoes ?? []);

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 2048,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system: [
          { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        ],
        messages: [{ role: "user", content: contexto }],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return json({ error: `Claude ${resp.status}: ${txt.slice(0, 300)}` }, 502);
    }

    const data = await resp.json();
    const texto = (data.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    const insights = parseInsights(texto);
    if (insights.length === 0) {
      return json({ error: "Resposta da IA não pôde ser interpretada" }, 502);
    }

    // Limpa insights de IA anteriores dessa ideia e grava os novos.
    await supabase.from("ideia_insights").delete().eq("ideia_id", ideia_id).eq("fonte", "ia");

    const linhas = insights.map((i) => ({
      user_id: user.id,
      ideia_id,
      tipo: i.tipo,
      titulo: i.titulo,
      conteudo: i.conteudo,
      fonte: "ia",
    }));
    const { error: eIns } = await supabase.from("ideia_insights").insert(linhas);
    if (eIns) throw eIns;

    return json({ ok: true, count: linhas.length }, 200);
  } catch (e) {
    return json({ error: String((e as any)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

function montarContexto(ideia: any, hipoteses: any[], provocacoes: any[]): string {
  const linha = (rotulo: string, v: any) => (v ? `${rotulo}: ${v}` : null);
  const tipo = ideia.tipo === "oportunidade" ? "Oportunidade/investimento" : "Negócio a construir";
  const partes = [
    `IDEIA: ${ideia.nome}`,
    `TIPO: ${tipo}`,
    `ESTÁGIO: ${ideia.estagio}`,
    linha(ideia.tipo === "oportunidade" ? "Tese" : "Problema", ideia.problema),
    linha(ideia.tipo === "oportunidade" ? "Como executa" : "Solução", ideia.solucao),
    linha(ideia.tipo === "oportunidade" ? "Contraparte" : "Público/quem paga", ideia.publico_alvo),
    linha(ideia.tipo === "oportunidade" ? "Custo de entrada e retorno" : "Quanto pagam hoje", ideia.quanto_pagam),
    linha(ideia.tipo === "oportunidade" ? "Quem já fez" : "Concorrentes", ideia.concorrentes),
    linha("Vantagem injusta", ideia.vantagem_injusta),
    linha(ideia.tipo === "oportunidade" ? "Saída/liquidez" : "Canais", ideia.canais),
    linha("Métrica-chave", ideia.metrica_chave),
    linha("Notas", ideia.notas),
  ].filter(Boolean);

  if (hipoteses.length > 0) {
    partes.push("\nHIPÓTESES:");
    for (const h of hipoteses) {
      partes.push(`- [${h.status}] ${h.texto}${h.como_testar ? ` (teste: ${h.como_testar})` : ""}${h.aprendizado ? ` → ${h.aprendizado}` : ""}`);
    }
  }
  if (provocacoes.length > 0) {
    partes.push("\nRESPOSTAS A PROVOCAÇÕES (advogado do diabo):");
    for (const p of provocacoes) partes.push(`- ${p.prompt_id}: ${p.resposta}`);
  }

  partes.push("\nAnalise esta ideia e devolva o JSON de insights.");
  return partes.join("\n");
}

function parseInsights(texto: string): { tipo: string; titulo: string; conteudo: string }[] {
  const tiposValidos = ["analise", "risco", "concorrencia", "proximo_passo"];
  try {
    const inicio = texto.indexOf("{");
    const fim = texto.lastIndexOf("}");
    if (inicio === -1 || fim === -1) return [];
    const obj = JSON.parse(texto.slice(inicio, fim + 1));
    const arr = Array.isArray(obj.insights) ? obj.insights : [];
    return arr
      .filter((i: any) => i && typeof i.conteudo === "string" && i.conteudo.trim())
      .map((i: any) => ({
        tipo: tiposValidos.includes(i.tipo) ? i.tipo : "analise",
        titulo: String(i.titulo ?? "").slice(0, 120),
        conteudo: String(i.conteudo).trim(),
      }));
  } catch {
    return [];
  }
}
