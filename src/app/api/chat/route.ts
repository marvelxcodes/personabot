import { type NextRequest, NextResponse } from "next/server";
import { isPersonaId, personas } from "@/data/personas";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/types";

// Always run at request time — we never want this cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const GEMINI_ENDPOINT = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    key,
  )}`;

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

const json = (body: ChatResponseBody, init?: ResponseInit) =>
  NextResponse.json(body, init);

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(
      {
        ok: false,
        error:
          "Server is missing GEMINI_API_KEY. Add it to .env.local (see .env.example).",
      },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isPersonaId(body.personaId)) {
    return json({ ok: false, error: "Unknown persona." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(
      { ok: false, error: "messages must be a non-empty array." },
      { status: 400 },
    );
  }

  const persona = personas[body.personaId];

  // Map our chat history into Gemini's content format.
  // Trim to last 20 turns so we never blow up token budgets.
  const history = body.messages.slice(-20);
  const contents: GeminiContent[] = history
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return json(
      { ok: false, error: "The latest message must come from the user." },
      { status: 400 },
    );
  }

  const payload = {
    systemInstruction: { parts: [{ text: persona.systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.85,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      "HARM_CATEGORY_HARASSMENT",
      "HARM_CATEGORY_HATE_SPEECH",
      "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "HARM_CATEGORY_DANGEROUS_CONTENT",
    ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" })),
  };

  let upstream: Response;
  try {
    upstream = await fetch(GEMINI_ENDPOINT(GEMINI_MODEL, apiKey), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      // Don't let a slow upstream hang the route forever.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return json(
      {
        ok: false,
        error: `Could not reach the model provider (${message}). Try again in a moment.`,
      },
      { status: 502 },
    );
  }

  let data: GeminiResponse;
  try {
    data = (await upstream.json()) as GeminiResponse;
  } catch {
    return json(
      { ok: false, error: "Model returned a malformed response." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = data.error?.message ?? `HTTP ${upstream.status}`;
    return json(
      { ok: false, error: `Model provider error: ${detail}` },
      { status: 502 },
    );
  }

  const reply = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!reply) {
    const blocked = data.promptFeedback?.blockReason;
    if (blocked) {
      return json(
        {
          ok: false,
          error: `Response was blocked by safety filters (${blocked}). Try rephrasing.`,
        },
        { status: 400 },
      );
    }
    return json(
      { ok: false, error: "Model returned an empty reply." },
      { status: 502 },
    );
  }

  return json({ ok: true, reply });
}
