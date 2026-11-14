import { useId } from "react";
import type { TimerState } from "../../../types";

export function StudyCompanion({
  status,
  mode,
}: {
  status: TimerState["status"];
  mode: TimerState["mode"];
}) {
  const state =
    mode !== "FOCUS"
      ? "resting"
      : status === "RUNNING"
        ? "awake"
        : status === "COMPLETED"
          ? "happy"
          : "sleeping";
  return (
    <g className="study-cat" data-state={state} transform="translate(576 466)">
      <ellipse cx="40" cy="49" rx="64" ry="9" fill="var(--room-shadow)" />
      <g className="cat-body">
        <path
          d="M5 44C-14 12 22-9 53 6C79 9 96 30 80 45Z"
          fill="var(--cat-fur)"
        />
        <path
          d="M70 39C111 50 108 17 87 20"
          fill="none"
          stroke="var(--cat-fur)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M-3 20L-5-7 13 3Q25-1 36 6L49-8 50 24Q45 48 23 46Q0 44-3 20Z"
          fill="var(--cat-light)"
        />
        <path d="M0 2L3 16 12 9M42 3L33 12 44 16" fill="var(--cat-fur)" />
        {state === "awake" ? (
          <g fill="var(--room-ink)">
            <ellipse cx="12" cy="25" rx="2" ry="4" />
            <ellipse cx="34" cy="25" rx="2" ry="4" />
          </g>
        ) : (
          <g
            fill="none"
            stroke="var(--room-ink)"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path
              d={state === "happy" ? "M7 26Q12 19 17 26" : "M7 24Q12 29 17 24"}
            />
            <path
              d={
                state === "happy" ? "M29 26Q34 19 39 26" : "M29 24Q34 29 39 24"
              }
            />
          </g>
        )}
        <path d="M20 30L25 30 23 33Z" fill="var(--room-ink)" />
        <path
          d="M4 32L-7 29M4 36L-7 37M41 32L53 29"
          stroke="var(--room-ink)"
          strokeWidth="1"
          opacity=".5"
        />
        <ellipse cx="36" cy="45" rx="14" ry="5" fill="var(--cat-light)" />
      </g>
    </g>
  );
}

/** Original vector environment. Decorative and independent of the timer engine. */
export default function StudyRoom({
  status,
  mode,
  companion,
}: {
  status: TimerState["status"];
  mode: TimerState["mode"];
  companion: boolean;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className="study-room-art"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--room-sky)" />
          <stop offset="1" stopColor="var(--room-horizon)" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2=".7" y2="1">
          <stop stopColor="var(--room-sun)" stopOpacity=".3" />
          <stop offset="1" stopColor="var(--room-sun)" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-window`}>
          <path d="M172 388V174a228 158 0 0 1 456 0v214Z" />
        </clipPath>
      </defs>
      <path
        d="M150 405V174a250 180 0 0 1 500 0v231Z"
        fill="var(--room-frame)"
      />
      <g clipPath={`url(#${id}-window)`}>
        <path d="M172 0H628V400H172Z" fill={`url(#${id}-sky)`} />
        <circle
          className="room-sun"
          cx="535"
          cy="113"
          r="37"
          fill="var(--room-sun)"
        />
        <g className="room-stars" fill="var(--room-sun)">
          {[
            [230, 90],
            [310, 44],
            [446, 70],
            [578, 185],
            [206, 231],
            [490, 165],
            [367, 112],
          ].map(([x, y]) => (
            <path key={x} d={`M${x} ${y - 4}l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z`} />
          ))}
        </g>
        <path
          d="M150 303Q235 215 340 284T650 244V410H150Z"
          fill="var(--room-hill-far)"
        />
        <path
          d="M150 337Q293 250 437 329T650 284V410H150Z"
          fill="var(--room-hill-near)"
        />
        <path
          d="M400 20V388M172 232H628"
          stroke="var(--room-frame)"
          strokeWidth="8"
        />
      </g>
      <path
        d="M141 402H659"
        stroke="var(--room-frame)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path d="M180 260L558 580H790L625 260Z" fill={`url(#${id}-light)`} />
      <path
        d="M105 27Q136 186 100 418L143 413Q175 225 150 20Z"
        fill="var(--room-curtain)"
        opacity=".65"
      />
      <path
        d="M650 20Q626 225 657 413L700 418Q665 186 695 27Z"
        fill="var(--room-curtain)"
        opacity=".65"
      />
      <g className="room-houseplant"><g
        fill="none"
        stroke="var(--room-leaf-dark)"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M94 478Q76 405 102 338M94 443Q51 413 48 376M99 415Q145 386 145 351" />
      </g>
      <g fill="var(--room-leaf)">
        <path d="M103 386Q65 359 104 330Q123 356 103 386Z" />
        <path d="M85 422Q40 417 42 370Q76 381 85 422Z" />
        <path d="M102 416Q108 365 150 346Q162 396 102 416Z" />
        <path d="M91 452Q40 452 29 416Q72 408 91 452Z" />
      </g>
      <path d="M59 456H121L113 501H69Z" fill="var(--room-pot)" />
      <path d="M57 454H123V463H57Z" fill="var(--room-pot-rim)" />
      </g>
      <path d="M60 509H741L766 535H35Z" fill="var(--room-wood)" />
      <path d="M35 535H766V548H35Z" fill="var(--room-wood-edge)" />
      <path
        d="M72 548L66 600M725 548L731 600"
        stroke="var(--room-wood-edge)"
        strokeWidth="16"
      />
      <g stroke="var(--room-book-line)" strokeWidth="1.5">
        <rect
          x="155"
          y="488"
          width="116"
          height="20"
          rx="3"
          fill="var(--room-book)"
        />
        <path d="M165 494H263M165 500H263" />
        <rect
          x="166"
          y="470"
          width="96"
          height="17"
          rx="3"
          fill="var(--room-paper)"
        />
        <path d="M174 476H253M174 481H253" />
        <path d="M158 450L264 458 262 474 156 466Z" fill="var(--accent)" />
      </g>
      <path
        d="M320 501Q354 486 391 494L402 513Q364 505 327 519Z"
        fill="var(--room-paper)"
      />
      <path
        d="M391 494Q424 482 462 491L465 513Q431 505 402 513Z"
        fill="var(--room-paper)"
      />
      <path
        d="M391 495L402 512M335 504L379 499M416 498L451 496"
        stroke="var(--room-book-line)"
        fill="none"
      />
      <path d="M489 470H521V498Q505 513 489 498Z" fill="var(--room-paper)" />
      <path
        d="M521 476Q544 473 534 490H522"
        fill="none"
        stroke="var(--room-paper)"
        strokeWidth="5"
      />
      <path
        className="tea-steam"
        d="M501 460Q492 451 502 440M512 458Q520 447 512 435"
        fill="none"
        stroke="var(--room-frame)"
        strokeWidth="2"
      />
      {companion && <StudyCompanion status={status} mode={mode} />}
      <g className="lavender-petals" fill="var(--accent)" opacity=".7">
        <ellipse cx="72" cy="205" rx="3" ry="8" transform="rotate(32 72 205)" />
        <ellipse
          cx="716"
          cy="285"
          rx="3"
          ry="7"
          transform="rotate(-28 716 285)"
        />
        <ellipse
          cx="679"
          cy="118"
          rx="3"
          ry="7"
          transform="rotate(44 679 118)"
        />
      </g>
    </svg>
  );
}
