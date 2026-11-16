import { useId, useSyncExternalStore, type CSSProperties } from "react";
import type { StudyWorldId, UserSettings } from "../../types";
import { worldTokens } from "../focus/worlds";
const subscribe = (listener: () => void) => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
export function useColorMode(theme: UserSettings["theme"]) {
  const dark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => true,
  );
  return theme === "system" ? (dark ? "dark" : "light") : theme;
}
export default function WorldScene({
  world,
  mode = "dark",
}: {
  world: StudyWorldId;
  mode?: "light" | "dark";
}) {
  const identity = useId().replaceAll(":", "");
  const night = world === "midnight";
  const library = world === "academia";
  const forest = world === "forest";
  const cafe = world === "rainy-cafe";
  const exam = world === "exam";
  return (
    <svg
      className="world-art"
      data-scene-world={world}
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={worldTokens(world, mode) as CSSProperties}
    >
      <defs>
        <linearGradient id={identity + "sky"} x2="0" y2="1">
          <stop stopColor="var(--scene-sky)" />
          <stop offset="1" stopColor="var(--scene-leaf)" />
        </linearGradient>
        <linearGradient id={identity + "wall"} x2="1" y2="1">
          <stop stopColor="var(--surface-secondary)" />
          <stop offset="1" stopColor="var(--background)" />
        </linearGradient>
        <radialGradient id={identity + "light"}>
          <stop stopColor="var(--scene-light)" stopOpacity=".42" />
          <stop offset="1" stopColor="var(--scene-light)" stopOpacity="0" />
        </radialGradient>
        <clipPath id={identity + "window"}>
          <path
            d={
              night
                ? "M165 520V250a265 265 0 0 1 530 0v270Z"
                : exam
                  ? "M140 140H720V520H140Z"
                  : "M170 520V226a245 170 0 0 1 490 0v294Z"
            }
          />
        </clipPath>
      </defs>
      <rect width="1200" height="720" fill={"url(#" + identity + "wall)"} />
      <path d="M0 625L1200 580V720H0Z" fill="var(--scene-wood)" />
      <path d="M0 102H1200M0 606H1200" stroke="var(--border)" strokeWidth="2" />
      {exam ? (
        <g>
          <rect
            x="122"
            y="118"
            width="616"
            height="400"
            rx="5"
            fill="var(--surface)"
            stroke="var(--border)"
            strokeWidth="8"
          />
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              d={"M150 " + (150 + index * 28) + "H710"}
              stroke="var(--border)"
              strokeWidth="1"
            />
          ))}
          <path
            d="M185 155V482"
            stroke="var(--primary)"
            strokeWidth="2"
            opacity=".5"
          />
          <path
            d="M235 370L310 310 370 336 440 214 512 260 610 170"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="5"
          />
          <g fill="var(--primary)">
            <circle cx="310" cy="310" r="7" />
            <circle cx="440" cy="214" r="7" />
            <circle cx="610" cy="170" r="7" />
          </g>
        </g>
      ) : (
        <>
          <path
            d={
              night
                ? "M155 525V250a275 275 0 0 1 550 0v275Z"
                : "M155 535V226a260 184 0 0 1 520 0v309Z"
            }
            fill="var(--scene-wood)"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <g clipPath={"url(#" + identity + "window)"}>
            <rect
              x="140"
              y="0"
              width="580"
              height="550"
              fill={"url(#" + identity + "sky)"}
            />
            {night ? (
              <g>
                <rect
                  x="145"
                  y="0"
                  width="575"
                  height="550"
                  fill="var(--scene-sky)"
                />
                <circle
                  className="scene-moon"
                  cx="425"
                  cy="186"
                  r="54"
                  fill="var(--scene-light)"
                />
                <circle cx="447" cy="168" r="51" fill="var(--scene-sky)" />
                {Array.from({ length: 27 }, (_, index) => (
                  <circle
                    key={index}
                    cx={175 + ((index * 83) % 520)}
                    cy={45 + ((index * 57) % 425)}
                    r={index % 4 === 0 ? 2.3 : 1.3}
                    fill="var(--text-primary)"
                    opacity={0.35 + (index % 4) * 0.15}
                  />
                ))}
                <path
                  d="M206 290L294 248 350 302 462 278 530 345 620 307M294 248L325 190"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1"
                  opacity=".35"
                />
                <path
                  d="M120 504L290 452 420 487 570 428 740 501V560H120Z"
                  fill="var(--background)"
                />
              </g>
            ) : forest ? (
              <g>
                <ellipse
                  cx="420"
                  cy="135"
                  rx="240"
                  ry="160"
                  fill={"url(#" + identity + "light)"}
                />
                {Array.from({ length: 9 }, (_, index) => (
                  <g
                    key={index}
                    transform={
                      "translate(" +
                      (140 + index * 70) +
                      " " +
                      (index % 2) * 42 +
                      ")"
                    }
                    opacity={index % 2 ? 0.6 : 0.9}
                  >
                    <path
                      d="M0 540V80"
                      stroke="var(--scene-wood)"
                      strokeWidth={9 + (index % 3) * 3}
                    />
                    <path
                      className="scene-leaves"
                      d="M0 80L-55 210H-32L-75 305H-41L-92 400H92L41 305H75L32 210H55Z"
                      fill="var(--scene-leaf)"
                    />
                    <path
                      d="M0 218L-22 261M0 320L34 350"
                      stroke="var(--scene-wood)"
                      strokeWidth="3"
                    />
                  </g>
                ))}
                <path
                  d="M130 500Q340 440 520 484T740 462V560H130Z"
                  fill="var(--scene-leaf)"
                />
              </g>
            ) : cafe ? (
              <g>
                <rect
                  x="140"
                  y="0"
                  width="580"
                  height="550"
                  fill="var(--scene-sky)"
                />
                {[170, 310, 440, 565].map((position, index) => (
                  <g key={position}>
                    <rect
                      x={position}
                      y={230 + (index % 2) * 50}
                      width="100"
                      height="310"
                      fill="var(--surface-secondary)"
                    />
                    {[0, 1, 2, 3].map((row) => (
                      <rect
                        key={row}
                        x={position + 20}
                        y={260 + (index % 2) * 50 + row * 56}
                        width="22"
                        height="26"
                        fill="var(--scene-light)"
                        opacity=".6"
                      />
                    ))}
                  </g>
                ))}
                <g
                  className="scene-rain"
                  stroke="var(--text-primary)"
                  opacity=".26"
                  strokeWidth="2"
                >
                  {Array.from({ length: 30 }, (_, index) => (
                    <path
                      key={index}
                      d={
                        "M" +
                        (165 + ((index * 57) % 500)) +
                        " " +
                        (80 + ((index * 79) % 450)) +
                        "l-5 24"
                      }
                    />
                  ))}
                </g>
              </g>
            ) : (
              <g>
                <circle
                  cx="470"
                  cy="170"
                  r="62"
                  fill="var(--scene-light)"
                  opacity=".8"
                />
                <g className="scene-clouds" fill="var(--surface)" opacity=".5">
                  <path d="M120 230Q155 190 190 212Q210 165 250 199Q300 180 320 225Z" />
                  <path d="M430 300Q475 255 515 278Q555 238 590 285Q630 270 669 305Z" />
                </g>
                <path
                  d="M130 440Q245 350 370 431T720 402V550H130Z"
                  fill="var(--scene-leaf)"
                  opacity=".6"
                />
                <path
                  d="M130 489Q385 405 720 483V555H130Z"
                  fill="var(--scene-leaf)"
                />
                {library && (
                  <g fill="var(--surface-secondary)">
                    <path d="M235 425V319L290 280 346 319V425Z" />
                    <path d="M470 440V324L520 294 570 324V440Z" />
                    <path
                      d="M290 322V400M520 340V415"
                      stroke="var(--scene-light)"
                      strokeWidth="16"
                    />
                  </g>
                )}
              </g>
            )}
          </g>
          {!night && (
            <path
              d="M415 58V520M170 300H660"
              stroke="var(--scene-wood)"
              strokeWidth="14"
            />
          )}
          <path d="M148 534H692" stroke="var(--scene-wood)" strokeWidth="22" />
        </>
      )}
      {library && (
        <g>
          {[16, 745, 1015].map((position, index) => (
            <g key={position}>
              <rect
                x={position}
                y="120"
                width={index === 2 ? 165 : 145}
                height="430"
                fill="var(--background)"
                stroke="var(--scene-wood)"
                strokeWidth="12"
              />
              {[0, 1, 2, 3].map((row) => (
                <g key={row}>
                  <path
                    d={
                      "M" +
                      position +
                      " " +
                      (225 + row * 105) +
                      "h" +
                      (index === 2 ? 165 : 145)
                    }
                    stroke="var(--scene-wood)"
                    strokeWidth="9"
                  />
                  {Array.from({ length: 6 }, (_, column) => (
                    <rect
                      key={column}
                      x={position + 8 + column * 21}
                      y={153 + row * 105 + (column % 3) * 8}
                      width={13 + (column % 2) * 3}
                      height={65 - (column % 3) * 8}
                      rx="2"
                      fill={
                        column % 2 ? "var(--scene-leaf)" : "var(--scene-light)"
                      }
                      opacity={0.38 + (column % 3) * 0.15}
                    />
                  ))}
                </g>
              ))}
            </g>
          ))}
        </g>
      )}
      {!library && !exam && (
        <g stroke="var(--border)" fill="none" strokeWidth="2">
          <path d="M778 122H1100V470H778Z" />
          <path d="M795 141H1083V451H795Z" />
        </g>
      )}
      <ellipse
        className="scene-lamp-glow"
        cx="290"
        cy="510"
        rx="220"
        ry="220"
        fill={"url(#" + identity + "light)"}
      />
      <path d="M80 568H850L1020 640H0Z" fill="var(--scene-wood)" />
      <path d="M0 640H1020V661H0Z" fill="var(--background)" opacity=".55" />
      <path
        d="M75 660L40 720M880 660L915 720"
        stroke="var(--scene-wood)"
        strokeWidth="26"
      />
      <g stroke="var(--text-secondary)" strokeWidth="8" fill="none">
        <path d="M138 567L190 394 284 327" />
        <path d="M102 573H184" strokeWidth="14" />
      </g>
      <path
        d="M237 312Q291 268 328 326L315 344 249 335Z"
        fill="var(--scene-light)"
      />
      <path
        d="M250 335L225 557 430 565 315 344"
        fill="var(--scene-light)"
        opacity=".08"
      />
      <g transform="translate(325 555)">
        <path d="M0 0L132-16 174 32 28 47Z" fill="var(--surface)" />
        <path
          d="M132-16L236-7 286 46 174 32Z"
          fill="var(--surface-secondary)"
        />
        <path d="M132-16L174 32" stroke="var(--border)" strokeWidth="2" />
        {[0, 1, 2, 3].map((index) => (
          <path
            key={index}
            d={"M" + (30 + index * 8) + " " + (6 + index * 8) + "l83-10"}
            stroke="var(--border)"
            strokeWidth="2"
          />
        ))}
        <path d="M220 0l26 30" stroke="var(--primary)" strokeWidth="4" />
      </g>
      {night ? (
        <g transform="translate(630 455) rotate(-20)">
          <rect
            width="132"
            height="40"
            rx="9"
            fill="var(--surface-secondary)"
            stroke="var(--primary)"
            strokeWidth="3"
          />
          <path
            d="M-10 8H0M132 5v30M60 42L30 150M60 42L112 145"
            stroke="var(--primary)"
            strokeWidth="7"
          />
        </g>
      ) : (
        <g transform="translate(650 520)">
          <path d="M0 0H53L49 55Q26 68 4 55Z" fill="var(--surface)" />
          <path
            d="M53 10Q88 5 75 38Q67 48 51 40"
            fill="none"
            stroke="var(--surface)"
            strokeWidth="8"
          />
          <ellipse cx="27" cy="0" rx="26" ry="6" fill="var(--background)" />
          <path
            className="scene-steam"
            d="M12-12q-10-15 2-30M32-10q-9-14 2-30"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            opacity=".5"
          />
        </g>
      )}
      {!exam && (
        <g transform="translate(85 560)">
          <path d="M-24 0H24L17 48H-16Z" fill="var(--primary)" opacity=".8" />
          <path
            d="M0 0V-100M0-23L-24-50M0-45L27-72"
            stroke="var(--scene-leaf)"
            strokeWidth="4"
          />
          <g className="scene-leaves" fill="var(--scene-leaf)">
            <path d="M0-89Q-37-106-30-140Q4-129 0-89Z" />
            <path d="M0-52Q29-104 48-85Q39-52 0-52Z" />
            <path d="M-13-36Q-49-32-51-69Q-19-68-13-36Z" />
          </g>
        </g>
      )}
      {cafe && (
        <g>
          <path
            d="M83 0V163M736 0V130"
            stroke="var(--text-secondary)"
            strokeWidth="3"
          />
          <path
            d="M48 183Q80 122 118 183ZM701 150Q737 100 774 150Z"
            fill="var(--scene-light)"
          />
        </g>
      )}
    </svg>
  );
}
