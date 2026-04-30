"use client";

import type { Persona, PersonaId } from "@/data/personas";
import { personaList } from "@/data/personas";
import { PersonaAvatar } from "./PersonaAvatar";

type Props = {
  activeId: PersonaId;
  onSelect: (id: PersonaId) => void;
  disabled?: boolean;
};

export function PersonaSwitcher({ activeId, onSelect, disabled }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Choose a persona"
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      {personaList.map((persona) => {
        const isActive = persona.id === activeId;
        return (
          <PersonaTab
            key={persona.id}
            persona={persona}
            isActive={isActive}
            onSelect={onSelect}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}

function PersonaTab({
  persona,
  isActive,
  onSelect,
  disabled,
}: {
  persona: Persona;
  isActive: boolean;
  onSelect: (id: PersonaId) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls="chat-panel"
      disabled={disabled}
      onClick={() => onSelect(persona.id)}
      className={[
        "group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border p-3 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60",
        isActive
          ? "border-white/20 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_-20px_rgba(217,70,239,0.45)]"
          : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br",
          persona.gradient,
          isActive ? "opacity-[0.18]" : "group-hover:opacity-[0.10]",
        ].join(" ")}
      />
      <div className="relative z-10 flex w-full items-center gap-2">
        <PersonaAvatar persona={persona} size="md" active={isActive} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">
            {persona.name}
          </div>
          <div className="truncate text-[11px] text-white/55">
            {persona.role}
          </div>
        </div>
        {isActive ? (
          <span className="hidden h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] sm:inline-block" />
        ) : null}
      </div>
      <p className="relative z-10 hidden text-[11px] leading-snug text-white/55 sm:block">
        {persona.shortBio}
      </p>
    </button>
  );
}
