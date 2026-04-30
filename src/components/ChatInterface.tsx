"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Persona, PersonaId } from "@/data/personas";
import { personaList, personas } from "@/data/personas";
import type { ChatMessage, ChatResponseBody } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { PersonaAvatar } from "./PersonaAvatar";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { SuggestionChips } from "./SuggestionChips";
import { TypingIndicator } from "./TypingIndicator";

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const greetingMessage = (persona: Persona): ChatMessage => ({
  id: `greet-${persona.id}`,
  role: "assistant",
  content: persona.greeting,
});

export function ChatInterface() {
  const [activeId, setActiveId] = useState<PersonaId>(personaList[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    greetingMessage(personas[personaList[0].id]),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persona = personas[activeId];

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages + isSending are trigger-only deps for scroll, not read inside.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: input is the trigger for autosize; height is computed from scrollHeight, not input.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 168)}px`;
  }, [input]);

  const switchPersona = useCallback((id: PersonaId) => {
    setActiveId(id);
    setMessages([greetingMessage(personas[id])]);
    setInput("");
    setError(null);
    setIsSending(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      const optimisticMessages = [...messages, userMsg];
      setMessages(optimisticMessages);
      setInput("");
      setIsSending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            personaId: activeId,
            messages: optimisticMessages.map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        });

        const data = (await res.json()) as ChatResponseBody;

        if (!data.ok) {
          setError(data.error);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "assistant", content: data.reply },
        ]);
      } catch {
        setError(
          "Couldn't reach the server. Check your connection and try again.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [activeId, isSending, messages],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleChipPick = (chip: string) => {
    void sendMessage(chip);
  };

  const handleRetry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    // Drop messages after the last user message and resend.
    const idx = messages.findIndex((m) => m.id === lastUser.id);
    setMessages(messages.slice(0, idx)); // remove the last user, sendMessage adds again
    void sendMessage(lastUser.content);
  };

  const showSuggestionsBelow = useMemo(
    () => messages.filter((m) => m.role === "user").length === 0,
    [messages],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-3 pb-3 pt-3 sm:gap-5 sm:px-5 sm:pt-5">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center">
              <span className="spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#e879f9,#6366f1,#f43f5e,#e879f9)] opacity-90 blur-[2px]" />
              <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-[12px] font-bold text-white">
                S
              </span>
            </span>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-white">
                Scaler Personabot
              </div>
              <div className="text-[11px] text-white/45">
                Prompt-engineering assignment · 3 personas
              </div>
            </div>
          </div>
          <a
            href="https://github.com/marvelxcodes/personabot"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/60 transition hover:border-white/20 hover:text-white sm:inline-block"
          >
            View source
          </a>
        </div>

        <PersonaSwitcher
          activeId={activeId}
          onSelect={switchPersona}
          disabled={isSending}
        />
      </header>

      {/* Active-persona banner */}
      <ActiveBanner persona={persona} />

      {/* Chat panel */}
      <section
        id="chat-panel"
        role="tabpanel"
        aria-label={`Chat with ${persona.name}`}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl"
      >
        <div
          ref={scrollRef}
          className="thin-scroll flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-5"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} persona={persona} />
          ))}
          {isSending ? <TypingIndicator persona={persona} /> : null}
          {error ? <ErrorBanner message={error} onRetry={handleRetry} /> : null}
        </div>

        <div className="border-t border-white/5 bg-black/30 px-3 py-3 sm:px-5">
          {showSuggestionsBelow ? (
            <div className="mb-3">
              <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] text-white/40">
                Try asking
              </div>
              <SuggestionChips
                persona={persona}
                onPick={handleChipPick}
                disabled={isSending}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex flex-1 items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition focus-within:border-white/25 focus-within:bg-white/[0.06]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                rows={1}
                placeholder={`Message ${persona.name.split(" ")[0]}…`}
                aria-label={`Message ${persona.name}`}
                disabled={isSending}
                className="max-h-[168px] flex-1 resize-none bg-transparent text-[14.5px] leading-relaxed text-white placeholder:text-white/35 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSending || input.trim().length === 0}
              aria-label="Send message"
              className={[
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition",
                "bg-gradient-to-br",
                persona.gradient,
                "disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110 active:scale-95",
              ].join(" ")}
              style={{ boxShadow: `0 10px 30px -10px ${persona.glow}` }}
            >
              <SendIcon />
            </button>
          </form>

          <div className="mt-2 text-center text-[10.5px] text-white/30">
            Replies are AI-generated impressions for an academic assignment ·
            not the actual person speaking.
          </div>
        </div>
      </section>
    </div>
  );
}

function ActiveBanner({ persona }: { persona: Persona }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4"
      aria-live="polite"
    >
      <div
        className={`pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${persona.gradient} opacity-25 blur-3xl`}
      />
      <div className="relative flex items-center gap-3">
        <PersonaAvatar persona={persona} size="xl" active />
        <div className="min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/45">
            Now chatting with
          </div>
          <h1 className="text-lg font-semibold text-white sm:text-xl">
            {persona.name}
          </h1>
          <p className="truncate text-[12.5px] text-white/55">{persona.role}</p>
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="leading-snug">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="self-start rounded-full border border-rose-300/30 bg-rose-500/20 px-3 py-1 text-[12px] font-medium text-rose-50 transition hover:bg-rose-500/30 sm:self-auto"
      >
        Retry
      </button>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M5 12l14-7-4 14-3-6-7-1z" />
    </svg>
  );
}
