import type { Persona } from "@/data/personas";
import { PersonaAvatar } from "./PersonaAvatar";

export function TypingIndicator({ persona }: { persona: Persona }) {
  return (
    <div className="msg-rise flex w-full gap-3" aria-live="polite">
      <PersonaAvatar persona={persona} size="md" />
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <span
          className="typing-dot inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: persona.glow }}
        />
        <span
          className="typing-dot inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: persona.glow }}
        />
        <span
          className="typing-dot inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: persona.glow }}
        />
        <span className="ml-2 text-[11px] text-white/45">
          {persona.name.split(" ")[0]} is thinking…
        </span>
      </div>
    </div>
  );
}
