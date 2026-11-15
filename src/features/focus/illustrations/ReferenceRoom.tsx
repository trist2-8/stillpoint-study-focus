import type { TimerState } from "../../../types";

/** Scalable artwork composed for the reference dashboard's left-hand study nook. */
export default function ReferenceRoom({
  status,
  mode,
  companion,
}: {
  status: TimerState["status"];
  mode: TimerState["mode"];
  companion: boolean;
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
    <svg
      className="reference-room-art"
      viewBox="0 0 450 650"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nook-window" x2=".8" y2="1">
          <stop stopColor="#e9bdff" />
          <stop offset=".6" stopColor="#ffe7df" />
          <stop offset="1" stopColor="#e6d3ff" />
        </linearGradient>
        <linearGradient id="nook-frame" x2="1" y2=".4">
          <stop stopColor="#be8ef5" />
          <stop offset=".5" stopColor="#e4c6ff" />
          <stop offset="1" stopColor="#a881d6" />
        </linearGradient>
        <linearGradient id="nook-book" x2=".2" y2="1">
          <stop stopColor="#c6a1f9" />
          <stop offset="1" stopColor="#9270cc" />
        </linearGradient>
        <linearGradient id="nook-fur" x2=".5" y2="1">
          <stop stopColor="#fff6ff" />
          <stop offset=".6" stopColor="#e7d5f5" />
          <stop offset="1" stopColor="#b596d5" />
        </linearGradient>
        <linearGradient id="nook-leaf" x2="1" y2="1">
          <stop stopColor="#d2d9a1" />
          <stop offset=".5" stopColor="#9cae86" />
          <stop offset="1" stopColor="#6d8575" />
        </linearGradient>
        <linearGradient id="nook-pot" x2="1" y2=".4">
          <stop stopColor="#e8d4ff" />
          <stop offset=".5" stopColor="#bb91ed" />
          <stop offset="1" stopColor="#9374c4" />
        </linearGradient>
        <filter id="nook-shadow" x="-30%" y="-30%" width="170%" height="180%">
          <feDropShadow
            dx="2"
            dy="9"
            stdDeviation="7"
            floodColor="#67439c"
            floodOpacity=".22"
          />
        </filter>
      </defs>
      <path
        d="M-80 465V148a164 164 0 0 1 328 0v317"
        fill="url(#nook-frame)"
        stroke="#f8e7ff"
        strokeWidth="3"
      />
      <path
        d="M-57 450V151a140 140 0 0 1 280 0v299Z"
        fill="url(#nook-window)"
        stroke="#a780d1"
        strokeWidth="5"
      />
      <path
        d="M-46 151a128 128 0 0 1 256 0M82 19V451M-55 185L221 235M-55 321L221 354"
        stroke="#c09cdb"
        strokeWidth="9"
      />
      <path d="M-55 181L219 230M86 22V447" stroke="#f4d9ff" strokeWidth="3" />
      <g stroke="#8b8d73" strokeWidth="3">
        <path d="M158 423Q202 318 172 251M161 398Q225 313 285 287M167 381Q130 300 103 289M197 345Q241 274 249 247" />
      </g>
      <g fill="url(#nook-leaf)">
        <path d="M173 296Q129 281 150 234Q179 251 173 296Z" />
        <path d="M180 327Q214 282 230 303Q222 329 180 327Z" />
        <path d="M211 307Q209 263 253 247Q254 286 211 307Z" />
        <path d="M239 295Q271 270 302 297Q271 312 239 295Z" />
        <path d="M159 363Q112 345 104 291Q151 313 159 363Z" />
        <path d="M185 367Q212 328 250 341Q227 372 185 367Z" />
        <path d="M152 391Q109 383 91 355Q137 345 152 391Z" />
      </g>
      <g fill="#b58ae9" opacity=".9">
        <path d="M38 469Q-6 401 28 347Q62 381 38 469Z" />
        <path d="M54 462Q52 372 103 344Q117 408 54 462Z" />
        <path d="M73 450Q102 389 148 404Q136 451 73 450Z" />
        <path d="M24 440Q-26 427-34 388Q12 384 24 440Z" />
      </g>
      <g filter="url(#nook-shadow)">
        <path d="M2 553L359 570 430 598 82 586-8 569Z" fill="#d8b2dd" />
        <path d="M-8 569L82 586 430 598V614L77 602-8 585Z" fill="#ac85bf" />
        <path
          d="M11 585L-3 650M371 611L378 650"
          stroke="#9472b5"
          strokeWidth="18"
        />
        <path d="M18 507L245 524 254 569 24 552Z" fill="url(#nook-book)" />
        <path d="M35 516L237 531 239 558 34 544Z" fill="#e5d4f6" />
        <path
          d="M39 524L228 538M39 531L229 545M39 538L230 552"
          stroke="#bba2d8"
        />
        <path
          d="M10 468L238 483 236 525 8 510Z"
          fill="url(#nook-book)"
          stroke="#a582d2"
          strokeWidth="2"
        />
        <path d="M24 477L220 490 218 514 25 501Z" fill="#dfcef2" />
        <path d="M31 483L210 496M31 490L210 503" stroke="#b29acb" />
        <path d="M3 468L235 483 247 477 14 461Z" fill="#c3a0ef" />
      </g>
      {companion && (
        <g className="study-cat" data-state={state} filter="url(#nook-shadow)">
          <g className="cat-body">
            <path
              d="M49 449C22 409 57 371 103 373C150 366 180 408 171 449Z"
              fill="url(#nook-fur)"
            />
            <path
              d="M87 388Q54 386 54 417Q48 444 98 451"
              stroke="#bba2d8"
              strokeWidth="25"
              strokeLinecap="round"
            />
            <path
              d="M120 411L117 383 145 394Q168 384 190 398L215 387 209 426Q215 468 173 472Q127 474 120 441Z"
              fill="url(#nook-fur)"
            />
            <path
              d="M123 390L127 412 141 400M207 395L191 407 204 418"
              fill="#e9b5d8"
            />
            <path
              d="M166 393Q159 423 184 433L203 418 193 401Z"
              fill="#c2a7df"
            />
            <g stroke="#6c4f89" strokeWidth="2" strokeLinecap="round">
              {state === "awake" ? (
                <path d="M140 433v5M186 434v5" />
              ) : (
                <path d="M134 435q6-7 12 0M183 435q6-7 12 0" />
              )}
              <path d="M161 444l5 3 5-3M166 447v5m0 0q-5 4-10 0m10 0q5 4 10 0M135 447l-21-4m21 10-22 2m78-8 22-4m-22 10 22 2" />
            </g>
            <ellipse cx="143" cy="464" rx="21" ry="7" fill="#f1e5fa" />
            <ellipse cx="184" cy="466" rx="20" ry="7" fill="#f1e5fa" />
          </g>
        </g>
      )}
      <g stroke="#8d79ad" strokeWidth="2">
        <path d="M332 549Q302 456 327 386M335 524Q354 449 387 438M322 486Q292 448 274 439" />
      </g>
      <g fill="url(#nook-pot)">
        <path d="M323 453Q284 421 326 365Q353 416 323 453Z" />
        <path d="M331 485Q348 432 388 433Q382 479 331 485Z" />
        <path d="M319 490Q277 490 269 439Q311 446 319 490Z" />
        <path d="M337 518Q371 479 400 499Q380 528 337 518Z" />
      </g>
      <path
        d="M307 539H369L360 593Q338 609 316 593Z"
        fill="url(#nook-pot)"
        filter="url(#nook-shadow)"
      />
      <ellipse cx="338" cy="539" rx="33" ry="8" fill="#e7cbf6" />
      <ellipse cx="338" cy="539" rx="25" ry="4" fill="#9c79a5" />
      <g fill="#cba1f6">
        <path d="M246 548Q215 516 247 501Q266 507 264 528Q282 502 294 526Q299 544 270 549Z" />
        <path d="M245 548H282L276 587Q259 598 248 585Z" fill="url(#nook-pot)" />
      </g>
      <g className="lavender-petals" fill="#d8a4f5">
        <path d="M383 240q-18 0-18 17 18 0 18-17Z" />
        <path d="M408 378q-20 0-20 18 20 0 20-18Z" />
      </g>
      <path
        d="M379 471q0 14-12 14 12 0 12 14 0-14 12-14-12 0-12-14Z"
        fill="#fff5ff"
      />
    </svg>
  );
}
