import type { PersonaId } from "@/data/personas";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatRequestBody = {
  personaId: PersonaId;
  messages: Array<Pick<ChatMessage, "role" | "content">>;
};

export type ChatResponseBody =
  | { ok: true; reply: string }
  | { ok: false; error: string };
