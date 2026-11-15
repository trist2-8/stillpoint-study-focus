export function growthStage(completed: number) {
  return completed <= 0
    ? 0
    : completed < 4
      ? 1
      : completed < 12
        ? 2
        : completed < 30
          ? 3
          : 4;
}
export default function GrowthPlant({ completed }: { completed: number }) {
  const stage = growthStage(completed);
  return (
    <svg
      viewBox="0 0 150 150"
      className="growth-plant"
      role="img"
      aria-label={`Cây học tập: giai đoạn ${stage} trên 4, ${completed} phiên tập trung đã hoàn tất`}
      data-stage={stage}
    >
      <ellipse cx="75" cy="136" rx="45" ry="6" fill="var(--room-shadow)" />
      {stage > 0 && (
        <g>
          <path
            d={`M75 105Q68 82 77 ${stage === 1 ? 76 : stage === 2 ? 52 : 25}`}
            fill="none"
            stroke="var(--room-leaf-dark)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M73 91Q42 94 40 70Q67 66 73 91Z" fill="var(--room-leaf)" />
          <path
            d="M75 84Q100 88 109 61Q78 59 75 84Z"
            fill="var(--room-leaf-dark)"
          />
          {stage >= 2 && (
            <>
              <path
                d="M74 66Q48 64 45 45Q72 41 74 66Z"
                fill="var(--room-leaf-dark)"
              />
              <path
                d="M76 57Q101 61 106 36Q78 35 76 57Z"
                fill="var(--room-leaf)"
              />
            </>
          )}
          {stage >= 3 && (
            <path d="M77 42Q52 32 66 13Q87 19 77 42Z" fill="var(--room-leaf)" />
          )}
          {stage === 4 && (
            <g fill="var(--primary)">
              <circle cx="79" cy="18" r="7" />
              <circle cx="88" cy="23" r="7" />
              <circle cx="84" cy="32" r="7" />
              <circle cx="74" cy="30" r="7" />
              <circle cx="70" cy="21" r="7" />
              <circle cx="79" cy="25" r="4" fill="var(--room-sun)" />
            </g>
          )}
        </g>
      )}
      <path d="M48 106H102L95 134H55Z" fill="var(--room-pot)" />
      <rect
        x="44"
        y="100"
        width="62"
        height="10"
        rx="4"
        fill="var(--room-pot-rim)"
      />
      {stage === 0 && (
        <ellipse cx="75" cy="99" rx="5" ry="3" fill="var(--room-leaf-dark)" />
      )}
    </svg>
  );
}
