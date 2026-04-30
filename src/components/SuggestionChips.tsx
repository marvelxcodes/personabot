import type { Persona } from "@/data/personas";

type Props = {
  persona: Persona;
  onPick: (text: string) => void;
  disabled?: boolean;
};

export function SuggestionChips({ persona, onPick, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {persona.suggestionChips.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onPick(chip)}
          className={[
            "group rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5",
            "text-[12.5px] text-white/70 transition",
            "hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          <span
            className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
            style={{ background: persona.glow }}
          />
          {chip}
        </button>
      ))}
    </div>
  );
}
