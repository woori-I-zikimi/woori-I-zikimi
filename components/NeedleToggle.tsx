"use client";

type Props = { active: boolean; onToggle: () => void };

export default function NeedleToggle({ active, onToggle }: Props) {
    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            className={`needle-fab ${active ? "active" : ""}`}
            aria-pressed={active}
            onClick={onToggle}
            title={active ? "바늘 모드 끄기 (Esc)" : "바늘 모드 켜기"}
        >
            <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden>
                <line
                    x1="3"
                    y1="29"
                    x2="29"
                    y2="3"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <circle cx="29" cy="3" r="2" fill="black" />
            </svg>
        </button>
    );
}
