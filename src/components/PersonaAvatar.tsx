import type { Persona } from "@/data/personas";

type Props = {
  persona: Persona;
  size?: "sm" | "md" | "lg" | "xl";
  active?: boolean;
};

const sizeMap: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-lg",
};

export function PersonaAvatar({ persona, size = "md", active }: Props) {
  return (
    <span
      className={[
        "relative inline-flex items-center justify-center rounded-full font-semibold text-white shadow-lg shadow-black/40",
        "bg-gradient-to-br",
        persona.gradient,
        sizeMap[size],
      ].join(" ")}
      aria-hidden="true"
    >
      {active ? (
        <span
          className="pointer-events-none absolute -inset-[2px] rounded-full opacity-70 blur-[2px]"
          style={{
            background: `conic-gradient(from 0deg, ${persona.glow}, transparent 30%, ${persona.glow})`,
          }}
        />
      ) : null}
      <span className="relative tracking-wide">{persona.initials}</span>
    </span>
  );
}
