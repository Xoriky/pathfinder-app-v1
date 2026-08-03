import { useState, useEffect, useRef } from "react";

// ─── Design tokens (Pathfinder palette) ─────────────────────
const A = "#f59e0b";   // amber
const AD = "#d97706";  // amber deep
const AM = "rgba(20,8,0,.88)"; // amber dark (text on amber bg)

// ─── Animation CSS ───────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{display:none;}
body{background:#07070e;}

/* transform-box so transform-origin is relative to each element */
.leg-l,.leg-r,.arm-l,.arm-r{transform-box:fill-box;}
.leg-l,.leg-r{transform-origin:50% 2%;}
.arm-l,.arm-r{transform-origin:50% 2%;}
.head-g{transform-box:fill-box;transform-origin:50% 90%;}
.body-g{transform-box:fill-box;transform-origin:50% 100%;}
.eye-g{transform-box:fill-box;transform-origin:50% 50%;}
.cnt-g{transform-box:fill-box;transform-origin:50% 100%;}

/* ── Walking ── */
.wk-ll{animation:walkLL .52s ease-in-out infinite alternate;}
.wk-lr{animation:walkLR .52s ease-in-out infinite alternate;}
.wk-al{animation:walkAL .52s ease-in-out infinite alternate;}
.wk-ar{animation:walkAR .52s ease-in-out infinite alternate;}
.wk-bd{animation:bodyBob .26s ease-in-out infinite alternate;}
.wk-sh{animation:shadowBob .26s ease-in-out infinite alternate;}

/* ── Idle ── */
.id-bd{animation:breathe 2.4s ease-in-out infinite alternate;}
.id-ey{animation:blink 4s ease-in-out infinite;}

/* ── Talking ── */
.tk-bd{animation:talkSway 1.8s ease-in-out infinite alternate;}
.tk-ey{animation:blink 4s ease-in-out infinite;}

/* ── Thinking ── */
.th-hd{animation:thinkTilt 3s ease-in-out infinite;}
.th-al{animation:thinkArm 3s ease-in-out infinite;}

/* ── Celebrating ── */
.cl-cn{animation:celebJump .46s ease-in-out infinite;}
.cl-al{animation:celebArmL .46s ease-in-out infinite alternate;}
.cl-ar{animation:celebArmR .46s ease-in-out infinite alternate;}

/* ── Directing ── */
.dr-ar{animation:directArm 1.8s ease-in-out infinite;}
.dr-bd{animation:breathe 2s ease-in-out infinite alternate;}

/* ── Keyframes ── */
@keyframes walkLL{from{transform:rotate(-22deg)}to{transform:rotate(22deg)}}
@keyframes walkLR{from{transform:rotate(22deg)}to{transform:rotate(-22deg)}}
@keyframes walkAL{from{transform:rotate(20deg)}to{transform:rotate(-20deg)}}
@keyframes walkAR{from{transform:rotate(-20deg)}to{transform:rotate(20deg)}}
@keyframes bodyBob{from{transform:translateY(0)}to{transform:translateY(-5px)}}
@keyframes shadowBob{from{transform:scale(1)}to{transform:scale(.82)}}
@keyframes breathe{from{transform:scaleY(1)}to{transform:scaleY(1.05)}}
@keyframes blink{0%,86%,100%{transform:scaleY(1)}93%{transform:scaleY(.04)}}
@keyframes talkSway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
@keyframes thinkTilt{0%,55%,100%{transform:rotate(0deg)}28%{transform:rotate(11deg)}}
@keyframes thinkArm{0%,55%,100%{transform:rotate(0deg)}28%{transform:rotate(-78deg)}}
@keyframes celebJump{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
@keyframes celebArmL{from{transform:rotate(-138deg)}to{transform:rotate(-122deg)}}
@keyframes celebArmR{from{transform:rotate(122deg)}to{transform:rotate(138deg)}}
@keyframes directArm{0%,55%,100%{transform:rotate(-58deg)}28%{transform:rotate(-46deg)}}
@keyframes antGlow{from{opacity:1;filter:drop-shadow(0 0 3px #f59e0b)}to{opacity:.3;filter:drop-shadow(0 0 8px #f59e0b)}}
@keyframes chestPulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes tDot{0%,100%{opacity:.18}50%{opacity:1}}
@keyframes bubbleIn{from{opacity:0;transform:scale(.84) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(65px) rotate(420deg);opacity:0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes glowAura{0%,100%{opacity:.25}50%{opacity:.5}}
@keyframes scanGrid{from{opacity:.04}to{opacity:.09}}
`;

// ─── Per-state animation class resolvers ─────────────────────
function getCls(state) {
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
}

// ─── Speech bubble content ───────────────────────────────────
const MSGS = {
  walking:     ["Scanning the venture landscape…","Strategic reconnaissance active.","Analyzing your trajectory."],
  idle:        ["Awaiting your directive, Operator.","Ready for deployment.","Standing by."],
  talking:     ["This insight is category-defining.","90% of founders miss this nuance entirely.","Execute this immediately."],
  thinking:    ["Cross-referencing 47 failure patterns…","Calculating optimal entry vector…","Market dynamics analyzed."],
  celebrating: ["Outstanding execution! Elite tier.","This is what category creation looks like.","Performance: exceptional."],
  directing:   ["Move. The window is closing.","Priority action required. Now.","Direction locked. Execute."],
};

// ─── State config ─────────────────────────────────────────────
const STATES = [
  { id:"walking",     label:"Walking",     icon:"🚶", col:A },
  { id:"idle",        label:"Idle",        icon:"😐", col:"rgba(255,255,255,.4)" },
  { id:"talking",     label:"Talking",     icon:"💬", col:"#a78bfa" },
  { id:"thinking",    label:"Thinking",    icon:"🤔", col:"#60a5fa" },
  { id:"celebrating", label:"Celebrating", icon:"🎉", col:"#4ade80" },
  { id:"directing",   label:"Directing",   icon:"⚡", col:A },
];

// ─── SVG Character ────────────────────────────────────────────
function PathfinderBot({ state }) {
  const c = getCls(state);
  const isTalking     = state === "talking"     || state === "celebrating";
  const isThinking    = state === "thinking";
  const isDirecting   = state === "directing";

  return (
    <svg width="72" height="96" viewBox="0 0 60 92"
      style={{ overflow:"visible", filter:"drop-shadow(0 8px 16px rgba(0,0,0,.7))" }}>

      {/* Ground shadow */}
      <ellipse className={c.sh||""} cx="30" cy="91" rx="17" ry="4"
        fill="rgba(0,0,0,.5)"
        style={{ transformBox:"fill-box", transformOrigin:"50% 50%" }}/>

      <g className={c.cnt}>
        <g className={c.bd}>

          {/* ── Legs ──────────────────────────────────────── */}
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

          {/* ── Arms (left: behind body via z-order, right: front) */}
          <g className={c.al}>
            <rect x="3" y="41" width="12" height="21" rx="5.5"
              fill="#13132a" stroke="rgba(245,158,11,.22)" strokeWidth="1.2"/>
            {/* Finger bump */}
            <ellipse cx="9" cy="63" rx="5" ry="3" fill="#0f0f24"/>
          </g>

          {/* ── Body ──────────────────────────────────────── */}
          <rect x="12" y="38" width="36" height="26" rx="9"
            fill="url(#bGrad)" stroke="rgba(245,158,11,.38)" strokeWidth="1.5"/>
          {/* Circuit traces */}
          <line x1="20" y1="44" x2="20" y2="58" stroke="rgba(245,158,11,.18)" strokeWidth="1" strokeDasharray="2,3"/>
          <line x1="40" y1="44" x2="40" y2="58" stroke="rgba(245,158,11,.18)" strokeWidth="1" strokeDasharray="2,3"/>
          <line x1="20" y1="51" x2="40" y2="51" stroke="rgba(245,158,11,.12)" strokeWidth="1"/>
          {/* Core light */}
          <circle cx="30" cy="51" r="5" fill="rgba(245,158,11,.09)"
            stroke="rgba(245,158,11,.35)" strokeWidth="1"/>
          <circle cx="30" cy="51" r="2.5" fill={A}
            style={{ animation:"chestPulse 2s ease-in-out infinite" }}/>

          {/* Right arm (in front of body) */}
          <g className={c.ar}>
            <rect x="45" y="41" width="12" height="21" rx="5.5"
              fill="#13132a" stroke="rgba(245,158,11,.22)" strokeWidth="1.2"/>
            <ellipse cx="51" cy="63" rx="5" ry="3" fill="#0f0f24"/>
          </g>

          {/* ── Head ──────────────────────────────────────── */}
          <g className={c.hd}>
            {/* Antenna */}
            <rect x="28.5" y="5" width="3" height="11" rx="1.5"
              fill="rgba(245,158,11,.5)"/>
            <circle cx="30" cy="4" r="4"
              fill={A}
              style={{ animation:"antGlow 1.5s ease-in-out infinite alternate",
                filter:"drop-shadow(0 0 4px #f59e0b)" }}/>

            {/* Head shell */}
            <rect x="8" y="10" width="44" height="30" rx="12"
              fill="url(#hGrad)" stroke="rgba(245,158,11,.42)" strokeWidth="1.5"/>

            {/* Ear details */}
            <rect x="5"  y="17" width="6" height="10" rx="3" fill="#10102a" stroke="rgba(245,158,11,.2)" strokeWidth="1"/>
            <rect x="49" y="17" width="6" height="10" rx="3" fill="#10102a" stroke="rgba(245,158,11,.2)" strokeWidth="1"/>

            {/* Eyes */}
            <g className={c.ey}>
              {/* Left eye */}
              <circle cx="21" cy="24" r="7" fill="#07071a"/>
              <circle cx="21" cy="24" r="5.5" fill={A} opacity=".92"
                style={{ filter:"drop-shadow(0 0 5px #f59e0b)" }}/>
              <circle cx="21" cy="24" r="2.8" fill="rgba(0,0,0,.75)"/>
              <circle cx="22.6" cy="22.6" r="1.2" fill="white" opacity=".85"/>
              {/* Right eye */}
              <circle cx="39" cy="24" r="7" fill="#07071a"/>
              <circle cx="39" cy="24" r="5.5" fill={A} opacity=".92"
                style={{ filter:"drop-shadow(0 0 5px #f59e0b)" }}/>
              <circle cx="39" cy="24" r="2.8" fill="rgba(0,0,0,.75)"/>
              <circle cx="40.6" cy="22.6" r="1.2" fill="white" opacity=".85"/>
            </g>

            {/* Mouth */}
            {isTalking ? (
              <path d="M21 33 Q30 39 39 33" fill="none"
                stroke="rgba(245,158,11,.65)" strokeWidth="1.8" strokeLinecap="round"
                style={{ animation:"talkSway 0.28s ease-in-out infinite alternate",
                  transformBox:"fill-box", transformOrigin:"50% 50%" }}/>
            ) : isThinking ? (
              <path d="M23 34 Q30 31 37 34" fill="none"
                stroke="rgba(245,158,11,.4)" strokeWidth="1.5" strokeLinecap="round"/>
            ) : isDirecting ? (
              <path d="M22 33 Q30 37 38 33" fill="none"
                stroke="rgba(245,158,11,.55)" strokeWidth="1.8" strokeLinecap="round"/>
            ) : (
              <path d="M22 33 Q30 37 38 33" fill="none"
                stroke="rgba(245,158,11,.35)" strokeWidth="1.5" strokeLinecap="round"/>
            )}

            {/* Thinking bubble dots */}
            {isThinking && (
              <>
                <circle cx="46" cy="13" r="2.2" fill={A}
                  style={{ animation:"tDot 1.1s ease-in-out 0s    infinite" }}/>
                <circle cx="52" cy="8"  r="2.8" fill={A} opacity=".8"
                  style={{ animation:"tDot 1.1s ease-in-out 0.18s infinite" }}/>
                <circle cx="57" cy="3"  r="3.4" fill={A} opacity=".6"
                  style={{ animation:"tDot 1.1s ease-in-out 0.36s infinite" }}/>
              </>
            )}

            {/* Directing — pointing highlight on right arm */}
            {isDirecting && (
              <circle cx="42" cy="14" r="3" fill={A} opacity=".4"
                style={{ animation:"chestPulse 0.8s ease-in-out infinite" }}/>
            )}
          </g>
        </g>
      </g>

      <defs>
        <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1f1f3a"/>
          <stop offset="100%" stopColor="#0d0d20"/>
        </linearGradient>
        <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1b1b32"/>
          <stop offset="100%" stopColor="#0c0c1e"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Speech bubble ────────────────────────────────────────────
function SpeechBubble({ text, flipped }) {
  return (
    <div style={{
      position:"absolute",
      bottom:"calc(100% + 10px)",
      left:"50%",
      /* flip back so text is always readable */
      transform:`translateX(-50%) scaleX(${flipped ? -1 : 1})`,
      background:"#0e0e1f",
      border:"1px solid rgba(245,158,11,.32)",
      borderRadius:14,
      padding:"9px 14px",
      fontSize:12.5,
      fontWeight:500,
      color:"rgba(255,255,255,.88)",
      whiteSpace:"nowrap",
      maxWidth:210,
      textAlign:"center",
      lineHeight:1.5,
      boxShadow:"0 6px 24px rgba(0,0,0,.55),0 0 0 1px rgba(245,158,11,.08)",
      animation:"bubbleIn .28s cubic-bezier(.22,1,.36,1)",
      zIndex:20,
      pointerEvents:"none",
    }}>
      {text}
      {/* Tail */}
      <div style={{
        position:"absolute",
        bottom:-7,
        left:"50%",
        transform:"translateX(-50%) rotate(45deg)",
        width:12,
        height:12,
        background:"#0e0e1f",
        borderRight:"1px solid rgba(245,158,11,.32)",
        borderBottom:"1px solid rgba(245,158,11,.32)",
      }}/>
    </div>
  );
}

// ─── Confetti particle ────────────────────────────────────────
const CONF_COLORS = [A,"#a78bfa","#4ade80","#fb7185","#60a5fa","white"];

function Confetti({ particles }) {
  return particles.map(p => (
    <div key={p.id} style={{
      position:"absolute",
      left:`${p.x}%`,
      top:16,
      width:p.size,
      height:p.size,
      borderRadius:p.id % 3 === 0 ? "50%" : p.id % 3 === 1 ? 2 : 1,
      background:p.color,
      animation:`confetti ${p.dur}s ease-in ${p.delay}s infinite`,
      pointerEvents:"none",
    }}/>
  ));
}

// ─── Main demo component ──────────────────────────────────────
export default function PathfinderBotDemo() {
  const [state,   setState]   = useState("walking");
  const [posX,    setPosX]    = useState(12);
  const [flipped, setFlipped] = useState(false);
  const [bubble,  setBubble]  = useState(null);
  const [showBub, setShowBub] = useState(false);
  const [confetti,setConfetti]= useState([]);
  const [clicks,  setClicks]  = useState(0);

  const dirRef    = useRef(1);
  const bubTimRef = useRef(null);

  // ── Walk loop ──────────────────────────────────────────────
  useEffect(() => {
    if (state !== "walking") { setPosX(45); return; }
    const iv = setInterval(() => {
      setPosX(prev => {
        const next = prev + 0.22 * dirRef.current;
        if (next >= 88) { dirRef.current = -1; setFlipped(true);  }
        if (next <=  6) { dirRef.current =  1; setFlipped(false); }
        return Math.max(4, Math.min(90, next));
      });
    }, 16);
    return () => clearInterval(iv);
  }, [state]);

  // ── Face direction when idle ────────────────────────────────
  useEffect(() => {
    if (state !== "walking") {
      setFlipped(false);
      dirRef.current = 1;
    }
  }, [state]);

  // ── Speech bubble cycle ─────────────────────────────────────
  useEffect(() => {
    clearTimeout(bubTimRef.current);
    setShowBub(false);
    let idx = 0;
    const msgs = MSGS[state];

    const show = () => {
      setBubble(msgs[idx % msgs.length]);
      setShowBub(true);
      idx++;
      bubTimRef.current = setTimeout(() => {
        setShowBub(false);
        bubTimRef.current = setTimeout(show, 1100);
      }, 3200);
    };
    bubTimRef.current = setTimeout(show, 700);
    return () => clearTimeout(bubTimRef.current);
  }, [state]);

  // ── Confetti ────────────────────────────────────────────────
  useEffect(() => {
    if (state !== "celebrating") { setConfetti([]); return; }
    setConfetti(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x:     Math.random() * 96,
      delay: Math.random() * 1.4,
      dur:   0.9 + Math.random() * 0.7,
      size:  4 + Math.random() * 7,
      color: CONF_COLORS[i % CONF_COLORS.length],
    })));
  }, [state]);

  // ── Click interaction ───────────────────────────────────────
  const handleBotClick = () => {
    setClicks(n => n + 1);
    if (state === "walking") {
      dirRef.current *= -1;
      setFlipped(f => !f);
    }
  };

  return (
    <div style={{
      background:"#07070e",
      minHeight:"100vh",
      fontFamily:"'DM Sans',sans-serif",
      padding:"28px 20px 36px",
      display:"flex",
      flexDirection:"column",
      gap:20,
      maxWidth:480,
      margin:"0 auto",
    }}>
      <style>{STYLES}</style>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ textAlign:"center", animation:"fadeUp .5s ease" }}>
        <div style={{ fontSize:9.5, letterSpacing:"3.5px", textTransform:"uppercase",
          color:"rgba(245,158,11,.55)", fontWeight:700, marginBottom:7 }}>
          Pathfinder AI Director
        </div>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26,
          color:"white", fontWeight:400, letterSpacing:"-.3px", marginBottom:6 }}>
          The Bot That Directs
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,.38)", lineHeight:1.65 }}>
          6 animation states. Fully SVG + CSS.<br/>
          Driven by the <span style={{ color:"rgba(245,158,11,.65)", fontWeight:600 }}>chat-director</span> JSON response.
        </p>
      </div>

      {/* ── Stage ─────────────────────────────────────────── */}
      <div style={{
        position:"relative", height:210, borderRadius:26,
        background:"linear-gradient(180deg,#0a0a1a 0%,#07070e 100%)",
        border:"1px solid rgba(255,255,255,.07)",
        overflow:"hidden",
        boxShadow:"inset 0 0 60px rgba(0,0,0,.4)",
      }}>
        {/* Grid lines */}
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            position:"absolute", left:`${20*i}%`, top:0, bottom:0,
            width:1, background:"rgba(245,158,11,.04)",
            animation:"scanGrid 3s ease-in-out infinite alternate",
            animationDelay:`${i*0.4}s`,
          }}/>
        ))}

        {/* Ground */}
        <div style={{
          position:"absolute", bottom:50, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(245,158,11,.15),transparent)",
        }}/>

        {/* Ambient floor glow */}
        <div style={{
          position:"absolute", bottom:0, left:"50%",
          transform:"translateX(-50%)",
          width:260, height:80, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(245,158,11,.07) 0%,transparent 70%)",
          filter:"blur(18px)", pointerEvents:"none",
          animation:"glowAura 3s ease-in-out infinite",
        }}/>

        {/* Confetti */}
        <Confetti particles={confetti}/>

        {/* Character + bubble wrapper */}
        <div style={{
          position:"absolute",
          bottom:34,
          left:`${posX}%`,
          transform:`translateX(-50%) scaleX(${flipped ? -1 : 1})`,
          transition:state !== "walking" ? "left .6s cubic-bezier(.22,1,.36,1)" : "none",
          cursor:"pointer",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
        }}
          onClick={handleBotClick}
        >
          {showBub && bubble && (
            <SpeechBubble text={bubble} flipped={flipped}/>
          )}
          <PathfinderBot state={state}/>
        </div>

        {/* State badge */}
        <div style={{
          position:"absolute", top:12, right:14,
          padding:"4px 10px", borderRadius:8,
          background:"rgba(0,0,0,.55)", backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,.08)",
          fontSize:10.5, color:"rgba(245,158,11,.8)", fontWeight:600,
          letterSpacing:".5px",
        }}>
          {STATES.find(s => s.id === state)?.icon}{" "}
          {state.toUpperCase()}
        </div>

        {/* Click hint */}
        {state === "walking" && clicks === 0 && (
          <div style={{
            position:"absolute", bottom:12, left:"50%",
            transform:"translateX(-50%)",
            fontSize:10.5, color:"rgba(255,255,255,.2)",
            animation:"fadeUp .5s ease 1.5s both",
            whiteSpace:"nowrap",
          }}>
            Tap the Director to reverse direction
          </div>
        )}
      </div>

      {/* ── State controls ─────────────────────────────────── */}
      <div>
        <div style={{ fontSize:9.5, letterSpacing:"2.5px", textTransform:"uppercase",
          color:"rgba(255,255,255,.18)", marginBottom:12, textAlign:"center" }}>
          Switch Animation State
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
          {STATES.map(s => {
            const active = state === s.id;
            return (
              <button key={s.id} onClick={() => setState(s.id)} style={{
                padding:"11px 10px",
                borderRadius:15,
                border:`1px solid ${active ? s.col+"55" : "rgba(255,255,255,.07)"}`,
                background: active ? `${s.col}10` : "rgba(255,255,255,.025)",
                color: active ? s.col : "rgba(255,255,255,.38)",
                fontSize:12.5,
                fontWeight: active ? 700 : 400,
                cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                transition:"all .18s",
                fontFamily:"'DM Sans',sans-serif",
                boxShadow: active ? `0 0 14px ${s.col}18` : "none",
              }}>
                <span style={{ fontSize:14 }}>{s.icon}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── JSON wiring info ───────────────────────────────── */}
      <div style={{
        padding:"14px 16px", borderRadius:16,
        background:"rgba(255,255,255,.025)",
        border:"1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ fontSize:9.5, letterSpacing:"2px", textTransform:"uppercase",
          color:"rgba(255,255,255,.18)", marginBottom:8 }}>
          Live JSON → Animation Mapping
        </div>
        <div style={{ fontFamily:"'Fira Code','Courier New',monospace", fontSize:11.5,
          color:"rgba(255,255,255,.5)", lineHeight:1.8 }}>
          <span style={{ color:"rgba(245,158,11,.65)" }}>uiAction</span>
          {": "}<span style={{ color:"rgba(74,222,128,.7)" }}>"{state}"</span>
          <br/>
          <span style={{ color:"rgba(167,139,250,.65)" }}>botState</span>
          {" → "}<span style={{ color:"white" }}>
            {state === "none" ? "idle" : state}
          </span>
          <br/>
          <span style={{ color:"rgba(96,165,250,.65)" }}>speechBubble</span>
          {" → "}<span style={{ color:"rgba(255,255,255,.6)" }}>
            {showBub && bubble ? `"${bubble.slice(0,28)}…"` : "cycling…"}
          </span>
        </div>
      </div>

      {/* ── Integration note ───────────────────────────────── */}
      <div style={{ fontSize:12, color:"rgba(255,255,255,.28)", lineHeight:1.7,
        textAlign:"center", paddingBottom:4 }}>
        In production, <span style={{ color:"rgba(245,158,11,.6)" }}>PathfinderBot</span> sits
        as an overlay in the chat screen. The <span style={{ color:"rgba(245,158,11,.6)" }}>state</span> prop
        is driven by the <span style={{ color:"rgba(245,158,11,.6)" }}>uiAction</span> returned
        from the <span style={{ color:"rgba(167,139,250,.6)" }}>chat-director</span> Edge Function —
        no separate animation state is ever manually set.
      </div>
    </div>
  );
}
