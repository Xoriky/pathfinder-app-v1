/**
 * src/components/PathfinderBot.jsx
 * ─────────────────────────────────────────────────────────────
 * Re-exports the PathfinderBot default export from pathfinder-bot.jsx
 * which contains the full animated SVG character.
 *
 * MIGRATION STEP:
 *  Copy pathfinder-bot.jsx → src/components/PathfinderBot.jsx
 *  and change the last line from:
 *    export default function PathfinderBotDemo() { ... }
 *  to:
 *    export default function PathfinderBot({ state }) { ... }
 *  keeping only the PathfinderBot SVG component, not the demo wrapper.
 *
 * The `state` prop accepts one of:
 *   "walking" | "idle" | "talking" | "thinking" | "celebrating" | "directing"
 *
 * In App.jsx it is driven by:
 *   const UI_TO_BOT = {
 *     inject_video: "thinking",
 *     show_diff:    "talking",
 *     start_course: "directing",
 *     none:         "walking",
 *   };
 *   setBotState(UI_TO_BOT[data.uiAction] ?? "idle");
 * ─────────────────────────────────────────────────────────────
 */

// Temporary stub so App.jsx compiles before you complete the migration.
// Replace this entire file with the extracted PathfinderBot component.

import { useState, useEffect, useRef } from "react";

const getCls = (state) => {
  const base = { cnt:"cnt-g", bd:"body-g", hd:"head-g", al:"arm-l", ar:"arm-r", ll:"leg-l", lr:"leg-r", ey:"eye-g" };
  const map = {
    walking:     { ...base, bd:"body-g wk-bd", al:"arm-l wk-al", ar:"arm-r wk-ar", ll:"leg-l wk-ll", lr:"leg-r wk-lr", sh:"wk-sh" },
    idle:        { ...base, bd:"body-g id-bd", ey:"eye-g id-ey" },
    talking:     { ...base, bd:"body-g tk-bd", ey:"eye-g tk-ey" },
    thinking:    { ...base, hd:"head-g th-hd", al:"arm-l th-al" },
    celebrating: { ...base, cnt:"cnt-g cl-cn", al:"arm-l cl-al", ar:"arm-r cl-ar" },
    directing:   { ...base, bd:"body-g dr-bd", ar:"arm-r dr-ar" },
  };
  return map[state] || base;
};

const A = "#f59e0b";

export default function PathfinderBot({ state = "idle" }) {
  const c = getCls(state);
  const isTalking  = state === "talking" || state === "celebrating";
  const isThinking = state === "thinking";

  return (
    <svg width="72" height="96" viewBox="0 0 60 92"
      style={{ overflow: "visible", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.7))" }}>
      <ellipse className={c.sh || ""} cx="30" cy="91" rx="17" ry="4" fill="rgba(0,0,0,.5)"
        style={{ transformBox:"fill-box", transformOrigin:"50% 50%" }}/>
      <g className={c.cnt}>
        <g className={c.bd}>
          <g className={c.ll}>
            <rect x="14" y="61" width="13" height="21" rx="5.5"
              fill="#141428" stroke="rgba(245,158,11,.28)" strokeWidth="1.2"/>
            <ellipse cx="20" cy="84" rx="9" ry="4" fill="#0e0e20"/>
          </g>
          <g className={c.lr}>
            <rect x="33" y="61" width="13" height="21" rx="5.5"
              fill="#141428" stroke="rgba(245,158,11,.28)" strokeWidth="1.2"/>
            <ellipse cx="39" cy="84" rx="9" ry="4" fill="#0e0e20"/>
          </g>
          <g className={c.al}>
            <rect x="3" y="41" width="12" height="21" rx="5.5"
              fill="#13132a" stroke="rgba(245,158,11,.22)" strokeWidth="1.2"/>
            <ellipse cx="9" cy="63" rx="5" ry="3" fill="#0f0f24"/>
          </g>
          <rect x="12" y="38" width="36" height="26" rx="9"
            fill="url(#bGrad2)" stroke="rgba(245,158,11,.38)" strokeWidth="1.5"/>
          <circle cx="30" cy="51" r="2.5" fill={A}
            style={{ animation: "chestPulse 2s ease-in-out infinite" }}/>
          <g className={c.ar}>
            <rect x="45" y="41" width="12" height="21" rx="5.5"
              fill="#13132a" stroke="rgba(245,158,11,.22)" strokeWidth="1.2"/>
            <ellipse cx="51" cy="63" rx="5" ry="3" fill="#0f0f24"/>
          </g>
          <g className={c.hd}>
            <rect x="28.5" y="5" width="3" height="11" rx="1.5" fill="rgba(245,158,11,.5)"/>
            <circle cx="30" cy="4" r="4" fill={A}
              style={{ animation: "antGlow 1.5s ease-in-out infinite alternate",
                filter: "drop-shadow(0 0 4px #f59e0b)" }}/>
            <rect x="8" y="10" width="44" height="30" rx="12"
              fill="url(#hGrad2)" stroke="rgba(245,158,11,.42)" strokeWidth="1.5"/>
            <g className={c.ey}>
              <circle cx="21" cy="24" r="5.5" fill={A} opacity=".92"
                style={{ filter: "drop-shadow(0 0 5px #f59e0b)" }}/>
              <circle cx="21" cy="24" r="2.8" fill="rgba(0,0,0,.75)"/>
              <circle cx="39" cy="24" r="5.5" fill={A} opacity=".92"
                style={{ filter: "drop-shadow(0 0 5px #f59e0b)" }}/>
              <circle cx="39" cy="24" r="2.8" fill="rgba(0,0,0,.75)"/>
            </g>
            {isTalking
              ? <path d="M21 33 Q30 39 39 33" fill="none" stroke="rgba(245,158,11,.65)" strokeWidth="1.8" strokeLinecap="round"/>
              : <path d="M22 33 Q30 37 38 33" fill="none" stroke="rgba(245,158,11,.35)" strokeWidth="1.5" strokeLinecap="round"/>}
            {isThinking && <>
              <circle cx="46" cy="13" r="2.2" fill={A} style={{ animation: "tDot 1.1s ease-in-out 0s infinite" }}/>
              <circle cx="52" cy="8"  r="2.8" fill={A} opacity=".8" style={{ animation: "tDot 1.1s ease-in-out .18s infinite" }}/>
              <circle cx="57" cy="3"  r="3.4" fill={A} opacity=".6" style={{ animation: "tDot 1.1s ease-in-out .36s infinite" }}/>
            </>}
          </g>
        </g>
      </g>
      <defs>
        <linearGradient id="hGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1f1f3a"/>
          <stop offset="100%" stopColor="#0d0d20"/>
        </linearGradient>
        <linearGradient id="bGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1b1b32"/>
          <stop offset="100%" stopColor="#0c0c1e"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
