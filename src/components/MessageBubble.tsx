import type { Persona } from "@/data/personas";
import type { ChatMessage } from "@/lib/types";
import { PersonaAvatar } from "./PersonaAvatar";

type Props = {
  message: ChatMessage;
  persona: Persona;
};

export function MessageBubble({ message, persona }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={[
        "msg-rise flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      {isUser ? <UserAvatar /> : <PersonaAvatar persona={persona} size="md" />}
      <div
        className={[
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm sm:max-w-[70%]",
          isUser
            ? `text-white shadow-[0_8px_30px_-10px] bg-gradient-to-br ${persona.gradient}`
            : "border border-white/10 bg-white/[0.04] text-white/90 backdrop-blur-sm",
        ].join(" ")}
        style={
          isUser ? { boxShadow: `0 8px 30px -10px ${persona.glow}` } : undefined
        }
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

function UserAvatar() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold text-white/80"
    >
      You
    </span>
  );
}
