import { useId } from "react";
import type { StudyWorldId } from "../../types";
export default function RoomEffects({ world }: { world: StudyWorldId }) {
  const identity = useId().replaceAll(":", "");
  const clip = identity + "window";
  const glow = identity + "glow";
  const beam = identity + "beam";
  const windows: Record<StudyWorldId, string[]> = {
    "rainy-cafe": [
      "M400 62H738V913H396Z",
      "M813 43H1184V835H810Z",
      "M1250 65H1615V622H1248Z",
    ],
    forest: [
      "M0 24L205 94V785L0 905Z",
      "M278 96L591 136V674L275 765Z",
      "M628 155L850 195V613L625 658Z",
      "M948 174H1396V602H948Z",
      "M1872 159L2048 107V840L1870 760Z",
    ],
    midnight: [
      "M955 0H1440L1848 633L1500 614Z",
      "M765 20L1050 2L1413 598L1167 577Z",
    ],
    lavender: [
      "M1010 351L1078 366V751L1010 742Z",
      "M1121 368H1240V750H1121Z",
      "M1287 365H1420V752H1287Z",
      "M1471 355L1616 327V737L1471 753Z",
    ],
    academia: ["M346 0H1682L1670 346H340Z", "M920 402H1120V724H920Z"],
    exam: ["M1695 0H2020V775L1660 674Z"],
  };
  return (
    <svg
      className="room-effects"
      viewBox="0 0 2048 1152"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clip}>
          {windows[world].map((path, index) => (
            <path key={index} d={path} />
          ))}
        </clipPath>
        <radialGradient id={glow}>
          <stop stopColor="#ffe3a2" stopOpacity=".28" />
          <stop offset="1" stopColor="#ffe3a2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={beam} x2="1" y2="1">
          <stop stopColor="#fff3cc" stopOpacity=".12" />
          <stop offset="1" stopColor="#fff3cc" stopOpacity="0" />
        </linearGradient>
      </defs>
      {(world === "rainy-cafe" || world === "forest") && (
        <g clipPath={"url(#" + clip + ")"}>
          <g
            className="room-rain"
            stroke="#e6eff0"
            strokeWidth={world === "forest" ? 1.7 : 2.1}
            opacity=".3"
          >
            {Array.from({ length: 70 }, (_, index) => (
              <path
                key={index}
                d={
                  "M" +
                  ((index * 137) % 2048) +
                  " " +
                  (((index * 73) % 1060) - 80) +
                  "l-8 " +
                  (18 + (index % 4) * 8)
                }
              />
            ))}
          </g>
          <g className="room-droplets" fill="#edf9ff" opacity=".25">
            {Array.from({ length: 16 }, (_, index) => (
              <ellipse
                key={index}
                cx={140 + index * 127}
                cy={210 + ((index * 59) % 610)}
                rx="1.7"
                ry="5"
              />
            ))}
          </g>
        </g>
      )}
      {world === "midnight" && (
        <g clipPath={"url(#" + clip + ")"}>
          {Array.from({ length: 21 }, (_, index) => (
            <circle
              className="room-star"
              key={index}
              cx={850 + ((index * 67) % 950)}
              cy={70 + ((index * 79) % 500)}
              r={index % 3 === 0 ? 2.5 : 1.5}
              fill="#f7f1dc"
              style={{
                animationDelay: -(index % 7) + "s",
                animationDuration: 4 + (index % 5) + "s",
              }}
            />
          ))}
        </g>
      )}
      {world === "lavender" && (
        <g clipPath={"url(#" + clip + ")"}>
          <g className="room-cloud-drift" fill="#e4dfff" opacity=".15">
            <ellipse cx="1240" cy="420" rx="240" ry="27" />
            <ellipse cx="1550" cy="493" rx="230" ry="25" />
          </g>
        </g>
      )}
      {(world === "academia" || world === "exam" || world === "forest") && (
        <g clipPath={"url(#" + clip + ")"}>
          <path
            className="room-daylight"
            d="M550 0H1550L1900 1000H800Z"
            fill={"url(#" + beam + ")"}
          />
          {Array.from({ length: 22 }, (_, index) => (
            <circle
              className="room-dust"
              key={index}
              cx={350 + ((index * 79) % 1500)}
              cy={130 + ((index * 47) % 550)}
              r="1.7"
              fill="#fff3c9"
              style={{ animationDelay: -(index % 9) + "s" }}
            />
          ))}
        </g>
      )}
      {world === "rainy-cafe" && (
        <g className="room-lamplight">
          <ellipse
            cx="928"
            cy="333"
            rx="280"
            ry="240"
            fill={"url(#" + glow + ")"}
          />
          <ellipse
            cx="1120"
            cy="1080"
            rx="50"
            ry="25"
            fill={"url(#" + glow + ")"}
          />
        </g>
      )}
      {world === "lavender" && (
        <ellipse
          className="room-lamplight"
          cx="1010"
          cy="755"
          rx="240"
          ry="220"
          fill={"url(#" + glow + ")"}
        />
      )}
      {world === "midnight" && (
        <ellipse
          className="room-lamplight"
          cx="970"
          cy="660"
          rx="180"
          ry="180"
          fill={"url(#" + glow + ")"}
        />
      )}
      {(world === "rainy-cafe" || world === "forest") && (
        <g
          transform={
            world === "forest" ? "translate(1080 639)" : "translate(1117 974)"
          }
          stroke="#fff4dd"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        >
          <g className="room-steam">
            <path d="M-8 0C-24-18 8-25-4-49" />
            <path d="M12 2C-2-12 29-28 13-43" />
          </g>
        </g>
      )}
    </svg>
  );
}
