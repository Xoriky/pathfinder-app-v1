import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  input::placeholder{color:rgba(255,255,255,0.26);}
  button{font-family:'DM Sans',sans-serif;}
  ::-webkit-scrollbar{display:none;}
  @keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:.35;}30%{transform:translateY(-5px);opacity:1;}}
  @keyframes waveBar{0%,100%{transform:scaleY(0.5);opacity:.35;}50%{transform:scaleY(1.8);opacity:.9;}}
  @keyframes rippleOut{0%{transform:scale(1);opacity:.7;}100%{transform:scale(2.6);opacity:0;}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(28px);}to{opacity:1;transform:translateX(0);}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:translateX(0);}}
  @keyframes slideUp{from{opacity:0;transform:translateY(36px);}to{opacity:1;transform:translateY(0);}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 18px rgba(245,158,11,.3);}50%{box-shadow:0 0 32px rgba(245,158,11,.55);}}
  @keyframes glowStrong{0%,100%{box-shadow:0 0 28px rgba(245,158,11,.5),0 0 60px rgba(245,158,11,.2);}50%{box-shadow:0 0 48px rgba(245,158,11,.8),0 0 90px rgba(245,158,11,.35);}}
  @keyframes levelPulse{0%,100%{box-shadow:0 0 0 3px rgba(245,158,11,.18),0 0 14px rgba(245,158,11,.18);}50%{box-shadow:0 0 0 7px rgba(245,158,11,.06),0 0 26px rgba(245,158,11,.45);}}
  @keyframes ringExpand{0%{transform:scale(1);opacity:.55;}100%{transform:scale(3);opacity:0;}}
  @keyframes logoActivate{0%{transform:scale(.75);opacity:0;}60%{transform:scale(1.06);}100%{transform:scale(1);opacity:1;}}
  @keyframes uploadFill{from{width:0%;}to{width:100%;}}
  @keyframes handoffFill{from{width:0%;}to{width:100%;}}
  @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
  @keyframes checkPop{0%{opacity:0;transform:scale(0) rotate(-30deg);}60%{transform:scale(1.25) rotate(5deg);}100%{opacity:1;transform:scale(1) rotate(0);}}
  @keyframes shimmerSlide{0%{transform:translateX(-100%);}100%{transform:translateX(250%);}}
  @keyframes dbSlideIn{from{opacity:0;transform:translateX(14px);}to{opacity:1;transform:translateX(0);}}
  @keyframes blinkDot{0%,100%{opacity:1;}50%{opacity:.3;}}
  @keyframes rowFlash{0%,100%{background:transparent;}40%{background:rgba(245,158,11,.14);}}
  @keyframes authShine{0%{transform:translateX(-100%) skewX(-18deg);}100%{transform:translateX(300%) skewX(-18deg);}}
  @keyframes expandIn{from{opacity:0;transform:scaleY(0);transform-origin:top;}to{opacity:1;transform:scaleY(1);transform-origin:top;}}
  @keyframes notifPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.15);}}
  @keyframes warningGlow{0%,100%{box-shadow:inset 0 0 0 0 rgba(245,158,11,0);}50%{box-shadow:inset 0 0 0 4px rgba(245,158,11,.58),inset 0 0 32px rgba(245,158,11,.09);}}
  @keyframes sprintWarnBg{0%,100%{background:rgba(245,158,11,.06);}50%{background:rgba(245,158,11,.16);}}
  @keyframes praiseReveal{0%{opacity:0;transform:scale(.93) translateY(7px);}60%{transform:scale(1.02);}100%{opacity:1;transform:scale(1) translateY(0);}}
  @keyframes lockoutIn{0%{opacity:0;transform:scale(.88) translateY(14px);}65%{transform:scale(1.03);}100%{opacity:1;transform:scale(1) translateY(0);}}
  @keyframes breathePulse{0%,100%{opacity:.55;}50%{opacity:1;}}
  @keyframes holdFill{from{width:0%;}to{width:100%;}}
  @keyframes scanLine{0%{transform:translateY(0);opacity:0;}8%{opacity:.5;}92%{opacity:.5;}100%{transform:translateY(100%);opacity:0;}}
  @keyframes courseStepIn{from{opacity:0;transform:translateX(22px);}to{opacity:1;transform:translateX(0);}}
  @keyframes diffIn{from{opacity:0;transform:translateY(8px) scale(.98);}to{opacity:1;transform:translateY(0) scale(1);}}
  @keyframes readinessGrow{from{width:0%;}to{width:100%;}}
  @keyframes videoPlayPulse{0%,100%{transform:scale(1);opacity:.7;}50%{transform:scale(1.08);opacity:1;}}
  @keyframes toastPop{0%{opacity:0;transform:translateY(6px) scale(.94);}60%{transform:translateY(-2px) scale(1.03);}100%{opacity:1;transform:translateY(0) scale(1);}}
`;

const C = {
  bg:"#09090f", bgChat:"#0b0b13", surface:"rgba(255,255,255,.055)",
  surfaceHover:"rgba(255,255,255,.085)", border:"rgba(255,255,255,.08)",
  amber:"#f59e0b", amberDeep:"#d97706", amberDark:"rgba(20,8,0,.88)",
  textPrimary:"rgba(255,255,255,.92)", textMuted:"rgba(255,255,255,.42)",
  textDim:"rgba(255,255,255,.22)", green:"#4ade80", red:"#ef4444",
  blue:"rgba(56,189,248,.75)",
};

const PROVIDERS = [
  { id:"google", label:"Continue with Google", email:"alex.ventures@gmail.com",
    icon:(<svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.21 22.56 15.47 22.56 12.25z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>) },
  { id:"apple", label:"Continue with Apple", email:"alex@icloud.com",
    icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>) },
  { id:"meta", label:"Continue with Meta", email:"alex.ventures@meta.com",
    icon:(<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/></svg>) },
];

const SOURCES = [
  {id:"claude",label:"Claude",color:"#a78bfa",letter:"C",filename:"claude_export_jan24.json",size:"2.4 MB"},
  {id:"chatgpt",label:"ChatGPT",color:"#10b981",letter:"G",filename:"chatgpt_history_q4.json",size:"1.8 MB"},
  {id:"gemini",label:"Gemini",color:"#60a5fa",letter:"\u2736",filename:"gemini_conversations.json",size:"3.1 MB"},
  {id:"notes",label:"Notes",color:"#f59e0b",letter:"\u2261",filename:"startup_notes_dec.txt",size:"45 KB"},
];

const DEVS = [
  {name:"Arjun Mehta",role:"Full-Stack Developer",skills:["React","Node.js","MongoDB"],rating:4.9,projects:87,color:"#f59e0b",avail:true},
  {name:"Sarah Chen",role:"Mobile Developer",skills:["React Native","Swift","Firebase"],rating:4.8,projects:62,color:"#60a5fa",avail:true},
  {name:"Marcus Webb",role:"Backend Engineer",skills:["Python","AWS","PostgreSQL"],rating:5.0,projects:43,color:"#4ade80",avail:false},
];
const DESIGNERS = [
  {name:"Leila Karimi",role:"Product Designer",skills:["Figma","Prototyping","Systems"],rating:4.9,projects:91,color:"#c084fc",avail:true},
  {name:"Diego Santos",role:"UI/UX Designer",skills:["Motion Design","Branding","Webflow"],rating:4.7,projects:55,color:"#fb7185",avail:true},
];

const LEVELS_DATA = [
  {num:1,name:"The Spark",status:"done",desc:"Reality & Physics Check Passed",meta:"Completed Jan 12"},
  {num:2,name:"The Blueprint",status:"done",desc:"Foundational Knowledge Acquired",meta:"Completed Jan 18"},
  {num:3,name:"The Prototype & Handoff",status:"active",desc:"MVP Architecture in progress"},
  {num:4,name:"The Scale",status:"locked",desc:"AI Pitch Audit required to advance",
    expandDetail:"Your MVP must pass our AI Pitch Audit before scaling. This covers technical feasibility, market differentiation, and a financial model review.",
    expandCta:"Request AI Pitch Audit"},
  {num:5,name:"The Apex",status:"locked",desc:"Premium presentation fee required to access Investors Catalogue",
    expandDetail:"Unlock our curated network of 200+ verified investors. Requires completion of Level 4 audit and a one-time $299 presentation fee.",
    expandCta:"View Investor Catalogue \u2192"},
];

/* ACCOUNTABILITY ENGINE — SLOT MACHINE RESPONSES */

const CLINICAL = [
  "Task logged. Proceed to next parameter.",
  "Acknowledged. What is the next variable?",
  "Input registered. Define the next constraint.",
  "Noted. Continue with the core architecture.",
  "Data captured. Move to the next critical path item.",
  "Confirmed. What is the primary dependency here?",
  "Recorded. Identify the next failure mode to mitigate.",
  "Processed. Specify the next deliverable.",
  "Received. What does your first paying user look like?",
  "Logged. Quantify the market inefficiency you are solving.",
  "Registered. State the single most dangerous assumption in this model.",
  "Captured. What is the minimum viable proof this works?",
];

const PRAISE = [
  "Hold on. This is phenomenal. 90% of founders miss this nuance entirely. You are architecting a brilliant foundation.",
  "Stop. This insight is category-defining. Most founding teams take six months to arrive here. You just did it in minutes.",
  "This is exceptional. You have identified the exact leverage point that tier-one VCs look for in a Series A. Continue immediately.",
  "Remarkable. This single observation separates the top 1% of founders from the rest. Document this now.",
  "Extraordinary clarity. You have cracked the core value proposition that kills 80% of startups before they launch. Press forward.",
  "Outstanding. This is precisely the thinking that turns a startup into a category-defining company. Do not lose this thread.",
];

const TIERS = [
  {id:"guide",   name:"The Guide",     badge:"\uD83E\uDDED", color:"#60a5fa",
   tagline:"Gentle Momentum",
   desc:"Supportive AI responses. Flexible pacing. No hard lockouts or timers.",
   perks:["Encouragement-based","Soft nudges only","No biological locks"],
   warn:"Light accountability. Suitable for building initial momentum. Sprints are optional."},
  {id:"coach",   name:"The Coach",     badge:"\uD83C\uDFAF", color:"#f59e0b",
   tagline:"Structured Execution",
   desc:"Structured 90-min sprints enforced. Direct AI feedback. Progress is tracked and reported.",
   perks:["Sprint enforcement","Direct AI tone","Warning states active"],
   warn:"Moderate accountability. 90-minute sprint warnings and lockouts are enforced without exception."},
  {id:"architect",name:"The Architect",badge:"\u26A1",        color:"#ef4444",
   tagline:"Maximum Pressure",
   desc:"Full biological lockouts. Zero-tolerance AI. Physiological triggers enforce every rule.",
   perks:["Full 90-min lockouts","Relentless AI tone","Physiological enforcement"],
   warn:"Maximum accountability. No mercy. No exceptions. Full lockouts enforced every session."},
];

/* PHASE 2 — JSON-DRIVEN STATE MACHINE: simulated LLM response router */

const SIMULATED_RESPONSES = {
  cac:{
    replyText:"CAC \u2014 Customer Acquisition Cost \u2014 is the total you spend to acquire one paying customer.\n\nFormula:\nCAC = Total Marketing + Sales Spend \u00f7 New Customers Acquired\n\nExample: $10,000 in ad spend this month \u2192 100 new customers \u2192 CAC = $100 per customer.\n\nWhy it terminates funding conversations: If your CAC exceeds your LTV (Lifetime Value per customer), every sale destroys capital. Investors see this immediately and close the deck.",
    uiAction:"none",actionPayload:{},
    readinessScoreIncrease:10,learnedSkill:"Customer Acquisition Cost",
  },
  pitch:{
    replyText:"Study this carefully. The gap between how you currently speak and how investors need to hear it is costing you deals right now.",
    uiAction:"show_diff",
    actionPayload:{
      label:"Pitch Language Translation",
      casual:"We're building an app that helps teams communicate better. Lots of companies have this problem and we think AI can fix it. We're looking for funding to grow faster.",
      professional:"We are eliminating the $47B async communication tax responsible for 23% productivity loss in distributed teams. Our AI-native context layer reduces cognitive switching overhead by 67%. We are raising a $1.2M pre-seed to close 50 design-partner contracts and validate enterprise pricing within 6 months.",
    },
    readinessScoreIncrease:5,learnedSkill:"Investor Communication",
  },
  supplyChain:{
    replyText:"Before we go further, your knowledge gap here is a structural risk to this venture. Watch this module. Chat is locked until you complete it.",
    uiAction:"inject_video",
    actionPayload:{
      title:"Supply Chain Fundamentals",
      subtitle:"Essential for hardware, marketplace & D2C founders",
      duration:"4:32",
    },
    readinessScoreIncrease:8,learnedSkill:"Supply Chain Basics",
  },
  course:{
    replyText:"Entering deep learning mode. Transitioning to Founder Fundamentals. Stand by.",
    uiAction:"start_course",
    actionPayload:{
      title:"Founder Fundamentals",
      steps:[
        {step:1,title:"The Lean Canvas",
          description:"Distill your entire business model onto a single structured page. This forces absolute clarity on your problem statement, unique value proposition, customer segments, revenue streams, and cost structure. No investor meeting happens without this artifact in your hand.",
          quiz:"What is the most critical box on the Lean Canvas, and why?"},
        {step:2,title:"Unit Economics",
          description:"Master LTV, CAC, payback period, and gross margin. A business with an LTV:CAC ratio below 3:1 is structurally destroying value at scale. If your payback period exceeds 18 months, you are a bank extended credit, not a startup generating leverage.",
          quiz:"If your CAC is $150 and monthly gross profit per customer is $30, what is your payback period in months?"},
        {step:3,title:"The Investor Narrative",
          description:"Investors fund stories, not spreadsheets. Your narrative must move through this arc: Problem \u2192 Insight \u2192 Solution \u2192 Evidence \u2192 Ask. Each transition must feel inevitable. The ask is not a request \u2014 it is the logical conclusion of an argument you have already won.",
          quiz:"Recite the 5-stage investor narrative arc in order."},
      ],
    },
    readinessScoreIncrease:0,learnedSkill:null,
  },
};

function AILogo({size=32,strong=false}){
  return(
    <div style={{width:size,height:size,borderRadius:Math.round(size*.3),flexShrink:0,
      background:`linear-gradient(145deg,${C.amber},${C.amberDeep})`,
      display:"flex",alignItems:"center",justifyContent:"center",
      animation:`${strong?"glowStrong":"glowPulse"} 3s ease-in-out infinite`}}>
      <svg viewBox="0 0 24 24" fill={C.amberDark} width={size*.52} height={size*.52}>
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 11a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2z"/>
      </svg>
    </div>
  );
}

function StatusBar(){
  return(
    <div style={{position:"absolute",top:0,left:0,right:0,height:44,display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"0 26px",zIndex:100,pointerEvents:"none"}}>
      <span style={{fontSize:15,fontWeight:600,color:"white"}}>9:41</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
          <rect x=".5" y="4" width="2.5" height="8" rx="1" opacity=".4"/>
          <rect x="4.5" y="2.5" width="2.5" height="9.5" rx="1" opacity=".6"/>
          <rect x="8.5" y="1" width="2.5" height="11" rx="1" opacity=".8"/>
          <rect x="12.5" y="0" width="2.5" height="12" rx="1"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
          <path d="M8 2.8C5.7 2.8 3.6 3.8 2 5.4L.4 3.7C2.4 1.4 5 0 8 0s5.6 1.4 7.6 3.7L14 5.4C12.4 3.8 10.3 2.8 8 2.8z" opacity=".5"/>
          <path d="M8 6C6.4 6 5 6.7 3.9 7.8L2.3 6.1C3.8 4.4 5.8 3.4 8 3.4s4.2 1 5.7 2.7L12.1 7.8C11 6.7 9.6 6 8 6z" opacity=".8"/>
          <circle cx="8" cy="10.5" r="1.5"/>
        </svg>
        <div style={{display:"flex",alignItems:"center"}}>
          <div style={{width:23,height:11,border:"1.5px solid rgba(255,255,255,.55)",borderRadius:3,display:"flex",alignItems:"center",padding:"0 2px"}}>
            <div style={{width:"80%",height:6,background:"white",borderRadius:1.5}}/>
          </div>
          <div style={{width:2,height:5,background:"rgba(255,255,255,.45)",borderRadius:1,marginLeft:1}}/>
        </div>
      </div>
    </div>
  );
}

function BackBtn({onClick}){
  return(
    <button onClick={onClick} style={{width:36,height:36,borderRadius:11,background:C.surface,
      border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",
      cursor:"pointer",color:"rgba(255,255,255,.65)",flexShrink:0,transition:"background .15s"}}
      onMouseOver={e=>e.currentTarget.style.background=C.surfaceHover}
      onMouseOut={e=>e.currentTarget.style.background=C.surface}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  );
}

function ScrHeader({title,sub,onBack,right}){
  return(
    <div style={{padding:"50px 18px 13px",background:"rgba(9,9,15,.94)",backdropFilter:"blur(24px)",
      borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0,zIndex:10}}>
      <BackBtn onClick={onBack}/>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:600,color:"white",letterSpacing:"-.1px"}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function TypingInd(){
  return(
    <div style={{display:"flex",gap:8,alignItems:"flex-end",animation:"fadeUp .25s ease"}}>
      <AILogo size={28}/>
      <div style={{padding:"13px 16px",borderRadius:"16px 16px 16px 3px",background:C.surface,
        border:`1px solid ${C.border}`,display:"flex",gap:4,alignItems:"center"}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.amber,opacity:.6,
            animation:`typingBounce 1.35s ease-in-out ${i*.17}s infinite`}}/>
        ))}
      </div>
    </div>
  );
}

function WaveAnim({label="Analyzing\u2026"}){
  return(
    <div style={{display:"flex",gap:8,alignItems:"flex-end",animation:"fadeUp .3s ease"}}>
      <AILogo size={28}/>
      <div style={{padding:"12px 15px",borderRadius:"16px 16px 16px 3px",background:C.surface,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11.5,color:"rgba(245,158,11,.8)",fontWeight:500,letterSpacing:".4px",marginBottom:9}}>{label}</div>
        <div style={{display:"flex",gap:3,alignItems:"center",height:18}}>
          {Array.from({length:10},(_,i)=>(
            <div key={i} style={{width:3,height:14,borderRadius:2,background:C.amber,opacity:.5,
              animation:`waveBar 1.1s ease-in-out ${i*.09}s infinite`,transformOrigin:"center"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// GAP 1 FIXED: Added onGoToHub prop + hasHubBtn UI
// ACCOUNTABILITY: Added isPraise / isWarning styling
// PHASE 2: Renders inject_video and show_diff action cards
function MsgBubble({msg,showChips,onSelectChip,onGoToHub,videoLockedMsgId,onWatched}){
  const ai=msg.type==="ai";
  const isPraise=!!msg.isPraise;
  const isWarning=!!msg.isWarning;

  const bubbleBg=ai
    ?(isPraise?"rgba(245,158,11,.08)":isWarning?"rgba(245,158,11,.07)":C.surface)
    :`linear-gradient(135deg,${C.amber},${C.amberDeep})`;
  const bubbleBorder=ai
    ?(isPraise?"1px solid rgba(245,158,11,.38)":isWarning?"1px solid rgba(245,158,11,.28)":`1px solid ${C.border}`)
    :"none";
  const bubbleShadow=isPraise?"0 0 18px rgba(245,158,11,.14)":isWarning?"0 0 10px rgba(245,158,11,.1)":"none";
  const bubbleAnim=isPraise?"praiseReveal .45s cubic-bezier(.22,1,.36,1)":"none";

  return(
    <div style={{display:"flex",flexDirection:ai?"row":"row-reverse",gap:8,alignItems:"flex-end",animation:"fadeUp .3s ease"}}>
      {ai&&<AILogo size={28}/>}
      <div style={{maxWidth:"78%"}}>
        {isPraise&&(
          <div style={{marginBottom:5,display:"flex",alignItems:"center",gap:5,animation:"fadeUp .3s ease"}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",
              padding:"2px 8px",borderRadius:5,background:"rgba(245,158,11,.15)",color:C.amber}}>
              \u2605 Elite Insight
            </span>
          </div>
        )}
        {isWarning&&(
          <div style={{marginBottom:5,display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",
              padding:"2px 8px",borderRadius:5,background:"rgba(245,158,11,.12)",color:C.amber,
              animation:"breathePulse 1.2s ease-in-out infinite"}}>
              \u26a0\ufe0f Sprint Warning
            </span>
          </div>
        )}
        <div style={{padding:"11px 14px",borderRadius:ai?"16px 16px 16px 3px":"16px 16px 3px 16px",
          background:bubbleBg,border:bubbleBorder,boxShadow:bubbleShadow,
          color:ai?C.textPrimary:C.amberDark,fontSize:14.5,lineHeight:1.62,
          fontWeight:ai?400:500,whiteSpace:"pre-line",letterSpacing:ai?".1px":"0",
          animation:bubbleAnim}}>
          {msg.text}
          {/* DIFF VIEWER — renders inside the bubble when uiAction is show_diff */}
          {ai&&msg.uiAction==="show_diff"&&msg.actionPayload&&(
            <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10,animation:"fadeUp .4s ease"}}>
              {/* Casual / struck-through */}
              <div style={{padding:"12px 14px",borderRadius:12,
                background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.15)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#ef4444",
                  textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>
                  Original / Casual
                </div>
                <div style={{fontSize:13.5,color:"rgba(255,255,255,.6)",
                  textDecoration:"line-through",opacity:.8}}>
                  {msg.actionPayload.casual}
                </div>
              </div>
              {/* Investor-ready version */}
              <div style={{padding:"14px 16px",borderRadius:12,
                background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.25)",
                boxShadow:"0 4px 20px rgba(74,222,128,.1)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#4ade80",
                    textTransform:"uppercase",letterSpacing:"1px"}}>
                    Investor Ready
                  </div>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
                    stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div style={{fontSize:14,color:"white",lineHeight:1.5}}>
                  {msg.actionPayload.professional}
                </div>
              </div>
            </div>
          )}
        </div>
        {msg.hasChips&&showChips&&(
          <div style={{marginTop:9,display:"flex",flexDirection:"column",gap:7}}>
            {[{label:"Tell me about Idea 2",num:"01"},{label:"Show all 3 ideas",num:"02"}].map(opt=>(
              <button key={opt.num} onClick={()=>onSelectChip(opt.label)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"9px 13px",borderRadius:12,
                background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.28)",
                color:C.amber,fontSize:13,fontWeight:500,cursor:"pointer",textAlign:"left",transition:"background .15s"}}
                onMouseOver={e=>e.currentTarget.style.background="rgba(245,158,11,.14)"}
                onMouseOut={e=>e.currentTarget.style.background="rgba(245,158,11,.07)"}>
                <span style={{fontSize:10.5,fontWeight:700,background:"rgba(245,158,11,.14)",
                  padding:"3px 7px",borderRadius:6,fontFamily:"monospace"}}>{opt.num}</span>
                {opt.label}
                <span style={{marginLeft:"auto",opacity:.45}}>\u2192</span>
              </button>
            ))}
          </div>
        )}
        {msg.hasHubBtn&&onGoToHub&&(
          <div style={{marginTop:9,animation:"fadeUp .35s ease"}}>
            <button onClick={onGoToHub} style={{
              width:"100%",padding:"12px 14px",border:"none",borderRadius:12,
              background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
              color:C.amberDark,fontSize:13,fontWeight:600,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              boxShadow:"0 4px 16px rgba(245,158,11,.32)",letterSpacing:"-.1px"}}>
              <svg viewBox="0 0 24 24" fill={C.amberDark} width="15" height="15">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
              </svg>
              Map to Project Hub \u2192
            </button>
          </div>
        )}
        {/* PHASE 2: inject_video card rendered below bubble in message history */}
        {ai&&msg.uiAction==="inject_video"&&msg.actionPayload&&(
          <InjectVideoCard payload={msg.actionPayload} msgId={msg.id}
            videoLockedMsgId={videoLockedMsgId} onWatched={onWatched}/>
        )}
      </div>
    </div>
  );
}

function ChatHeader({title,onBack}){
  return(
    <div style={{padding:"50px 18px 13px",background:"rgba(9,9,15,.94)",backdropFilter:"blur(24px)",
      borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0,zIndex:10}}>
      <BackBtn onClick={onBack}/>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:600,color:"white"}}>{title}</div>
        <div style={{fontSize:10.5,color:"rgba(245,158,11,.7)",display:"flex",alignItems:"center",gap:5,marginTop:2}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.green,boxShadow:`0 0 5px ${C.green}`}}/>
          AI Partner \u00b7 Active
        </div>
      </div>
      <AILogo size={36}/>
    </div>
  );
}

function InputBar({value,onChange,onSend,onKeyDown,isRecording,onToggleRecord,disabled}){
  if(disabled){
    return(
      <div style={{padding:"10px 14px 26px",background:"rgba(9,9,15,.96)",
        backdropFilter:"blur(24px)",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,
          background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.06)",
          borderRadius:28,padding:"12px 18px"}}>
          <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.2)" width="16" height="16">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <span style={{flex:1,fontSize:13,color:"rgba(255,255,255,.25)",fontFamily:"'DM Sans',sans-serif"}}>
            Watch the video above to unlock chat
          </span>
        </div>
      </div>
    );
  }
  return(
    <div style={{padding:"10px 14px 26px",background:"rgba(9,9,15,.96)",backdropFilter:"blur(24px)",
      borderTop:`1px solid ${C.border}`,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:9,background:C.surface,
        border:`1px solid ${isRecording?"rgba(239,68,68,.4)":C.border}`,
        borderRadius:28,padding:"7px 7px 7px 16px",transition:"border-color .2s"}}>
        <input type="text" value={value} onChange={onChange} onKeyDown={onKeyDown}
          placeholder={isRecording?"Listening\u2026":"Message your AI partner\u2026"}
          style={{flex:1,background:"transparent",border:"none",outline:"none",
            color:"white",fontSize:14.5,fontFamily:"'DM Sans',sans-serif"}}/>
        <div style={{position:"relative",flexShrink:0}}>
          {isRecording&&<>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(239,68,68,.35)",animation:"rippleOut 1.3s ease-out infinite"}}/>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(239,68,68,.2)",animation:"rippleOut 1.3s ease-out .45s infinite"}}/>
          </>}
          <button onClick={value.trim()?onSend:onToggleRecord} style={{
            width:40,height:40,borderRadius:"50%",border:"none",
            background:isRecording?"linear-gradient(135deg,#ef4444,#dc2626)":`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",position:"relative",zIndex:1,
            boxShadow:isRecording?"0 0 18px rgba(239,68,68,.55)":"0 4px 14px rgba(245,158,11,.42)",
            transition:"background .2s,box-shadow .2s"}}>
            {value.trim()
              ?<svg viewBox="0 0 24 24" fill={C.amberDark} width="18" height="18"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              :<svg viewBox="0 0 24 24" fill={isRecording?"white":C.amberDark} width="18" height="18">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>}
          </button>
        </div>
      </div>
      {isRecording&&(
        <div style={{marginTop:7,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          fontSize:11.5,color:"rgba(239,68,68,.8)",fontWeight:500}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.red,animation:"typingBounce .9s ease-in-out infinite"}}/>
          Recording \u2014 tap mic to stop
        </div>
      )}
    </div>
  ); // end normal input return
} // end InputBar

/* AUTH SCREEN */

function AuthScreen({onAuth}){
  const [loading,setLoading]=useState(null);
  const handle=(id)=>{setLoading(id);setTimeout(()=>onAuth(id),900);};
  return(
    <div style={{position:"absolute",inset:0,
      background:"linear-gradient(170deg,#060610 0%,#0d0d1e 50%,#070d16 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",
      padding:"0 28px",animation:"fadeIn .4s ease"}}>
      <div style={{position:"absolute",top:80,left:"50%",transform:"translateX(-50%)",
        width:320,height:320,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(245,158,11,.09) 0%,transparent 70%)",
        filter:"blur(40px)",pointerEvents:"none"}}/>
      <div style={{marginTop:100,display:"flex",flexDirection:"column",alignItems:"center",zIndex:1}}>
        <div style={{position:"relative",marginBottom:28}}>
          <AILogo size={76} strong/>
          {[60,90,120].map((s,i)=>(
            <div key={i} style={{position:"absolute",
              top:`${(76-s)/2}px`,left:`${(76-s)/2}px`,
              width:s,height:s,borderRadius:"50%",
              border:`1px solid rgba(245,158,11,${.3-i*.09})`,
              animation:`ringExpand ${2.4+i*.4}s ease-out ${i*.3}s infinite`}}/>
          ))}
        </div>
        <div style={{fontSize:10,letterSpacing:"4px",textTransform:"uppercase",
          color:"rgba(245,158,11,.55)",fontWeight:500,marginBottom:10}}>
          AI Business Architect
        </div>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:42,fontWeight:400,
          color:"white",letterSpacing:"-.5px",marginBottom:8,textAlign:"center"}}>
          Pathfinder
        </h1>
        <p style={{fontSize:14,color:C.textMuted,textAlign:"center",lineHeight:1.6,maxWidth:260}}>
          From first idea to funded venture \u2014 guided by AI, step by step.
        </p>
      </div>
      <div style={{width:"100%",marginTop:"auto",marginBottom:16,zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
          <span style={{fontSize:11,color:C.textDim,fontWeight:500}}>Sign in to continue</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {PROVIDERS.map(p=>(
            <button key={p.id} onClick={()=>handle(p.id)} style={{
              width:"100%",padding:"14px 20px",borderRadius:18,
              background:loading===p.id?"rgba(245,158,11,.12)":C.surface,
              border:`1px solid ${loading===p.id?"rgba(245,158,11,.4)":C.border}`,
              display:"flex",alignItems:"center",gap:12,cursor:"pointer",
              transition:"all .2s",position:"relative",overflow:"hidden"}}>
              {loading===p.id&&(
                <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(245,158,11,.08),transparent)",
                  animation:"authShine .9s ease forwards"}}/>
              )}
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.07)",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {p.icon}
              </div>
              <span style={{fontSize:14.5,fontWeight:600,color:loading===p.id?C.amber:"rgba(255,255,255,.8)",
                letterSpacing:"-.1px"}}>
                {loading===p.id?"Authenticating\u2026":p.label}
              </span>
            </button>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:10.5,color:C.textDim,marginTop:18,lineHeight:1.6,marginBottom:8}}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          <br/>Your data is encrypted and never shared.
        </p>
      </div>
    </div>
  );
}

/* ONBOARDING SCREEN */

const ONBOARD_MSG = "Welcome to Pathfinder. I am your AI business architect. I don't just chat \u2014 I guide you through a strict 5-Level roadmap to make your ideas reality. Let's get started.";

const CONFIRM_PHRASE = "I accept the consequences";

function OnboardingScreen({provider,onComplete}){
  const [phase,setPhase]=useState("activating"); // activating | typing | choose
  const [typed,setTyped]=useState("");
  const [selId,setSelId]=useState(null);
  const [confirmTxt,setConfirmTxt]=useState("");
  const [showModal,setShowModal]=useState(false);
  const prov=PROVIDERS.find(p=>p.id===provider);
  const modalTier=TIERS.find(t=>t.id===selId);
  const canConfirm=confirmTxt.trim()===CONFIRM_PHRASE;

  useEffect(()=>{
    const t=setTimeout(()=>setPhase("typing"),1900);
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    if(phase!=="typing")return;
    let i=0;
    const iv=setInterval(()=>{
      i++;setTyped(ONBOARD_MSG.slice(0,i));
      if(i>=ONBOARD_MSG.length){clearInterval(iv);setTimeout(()=>setPhase("choose"),700);}
    },22);
    return()=>clearInterval(iv);
  },[phase]);

  const openTier=(id)=>{setSelId(id);setConfirmTxt("");setShowModal(true);};
  const handleCommit=()=>{if(canConfirm){setShowModal(false);onComplete(selId);}};

  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",
      background:"linear-gradient(170deg,#060610 0%,#0d0d1e 55%,#070d16 100%)",
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>

      {/* Scrollable content layer */}
      <div style={{position:"absolute",inset:0,overflowY:"auto",
        display:"flex",flexDirection:"column",alignItems:"center",padding:"0 22px"}}>

        <div style={{marginTop:80,display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
          {/* Logo with rings */}
          <div style={{position:"relative",marginBottom:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {phase==="activating"&&[80,110,144].map((s,i)=>(
              <div key={i} style={{position:"absolute",width:s,height:s,borderRadius:"50%",
                border:`1px solid rgba(245,158,11,${.45-i*.13})`,
                animation:`ringExpand ${2.2+i*.5}s ease-out ${i*.35}s infinite`}}/>
            ))}
            <div style={{animation:phase==="activating"
              ?"glowStrong 2s ease-in-out infinite, logoActivate .8s cubic-bezier(.22,1,.36,1)"
              :"glowPulse 3s ease-in-out infinite"}}>
              <AILogo size={80} strong={phase==="activating"}/>
            </div>
          </div>
          <div style={{fontSize:10,letterSpacing:"3px",textTransform:"uppercase",
            color:"rgba(245,158,11,.6)",fontWeight:600,marginBottom:6}}>Pathfinder AI</div>
          <div style={{fontSize:11.5,color:C.textDim,marginBottom:28}}>
            {phase==="activating"?"Initializing your session\u2026"
              :phase==="typing"?"Speaking\u2026"
              :"Choose your Accountability Tier"}
          </div>

          {/* AI typewriter bubble */}
          {phase!=="activating"&&(
            <div style={{width:"100%",animation:"fadeUp .4s ease"}}>
              <div style={{background:C.surface,border:`1px solid ${C.border}`,
                borderRadius:"20px 20px 20px 4px",padding:"16px 18px",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <AILogo size={22}/>
                  <span style={{fontSize:11,color:"rgba(245,158,11,.7)",fontWeight:600}}>Pathfinder AI</span>
                </div>
                <p style={{fontSize:14.5,color:C.textPrimary,lineHeight:1.68,minHeight:56}}>
                  {typed}
                  {phase==="typing"&&(
                    <span style={{display:"inline-block",width:2,height:15,background:C.amber,
                      marginLeft:2,verticalAlign:"middle",animation:"blinkDot .7s ease-in-out infinite"}}/>
                  )}
                </p>
              </div>
              {prov&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,
                  padding:"8px 12px",borderRadius:12,background:"rgba(255,255,255,.03)",
                  border:`1px solid ${C.border}`}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,.07)",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>{prov.icon}</div>
                  <div style={{fontSize:12,color:C.textMuted}}>
                    Signed in as <span style={{color:"white",fontWeight:500}}>{prov.email}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tier selection cards */}
        {phase==="choose"&&(
          <div style={{width:"100%",paddingBottom:44,animation:"fadeUp .45s ease"}}>
            <div style={{fontSize:9.5,letterSpacing:"2.5px",textTransform:"uppercase",
              color:C.textDim,fontWeight:600,marginBottom:14,textAlign:"center"}}>
              Choose Your Architect
            </div>
            {TIERS.map((t,i)=>(
              <div key={t.id} onClick={()=>openTier(t.id)} style={{
                marginBottom:10,padding:"15px 16px",borderRadius:18,
                background:`${t.color}0d`,border:`1.5px solid ${t.color}38`,
                cursor:"pointer",transition:"border-color .2s,background .2s",
                animation:`fadeUp .4s ease ${i*.09}s both`}}
                onMouseOver={e=>{e.currentTarget.style.background=`${t.color}1a`;e.currentTarget.style.borderColor=`${t.color}70`;}}
                onMouseOut={e=>{e.currentTarget.style.background=`${t.color}0d`;e.currentTarget.style.borderColor=`${t.color}38`;}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:7}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`${t.color}18`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {t.badge}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15.5,fontWeight:700,color:"white",letterSpacing:"-.1px"}}>{t.name}</div>
                    <div style={{fontSize:11.5,color:t.color,fontWeight:500,marginTop:1}}>{t.tagline}</div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke={t.color}
                    strokeWidth="2" strokeLinecap="round" width="16" height="16">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
                <p style={{fontSize:12.5,color:C.textMuted,lineHeight:1.55,marginBottom:9}}>{t.desc}</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {t.perks.map(p=>(
                    <span key={p} style={{fontSize:10,padding:"2px 8px",borderRadius:5,
                      background:`${t.color}12`,color:t.color,fontWeight:500}}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>{/* end scrollable */}

      {/* Tier commit modal — sibling to scroll layer, covers full screen */}
      {showModal&&modalTier&&(
        <div style={{position:"absolute",inset:0,zIndex:200,
          background:"rgba(0,0,0,.87)",backdropFilter:"blur(16px)",
          display:"flex",alignItems:"flex-end",animation:"overlayIn .25s ease"}}>
          <div style={{width:"100%",background:"#0e0e1c",
            borderRadius:"28px 28px 0 0",padding:"10px 22px 40px",
            border:"1px solid rgba(255,255,255,.09)",borderBottom:"none",
            animation:"slideUp .38s cubic-bezier(.22,1,.36,1)",
            boxShadow:`0 -20px 60px rgba(0,0,0,.75),0 0 0 1px ${modalTier.color}20`}}>
            <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.12)",margin:"0 auto 18px"}}/>

            {/* Header */}
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:60,height:60,borderRadius:17,margin:"0 auto 12px",
                background:`${modalTier.color}18`,border:`1.5px solid ${modalTier.color}50`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                {modalTier.badge}
              </div>
              <div style={{fontSize:9.5,letterSpacing:"2px",textTransform:"uppercase",
                color:modalTier.color,fontWeight:700,marginBottom:6}}>Accountability Contract</div>
              <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:21,color:"white",
                fontWeight:400,letterSpacing:"-.2px",marginBottom:7}}>
                You selected: {modalTier.name}
              </h3>
              <p style={{fontSize:12.5,color:C.textMuted,lineHeight:1.6}}>{modalTier.warn}</p>
            </div>

            {/* Warning */}
            <div style={{padding:"11px 14px",borderRadius:13,marginBottom:14,
              background:`${modalTier.color}0a`,border:`1px solid ${modalTier.color}28`}}>
              <div style={{fontSize:11.5,color:modalTier.color,fontWeight:600,marginBottom:3}}>
                This commitment is binding.
              </div>
              <div style={{fontSize:12,color:C.textMuted,lineHeight:1.55}}>
                Downgrading later requires a typed acknowledgement or a $4.99 bypass fee, plus a 48-hour cooldown period.
              </div>
            </div>

            {/* Typed gate */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:C.textDim,marginBottom:7}}>Type to seal your commitment:</div>
              <div style={{fontSize:12,fontStyle:"italic",color:modalTier.color,textAlign:"center",
                padding:"7px 12px",borderRadius:10,marginBottom:10,
                background:`${modalTier.color}08`,border:`1px solid ${modalTier.color}1e`}}>
                "{CONFIRM_PHRASE}"
              </div>
              <input type="text" value={confirmTxt}
                onChange={e=>setConfirmTxt(e.target.value)}
                placeholder="Type the phrase above..."
                style={{width:"100%",padding:"12px 14px",borderRadius:12,
                  background:"rgba(255,255,255,.06)",outline:"none",
                  color:"white",fontSize:13.5,fontFamily:"'DM Sans',sans-serif",
                  border:`1.5px solid ${canConfirm?modalTier.color+"80":"rgba(255,255,255,.12)"}`,
                  transition:"border-color .2s"}}/>
            </div>

            <button onClick={handleCommit} disabled={!canConfirm} style={{
              width:"100%",padding:"15px",border:"none",borderRadius:18,marginBottom:10,
              background:canConfirm
                ?`linear-gradient(135deg,${modalTier.color},${modalTier.color}cc)`
                :"rgba(255,255,255,.06)",
              color:canConfirm?"white":"rgba(255,255,255,.22)",
              fontSize:15,fontWeight:600,cursor:canConfirm?"pointer":"default",
              boxShadow:canConfirm?`0 6px 22px ${modalTier.color}44`:"none",
              transition:"all .25s"}}>
              {canConfirm?`Commit to ${modalTier.name} \u2192`:"Type the phrase above to confirm"}
            </button>
            <button onClick={()=>{setShowModal(false);setSelId(null);setConfirmTxt("");}}
              style={{width:"100%",padding:"12px",border:"none",borderRadius:14,
                background:"transparent",fontSize:13.5,color:C.textMuted,cursor:"pointer"}}>
              Cancel \u2014 Choose a different tier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* DATABASE PANEL */

function DBCell({v,w,color,highlight}){
  return(
    <div style={{width:w,flexShrink:0,fontSize:9.5,
      color:highlight?"white":color||"rgba(255,255,255,.55)",
      fontFamily:"'Fira Code','Courier New',monospace",
      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
      padding:"5px 4px",lineHeight:1.4,
      background:highlight?"rgba(245,158,11,.1)":"transparent",
      transition:"background .3s,color .3s"}}>
      {v}
    </div>
  );
}

function DBTable({title,cols,widths,rows,accent="#f59e0b",isNew}){
  return(
    <div style={{marginBottom:14,animation:isNew?"fadeUp .35s ease":"none"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:"1.5px",color:accent,fontFamily:"monospace"}}>{title}</span>
        <span style={{fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"monospace"}}>[{rows.length} row{rows.length!==1?"s":""}]</span>
      </div>
      <div style={{borderRadius:8,border:"1px solid rgba(255,255,255,.07)",overflow:"hidden"}}>
        <div style={{display:"flex",background:"rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          {cols.map((c,i)=>(
            <div key={i} style={{width:widths[i],flexShrink:0,fontSize:8.5,fontWeight:700,
              color:"rgba(255,255,255,.28)",letterSpacing:"1px",textTransform:"uppercase",
              padding:"5px 4px",fontFamily:"monospace"}}>{c}</div>
          ))}
        </div>
        {rows.length===0
          ?<div style={{padding:"8px 4px",fontSize:9.5,color:"rgba(255,255,255,.2)",fontFamily:"monospace",textAlign:"center"}}>-- empty --</div>
          :rows.map((row,ri)=>(
            <div key={ri} style={{display:"flex",
              borderBottom:ri<rows.length-1?"1px solid rgba(255,255,255,.04)":"none",
              animation:row._new?"rowFlash 1.8s ease":"none"}}>
              {row.cells.map((cell,ci)=>(
                <DBCell key={ci} v={cell.v} w={widths[ci]} color={cell.color} highlight={cell.highlight}/>
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
}

function DatabasePanel({screen,level3Complete,authProvider,userEmail,onClose}){
  const [events,setEvents]=useState([
    {id:1,type:"USER_AUTH",detail:`provider: ${authProvider||"none"}`},
    {id:2,type:"SESSION_START",detail:"onboarding complete"},
  ]);
  const [flashLevel,setFlashLevel]=useState(false);
  const [flashDocs,setFlashDocs]=useState(false);
  const prevScreen=useRef(screen);
  const prevDocs=useRef(level3Complete);

  useEffect(()=>{
    if(prevScreen.current!==screen){
      const lv=["hub","pro-catalogue","investor-gate"].includes(screen)?3:["chat","upload","analysis"].includes(screen)?2:screen==="home"?1:null;
      setEvents(p=>[{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"SCREEN_CHANGE",detail:`\u2192 ${screen}${lv?` (level ${lv})`:""}`},...p].slice(0,8));
      if(lv){setFlashLevel(true);setTimeout(()=>setFlashLevel(false),1800);}
      prevScreen.current=screen;
    }
  },[screen]);

  useEffect(()=>{
    if(level3Complete&&!prevDocs.current){
      setEvents(p=>[
        {id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"DOC_CREATED",detail:"Handoff_Package.pdf"},
        {id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()*2),type:"LVL_COMPLETE",detail:"level 3 \u2192 handoff generated"},
        ...p
      ].slice(0,8));
      setFlashDocs(true);
      setTimeout(()=>setFlashDocs(false),2200);
      prevDocs.current=true;
    }
  },[level3Complete]);

  const projectLevel=["hub","pro-catalogue","investor-gate","settings"].includes(screen)?3
    :["chat","upload","analysis"].includes(screen)?2
    :screen==="home"?1:null;

  const projectStatus=level3Complete?"handoff_done":projectLevel===3?"prototyping":projectLevel===2?"analysis":"idea_capture";

  // GAP 8 FIXED: Richer tier info
  const tierLabel = "Free \u00b7 3 proj/mo";

  const userRows=authProvider?[{_new:false,cells:[
    {v:"USR_001",color:C.amber},{v:(userEmail||"").slice(0,14)+"\u2026"},{v:authProvider},
    {v:tierLabel,color:C.green},
  ]}]:[];

  const projRows=projectLevel?[{_new:false,cells:[
    {v:"PRJ_001",color:C.amber},
    {v:"Productivity Layer"},
    {v:`L${projectLevel}`,color:C.amber,highlight:flashLevel},
    {v:projectStatus,color:level3Complete?C.green:undefined,highlight:flashLevel},
  ]}]:[];

  const docRows=level3Complete?[{_new:flashDocs,cells:[
    {v:"DOC_001",color:C.amber},
    {v:"Handoff_Package.pdf",color:flashDocs?"white":C.amber,highlight:flashDocs},
    {v:"PDF"},{v:"generated",color:C.green},
  ]}]:[];

  return(
    <div style={{width:308,height:844,background:"#080810",
      borderRadius:"0 24px 24px 0",
      border:"1px solid rgba(245,158,11,.16)",borderLeft:"none",
      display:"flex",flexDirection:"column",overflow:"hidden",
      animation:"dbSlideIn .35s cubic-bezier(.22,1,.36,1)",
      fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{padding:"14px 14px 10px",borderBottom:"1px solid rgba(255,255,255,.07)",
        background:"#0c0c18",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:14}}>&#128736;&#65039;</span>
            <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.85)",letterSpacing:"-.1px"}}>
              System Architecture
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:6,
              background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.22)"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#4ade80",
                animation:"blinkDot 1.4s ease-in-out infinite"}}/>
              <span style={{fontSize:8.5,fontWeight:700,color:"#4ade80",letterSpacing:".5px"}}>LIVE</span>
            </div>
            <button onClick={onClose} style={{width:24,height:24,borderRadius:7,
              background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.09)",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              color:"rgba(255,255,255,.45)",fontSize:12}}>\u2715</button>
          </div>
        </div>
        <div style={{fontSize:9,color:"rgba(245,158,11,.45)",fontFamily:"monospace"}}>
          mock://pathfinder-db \u00b7 latency 2ms \u00b7 schema v2.1
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 12px 0"}}>
        <DBTable title="USERS_TABLE" accent="#60a5fa"
          cols={["user_id","email","provider","tier"]}
          widths={["22%","36%","22%","20%"]}
          rows={userRows}/>
        <DBTable title="PROJECTS_TABLE" accent="#a78bfa"
          cols={["proj_id","name","level","status"]}
          widths={["20%","30%","15%","35%"]}
          rows={projRows}/>
        <DBTable title="DOCUMENTS_TABLE" accent="#fb7185"
          isNew={flashDocs}
          cols={["doc_id","filename","type","status"]}
          widths={["18%","40%","16%","26%"]}
          rows={docRows}/>
        <div style={{paddingTop:10,borderTop:"1px solid rgba(255,255,255,.06)",marginBottom:14}}>
          <div style={{fontSize:8.5,fontWeight:700,color:"rgba(245,158,11,.4)",
            letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:8,fontFamily:"monospace"}}>
            EVENT LOG
          </div>
          {events.map((ev,i)=>(
            <div key={ev.id} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:6,
              animation:i===0?"fadeUp .3s ease":"none"}}>
              <div style={{width:5,height:5,borderRadius:"50%",flexShrink:0,marginTop:4,
                background:i===0?"#4ade80":"rgba(255,255,255,.18)"}}/>
              <span style={{fontSize:9,fontFamily:"monospace",
                color:i===0?"rgba(74,222,128,.8)":"rgba(255,255,255,.28)",lineHeight:1.5}}>
                <span style={{fontWeight:700}}>{ev.type}</span>{" \u00b7 "}{ev.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"8px 12px 14px",borderTop:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
        <div style={{fontSize:8.5,color:"rgba(255,255,255,.18)",fontFamily:"monospace",textAlign:"center"}}>
          PostgreSQL 15 \u00b7 Mock Schema \u00b7 Pathfinder v0.9.1-beta
        </div>
      </div>
    </div>
  );
}

/* UPLOAD SCREEN */

function UploadScreen({onBack,onAnalyze}){
  const [sel,setSel]=useState(null);
  const [phase,setPhase]=useState("idle");
  const handle=(id)=>{setSel(id);setPhase("uploading");setTimeout(()=>setPhase("done"),1400);};
  const src=SOURCES.find(s=>s.id===sel);
  return(
    <div style={{position:"absolute",inset:0,background:C.bg,display:"flex",flexDirection:"column",
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>
      <ScrHeader title="Analyze My Data" sub="Import your exported chat history"
        onBack={onBack} right={<AILogo size={36}/>}/>
      <div style={{flex:1,overflowY:"auto",padding:"22px 18px 16px"}}>
        <div style={{fontSize:10,letterSpacing:"2.5px",textTransform:"uppercase",
          color:C.textDim,fontWeight:500,marginBottom:13}}>Select Source</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
          {SOURCES.map(s=>{
            const isSel=sel===s.id;
            return(
              <button key={s.id} onClick={()=>handle(s.id)} style={{
                padding:"14px 12px",borderRadius:16,
                background:isSel?`${s.color}18`:C.surface,
                border:`1.5px solid ${isSel?s.color+"55":C.border}`,
                display:"flex",alignItems:"center",gap:10,
                cursor:"pointer",transition:"all .2s",textAlign:"left"}}>
                <div style={{width:36,height:36,borderRadius:10,background:s.color+"20",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:s.id==="gemini"?18:17,color:s.color,fontWeight:700,flexShrink:0}}>
                  {s.letter}
                </div>
                <div>
                  <div style={{fontSize:13.5,fontWeight:600,color:isSel?"white":C.textMuted}}>{s.label}</div>
                  <div style={{fontSize:10.5,color:C.textDim,marginTop:1}}>Export file</div>
                </div>
                {isSel&&(
                  <div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",
                    background:s.color,display:"flex",alignItems:"center",justifyContent:"center",
                    animation:"checkPop .3s cubic-bezier(.22,1,.36,1)"}}>
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div style={{fontSize:10,letterSpacing:"2.5px",textTransform:"uppercase",color:C.textDim,fontWeight:500,marginBottom:13}}>
          File Preview
        </div>
        <div style={{borderRadius:18,border:`1.5px dashed ${phase==="done"?C.amber+"88":"rgba(255,255,255,.11)"}`,
          padding:"20px 18px",background:phase==="done"?"rgba(245,158,11,.04)":"rgba(255,255,255,.02)",
          transition:"all .35s",marginBottom:16}}>
          {phase==="idle"&&(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:30,opacity:.2,marginBottom:8}}>\u2191</div>
              <div style={{fontSize:13,color:C.textDim,lineHeight:1.5}}>Select a source above<br/>to import your history</div>
            </div>
          )}
          {phase==="uploading"&&(
            <div>
              <div style={{fontSize:12,color:C.amber,fontWeight:500,marginBottom:10}}>Importing file\u2026</div>
              <div style={{height:4,background:"rgba(245,158,11,.12)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",background:`linear-gradient(90deg,${C.amber},${C.amberDeep})`,
                  borderRadius:2,animation:"uploadFill 1.3s cubic-bezier(.4,0,.2,1) forwards"}}/>
              </div>
            </div>
          )}
          {phase==="done"&&src&&(
            <div style={{display:"flex",alignItems:"center",gap:13,animation:"fadeUp .3s ease"}}>
              <div style={{width:42,height:42,borderRadius:12,background:"rgba(245,158,11,.1)",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg viewBox="0 0 24 24" fill={C.amber} width="21" height="21">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                </svg>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,color:"white",overflow:"hidden",
                  textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{src.filename}</div>
                <div style={{fontSize:11,color:C.textDim,marginTop:3}}>{src.size} \u00b7 Ready to analyze</div>
              </div>
              <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(74,222,128,.12)",
                border:"1.5px solid rgba(74,222,128,.5)",display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0,animation:"checkPop .35s ease"}}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
            </div>
          )}
        </div>
        {phase==="done"&&(
          <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(245,158,11,.06)",
            border:"1px solid rgba(245,158,11,.14)",display:"flex",gap:10,
            animation:"fadeUp .4s ease .1s both"}}>
            <AILogo size={24}/>
            <div style={{fontSize:12.5,color:C.textMuted,lineHeight:1.58}}>
              I'll scan this export for ideas, patterns, and insights you may have captured.
            </div>
          </div>
        )}
      </div>
      <div style={{padding:"12px 18px 32px",flexShrink:0,borderTop:`1px solid ${C.border}`}}>
        <button onClick={phase==="done"?onAnalyze:undefined} style={{
          width:"100%",padding:"16px",border:"none",borderRadius:22,
          background:phase==="done"?`linear-gradient(135deg,${C.amber},${C.amberDeep})`:"rgba(255,255,255,.05)",
          cursor:phase==="done"?"pointer":"default",fontSize:15.5,fontWeight:600,
          color:phase==="done"?C.amberDark:"rgba(255,255,255,.18)",
          boxShadow:phase==="done"?"0 8px 28px rgba(245,158,11,.35)":"none",
          transition:"all .3s",letterSpacing:"-.2px"}}>
          {phase==="done"?"Analyze Files \u2192":"Select a source to continue"}
        </button>
      </div>
    </div>
  );
}

/* HANDOFF MODAL */

function HandoffModal({onView,onClose}){
  return(
    <div style={{position:"absolute",inset:0,zIndex:200,
      background:"rgba(0,0,0,.82)",backdropFilter:"blur(14px)",
      display:"flex",alignItems:"flex-end",animation:"overlayIn .25s ease"}}>
      <div style={{width:"100%",background:"#111120",borderRadius:"28px 28px 0 0",
        padding:"10px 22px 38px",
        border:"1px solid rgba(255,255,255,.09)",borderBottom:"none",
        animation:"slideUp .38s cubic-bezier(.22,1,.36,1)",
        boxShadow:"0 -20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(245,158,11,.15)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.12)",margin:"0 auto 20px"}}/>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{width:68,height:68,borderRadius:20,
            background:`linear-gradient(145deg,${C.amber},${C.amberDeep})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto",boxShadow:"0 8px 32px rgba(245,158,11,.5)",
            animation:"glowPulse 2s ease-in-out infinite"}}>
            <svg viewBox="0 0 24 24" fill={C.amberDark} width="34" height="34">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
        </div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:10.5,letterSpacing:"3px",color:C.amber,fontWeight:700,
            textTransform:"uppercase",marginBottom:8}}>\ud83d\udea8 Level Unlocked</div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,fontWeight:400,color:"white",
            lineHeight:1.2,letterSpacing:"-.3px",marginBottom:10}}>
            Handoff Package<br/>Ready
          </h2>
          <p style={{fontSize:13.5,color:C.textMuted,lineHeight:1.6}}>
            Your AI partner has compiled your blueprint into a professional developer handoff package.
          </p>
        </div>
        <div style={{marginBottom:22,padding:"14px 16px",borderRadius:16,
          background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`}}>
          {["Technical Architecture Document","MVP Feature Specification","API Blueprint & Data Models","Curated Developer Profiles"].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,
              paddingBottom:i<3?10:0,marginBottom:i<3?10:0,
              borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(74,222,128,.12)",
                border:"1px solid rgba(74,222,128,.35)",display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0,animation:`checkPop .3s ease ${i*.1}s both`}}>
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <span style={{fontSize:13,color:C.textPrimary}}>{item}</span>
            </div>
          ))}
        </div>
        <button onClick={onView} style={{width:"100%",padding:"16px",border:"none",borderRadius:18,
          background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
          fontSize:15.5,fontWeight:600,color:C.amberDark,cursor:"pointer",
          boxShadow:"0 8px 28px rgba(245,158,11,.4)",letterSpacing:"-.2px",marginBottom:12}}>
          View Professional Catalogue \u2192
        </button>
        <button onClick={onClose} style={{width:"100%",padding:"12px",border:"none",
          borderRadius:14,background:"transparent",fontSize:14,color:C.textMuted,cursor:"pointer"}}>
          Close
        </button>
      </div>
    </div>
  );
}

/* PROJECT HUB — GAP 2, 3 FIXED: expandable locked levels + L5 \u2192 InvestorGate */

function ProjectHubScreen({onBack,level3Complete,handoffGenerating,showHandoffModal,onGenerateHandoff,onCloseModal,onViewPro,onViewInvestor}){
  const [expandedLevel,setExpandedLevel]=useState(null);

  const toggleLevel=(num)=>setExpandedLevel(prev=>prev===num?null:num);

  return(
    <div style={{position:"absolute",inset:0,background:C.bg,display:"flex",flexDirection:"column",
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>
      <ScrHeader title="Project Hub" sub="Your venture roadmap" onBack={onBack} right={<AILogo size={36}/>}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 40px"}}>
        <div style={{padding:"16px 18px",borderRadius:20,marginBottom:28,
          background:"linear-gradient(135deg,rgba(245,158,11,.09),rgba(217,119,6,.06))",
          border:"1px solid rgba(245,158,11,.2)",display:"flex",alignItems:"center",gap:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,letterSpacing:"2px",color:"rgba(245,158,11,.7)",fontWeight:600,
              textTransform:"uppercase",marginBottom:5}}>Venture Progress</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"white",fontWeight:400,
              letterSpacing:"-.3px"}}>{level3Complete?"Level 3 Complete":"Level 3 \u00b7 Active"}</div>
            <div style={{fontSize:11.5,color:C.textMuted,marginTop:4}}>
              {level3Complete?"Handoff package generated":"Prototype & handoff in progress"}
            </div>
          </div>
          <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
            <svg viewBox="0 0 56 56" width="56" height="56" style={{transform:"rotate(-90deg)"}}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(245,158,11,.12)" strokeWidth="3.5"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke={C.amber} strokeWidth="3.5"
                strokeDasharray="138" strokeDashoffset={level3Complete?0:69} strokeLinecap="round"
                style={{transition:"stroke-dashoffset .6s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:C.amber}}>{level3Complete?"60%":"50%"}</span>
            </div>
          </div>
        </div>

        <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,
          textTransform:"uppercase",marginBottom:16}}>Roadmap</div>

        {LEVELS_DATA.map((lv,i)=>{
          const done=lv.status==="done",active=lv.status==="active",locked=lv.status==="locked";
          const isLast=i===LEVELS_DATA.length-1;
          const topLine=i>0&&LEVELS_DATA[i-1].status==="done"?C.amber:"rgba(255,255,255,.1)";
          const botLine=done?C.amber:"rgba(255,255,255,.1)";
          const isExpanded=expandedLevel===lv.num;
          return(
            <div key={lv.num} style={{display:"flex",gap:0}}>
              <div style={{width:44,display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                {i>0&&<div style={{width:2,height:18,background:topLine,flexShrink:0}}/>}
                <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:done?`linear-gradient(145deg,${C.amber},${C.amberDeep})`:"transparent",
                  border:done?"none":active?`2px solid ${C.amber}`:"1.5px solid rgba(255,255,255,.1)",
                  animation:active?"levelPulse 2.5s ease-in-out infinite":done?"glowPulse 3s ease-in-out infinite":"none",
                  boxShadow:done?"0 0 14px rgba(245,158,11,.35)":"none"}}>
                  {done&&<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.amberDark} strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>}
                  {active&&<span style={{fontSize:13,fontWeight:700,color:C.amber}}>{lv.num}</span>}
                  {locked&&<svg viewBox="0 0 24 24" width="14" height="14" fill="rgba(255,255,255,.2)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>}
                </div>
                {!isLast&&<div style={{width:2,flex:1,minHeight:18,background:botLine}}/>}
              </div>
              <div style={{flex:1,marginLeft:12,paddingBottom:isLast?0:14,paddingTop:i===0?0:18}}>
                <div
                  onClick={locked?()=>toggleLevel(lv.num):undefined}
                  style={{padding:"13px 14px",borderRadius:16,
                    background:active?"rgba(245,158,11,.06)":locked?"rgba(255,255,255,.025)":"rgba(255,255,255,.045)",
                    border:`1px solid ${active?"rgba(245,158,11,.22)":locked?isExpanded?"rgba(245,158,11,.18)":"rgba(255,255,255,.06)":"rgba(255,255,255,.08)"}`,
                    cursor:locked?"pointer":"default",
                    transition:"border-color .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                    <span style={{fontSize:9.5,fontWeight:700,letterSpacing:"1.5px",
                      textTransform:"uppercase",padding:"2px 7px",borderRadius:5,
                      background:done?"rgba(74,222,128,.12)":active?"rgba(245,158,11,.15)":"rgba(255,255,255,.06)",
                      color:done?"#4ade80":active?C.amber:"rgba(255,255,255,.25)"}}>
                      {done?"\u2713 Done":active?"\u25cf Active":"Locked"}
                    </span>
                    <span style={{fontSize:10,color:C.textDim}}>Level {lv.num}</span>
                    {locked&&(
                      <span style={{marginLeft:"auto",fontSize:10,color:C.textDim,transition:"transform .2s",
                        display:"inline-block",transform:isExpanded?"rotate(180deg)":"rotate(0deg)"}}>
                        \u25be
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:14,fontWeight:600,color:locked?"rgba(255,255,255,.35)":"white",
                    letterSpacing:"-.1px",marginBottom:4}}>{lv.name}</div>
                  <div style={{fontSize:12.5,color:locked?"rgba(255,255,255,.22)":C.textMuted,lineHeight:1.5,
                    marginBottom:lv.meta?6:0}}>{lv.desc}</div>
                  {lv.meta&&<div style={{fontSize:11,color:"rgba(74,222,128,.6)",fontWeight:500}}>{lv.meta}</div>}

                  {/* GAP 2 FIXED: Expanded locked level content */}
                  {locked&&isExpanded&&(
                    <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid rgba(255,255,255,.07)`,
                      animation:"expandIn .25s ease"}}>
                      <p style={{fontSize:12.5,color:C.textMuted,lineHeight:1.6,marginBottom:12}}>
                        {lv.expandDetail}
                      </p>
                      {/* GAP 3 FIXED: Level 5 navigates to InvestorGate */}
                      <button
                        onClick={lv.num===5?onViewInvestor:e=>{e.stopPropagation();}}
                        style={{width:"100%",padding:"10px 14px",border:"none",borderRadius:11,
                          background:lv.num===5?`linear-gradient(135deg,${C.amber},${C.amberDeep})`:"rgba(255,255,255,.07)",
                          color:lv.num===5?C.amberDark:"rgba(255,255,255,.5)",
                          fontSize:12.5,fontWeight:600,cursor:lv.num===5?"pointer":"default",
                          boxShadow:lv.num===5?"0 4px 16px rgba(245,158,11,.3)":"none"}}>
                        {lv.expandCta}
                      </button>
                    </div>
                  )}

                  {/* Level 3 active content */}
                  {active&&(
                    <div style={{marginTop:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:11,color:C.textDim}}>Progress</span>
                        <span style={{fontSize:11,color:C.amber,fontWeight:600}}>{level3Complete?"100%":"65%"}</span>
                      </div>
                      <div style={{height:5,background:"rgba(245,158,11,.12)",borderRadius:3,overflow:"hidden",marginBottom:14}}>
                        <div style={{height:"100%",borderRadius:3,
                          background:`linear-gradient(90deg,${C.amber},${C.amberDeep})`,
                          width:level3Complete?"100%":"65%",transition:"width .8s ease"}}/>
                      </div>
                      {!level3Complete&&!handoffGenerating&&(
                        <button onClick={onGenerateHandoff} style={{width:"100%",padding:"11px 14px",
                          border:"none",borderRadius:12,
                          background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
                          color:C.amberDark,fontSize:13,fontWeight:600,cursor:"pointer",
                          boxShadow:"0 4px 16px rgba(245,158,11,.3)",letterSpacing:"-.1px",
                          display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                          <svg viewBox="0 0 24 24" fill={C.amberDark} width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/></svg>
                          Generate Professional Handoff Package
                        </button>
                      )}
                      {handoffGenerating&&(
                        <div style={{animation:"fadeUp .2s ease"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                            <span style={{fontSize:11.5,color:C.amber,fontWeight:500}}>AI Auditing\u2026</span>
                            <span style={{fontSize:11,color:C.textDim}}>Please wait</span>
                          </div>
                          <div style={{height:5,background:"rgba(245,158,11,.12)",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:3,
                              background:`linear-gradient(90deg,${C.amber},${C.amberDeep})`,
                              animation:"handoffFill 2.4s cubic-bezier(.4,0,.2,1) forwards"}}/>
                          </div>
                        </div>
                      )}
                      {level3Complete&&!handoffGenerating&&(
                        <button onClick={onViewPro} style={{width:"100%",padding:"11px 14px",
                          borderRadius:12,background:"rgba(74,222,128,.1)",
                          border:"1px solid rgba(74,222,128,.3)",
                          color:"#4ade80",fontSize:13,fontWeight:600,cursor:"pointer",
                          display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                          animation:"fadeUp .3s ease"}}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                          Package Ready \u00b7 View Professional Catalogue
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{marginTop:28}}>
          <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,
            textTransform:"uppercase",marginBottom:14}}>Catalogues</div>
          <div style={{padding:"15px 16px",borderRadius:18,marginBottom:12,
            background:level3Complete?"rgba(74,222,128,.05)":"rgba(255,255,255,.04)",
            border:`1px solid ${level3Complete?"rgba(74,222,128,.25)":"rgba(255,255,255,.07)"}`,
            display:"flex",alignItems:"center",gap:13,
            cursor:level3Complete?"pointer":"default",transition:"all .2s"}}
            onClick={level3Complete?onViewPro:undefined}>
            <div style={{width:44,height:44,borderRadius:13,flexShrink:0,
              background:level3Complete?"rgba(74,222,128,.12)":"rgba(255,255,255,.06)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg viewBox="0 0 24 24" fill={level3Complete?"#4ade80":"rgba(255,255,255,.25)"} width="22" height="22">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:level3Complete?"white":"rgba(255,255,255,.35)",letterSpacing:"-.1px"}}>
                Professional Catalogue</div>
              <div style={{fontSize:12,color:level3Complete?"rgba(74,222,128,.7)":C.textDim,marginTop:3}}>
                {level3Complete?"Developers & Designers \u00b7 Unlocked":"Complete Level 3 to unlock"}</div>
            </div>
            {!level3Complete
              ?<svg viewBox="0 0 24 24" fill="rgba(255,255,255,.15)" width="18" height="18"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              :<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" width="18" height="18"><path d="M9 18l6-6-6-6"/></svg>
            }
          </div>
          <div style={{padding:"15px 16px",borderRadius:18,background:"rgba(255,255,255,.03)",
            border:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:13,
            cursor:"pointer",position:"relative",overflow:"hidden"}}
            onClick={onViewInvestor}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(245,158,11,.04),transparent)",
              animation:"shimmerSlide 3s ease-in-out infinite"}}/>
            <div style={{width:44,height:44,borderRadius:13,flexShrink:0,background:"rgba(245,158,11,.1)",
              display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
              <svg viewBox="0 0 24 24" fill={C.amber} width="22" height="22">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <div style={{flex:1,position:"relative",zIndex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                <span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.4)"}}>Investor Catalogue</span>
                <span style={{fontSize:9.5,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",
                  padding:"2px 7px",borderRadius:5,background:"rgba(245,158,11,.15)",color:C.amber}}>Premium</span>
              </div>
              <div style={{fontSize:12,color:C.textDim}}>200+ verified investors \u00b7 $299 fee</div>
            </div>
            <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.2)" width="18" height="18" style={{position:"relative",zIndex:1}}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          </div>
        </div>
      </div>
      {showHandoffModal&&<HandoffModal onView={()=>{onCloseModal();onViewPro();}} onClose={onCloseModal}/>}
    </div>
  );
}

/* PRO CATALOGUE */

function TalentCard({p}){
  const init=p.name.split(" ").map(w=>w[0]).join("");
  return(
    <div style={{padding:"14px",borderRadius:18,background:C.surface,border:`1px solid ${C.border}`,marginBottom:12,animation:"fadeUp .3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
        <div style={{width:44,height:44,borderRadius:13,flexShrink:0,background:p.color+"25",
          border:`1.5px solid ${p.color}40`,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:15,fontWeight:700,color:p.color}}>{init}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:14.5,fontWeight:600,color:"white"}}>{p.name}</span>
            <span style={{fontSize:9.5,padding:"2px 7px",borderRadius:5,fontWeight:600,letterSpacing:".5px",
              background:p.avail?"rgba(74,222,128,.12)":"rgba(255,255,255,.07)",
              color:p.avail?"#4ade80":C.textDim}}>
              {p.avail?"Available":"Busy"}
            </span>
          </div>
          <div style={{fontSize:12.5,color:C.textMuted,marginTop:2}}>{p.role}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12.5,fontWeight:600,color:C.amber}}>\u2605 {p.rating}</div>
          <div style={{fontSize:11,color:C.textDim,marginTop:1}}>{p.projects} projects</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {p.skills.map(s=>(
          <span key={s} style={{fontSize:11.5,padding:"3px 9px",borderRadius:7,
            background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.5)",
            border:"1px solid rgba(255,255,255,.08)"}}>{s}</span>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button style={{flex:1,padding:"9px",border:`1px solid ${C.border}`,borderRadius:10,
          background:"transparent",color:C.textMuted,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>
          Message
        </button>
        <button style={{flex:1.5,padding:"9px",border:"none",borderRadius:10,
          background:p.avail?`linear-gradient(135deg,${C.amber},${C.amberDeep})`:"rgba(255,255,255,.06)",
          color:p.avail?C.amberDark:"rgba(255,255,255,.25)",fontSize:12.5,fontWeight:600,
          cursor:p.avail?"pointer":"default"}}>
          {p.avail?"View Profile \u2192":"Unavailable"}
        </button>
      </div>
    </div>
  );
}

function ProCatalogueScreen({onBack}){
  const [tab,setTab]=useState("dev");
  return(
    <div style={{position:"absolute",inset:0,background:C.bg,display:"flex",flexDirection:"column",
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>
      <ScrHeader title="Professional Catalogue" sub="AI-curated team" onBack={onBack} right={<AILogo size={36}/>}/>
      <div style={{padding:"14px 18px 0",flexShrink:0}}>
        <div style={{padding:"11px 13px",borderRadius:14,background:"rgba(245,158,11,.06)",
          border:"1px solid rgba(245,158,11,.14)",display:"flex",gap:10,marginBottom:12}}>
          <AILogo size={22}/>
          <div style={{fontSize:12.5,color:C.textMuted,lineHeight:1.58}}>
            Based on your MVP blueprint, I've matched you with specialists who've built similar products.
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"4px",background:C.surface,borderRadius:12,border:`1px solid ${C.border}`}}>
          {[["dev","Developers",DEVS.length],["design","Designers",DESIGNERS.length]].map(([t,l,c])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px",border:"none",borderRadius:9,
              background:tab===t?`linear-gradient(135deg,${C.amber},${C.amberDeep})`:"transparent",
              color:tab===t?C.amberDark:C.textMuted,fontSize:13,fontWeight:tab===t?600:500,cursor:"pointer",transition:"all .2s"}}>
              {l} <span style={{opacity:.75,fontSize:11}}>{c}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 18px 30px"}}>
        {(tab==="dev"?DEVS:DESIGNERS).map(p=><TalentCard key={p.name} p={p}/>)}
      </div>
    </div>
  );
}

/* INVESTOR GATE */

function InvestorGateScreen({onBack}){
  const [unlocking,setUnlocking]=useState(false);
  const FEATS=["Access to 200+ vetted investor profiles","Direct pitch deck submission","NDA-protected introductions","Deal facilitation & term sheet support","Dedicated pitch advisor (30 min call)"];
  const INVS=[{t:"Venture Capital",p:"$80M+ portfolio",f:"SaaS \u00b7 FinTech"},{t:"Angel Investor",p:"Series A specialist",f:"Deep Tech \u00b7 AI"},{t:"Impact Fund",p:"Early Stage focus",f:"Climate \u00b7 Social"},{t:"Family Office",p:"$200M AUM",f:"Consumer \u00b7 Retail"}];
  return(
    <div style={{position:"absolute",inset:0,background:C.bg,display:"flex",flexDirection:"column",animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>
      <div style={{padding:"50px 18px 13px",background:"rgba(9,9,15,.94)",backdropFilter:"blur(24px)",
        borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:600,color:"white"}}>The Apex</div>
          <div style={{fontSize:11,color:"rgba(245,158,11,.65)",marginTop:2}}>Investor Catalogue \u00b7 Level 5</div>
        </div>
        <div style={{padding:"5px 10px",borderRadius:8,background:"rgba(245,158,11,.12)",border:"1px solid rgba(245,158,11,.25)"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.amber,letterSpacing:".5px"}}>PREMIUM</span>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 18px 0"}}>
        <div style={{padding:"14px 15px",borderRadius:18,marginBottom:20,background:"rgba(245,158,11,.07)",border:"1.5px solid rgba(245,158,11,.28)"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <AILogo size={26}/>
            <div style={{fontSize:10,color:"rgba(245,158,11,.7)",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase"}}>
              AI Partner Assessment
            </div>
          </div>
          <p style={{fontSize:13.5,color:C.textPrimary,lineHeight:1.65,fontStyle:"italic"}}>
            "Your pitch deck has passed the rigorous audit. Pay the presentation fee to unlock our curated Investor Network."
          </p>
        </div>
        <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,textTransform:"uppercase",marginBottom:13}}>
          Investor Network Preview
        </div>
        <div style={{position:"relative",marginBottom:22}}>
          {INVS.map((inv,i)=>(
            <div key={i} style={{padding:"12px 14px",borderRadius:14,background:C.surface,
              border:`1px solid ${C.border}`,marginBottom:8,filter:"blur(5px)",userSelect:"none",pointerEvents:"none",opacity:.7}}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <div style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,.08)",flexShrink:0}}/>
                <div>
                  <div style={{width:120,height:12,background:"rgba(255,255,255,.2)",borderRadius:6,marginBottom:6}}/>
                  <div style={{fontSize:12,color:C.textMuted}}>{inv.t} \u00b7 {inv.p}</div>
                  <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{inv.f}</div>
                </div>
              </div>
            </div>
          ))}
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(9,9,15,.55)"}}>
            <div style={{textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(245,158,11,.12)",
                border:"1.5px solid rgba(245,158,11,.3)",display:"flex",alignItems:"center",
                justifyContent:"center",margin:"0 auto 8px"}}>
                <svg viewBox="0 0 24 24" fill={C.amber} width="26" height="26"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.6)"}}>200+ Investors Locked</div>
            </div>
          </div>
        </div>
        <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,textTransform:"uppercase",marginBottom:13}}>
          What's Included
        </div>
        <div style={{padding:"14px 15px",borderRadius:16,background:C.surface,border:`1px solid ${C.border}`,marginBottom:22}}>
          {FEATS.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,
              paddingBottom:i<FEATS.length-1?10:0,marginBottom:i<FEATS.length-1?10:0,
              borderBottom:i<FEATS.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(245,158,11,.12)",
                border:"1px solid rgba(245,158,11,.3)",display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0,marginTop:1}}>
                <svg viewBox="0 0 24 24" width="9" height="9" fill={C.amber}><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
              </div>
              <span style={{fontSize:13,color:C.textMuted,lineHeight:1.5}}>{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 18px 32px",borderTop:`1px solid ${C.border}`,flexShrink:0,background:"rgba(9,9,15,.96)",backdropFilter:"blur(24px)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
          <span style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:"white",fontWeight:400}}>$299</span>
          <span style={{fontSize:13,color:C.textDim,marginLeft:8,marginTop:8}}>one-time fee</span>
        </div>
        <button onClick={()=>{setUnlocking(true);setTimeout(()=>setUnlocking(false),2000);}} style={{
          width:"100%",padding:"17px",border:"none",borderRadius:22,
          background:unlocking?"rgba(245,158,11,.4)":`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
          color:C.amberDark,fontSize:15.5,fontWeight:600,cursor:"pointer",
          boxShadow:"0 8px 28px rgba(245,158,11,.38)",letterSpacing:"-.2px",transition:"all .3s"}}>
          {unlocking?"Processing\u2026":"Unlock Investor Access \u2192"}
        </button>
        <div style={{textAlign:"center",marginTop:10,fontSize:12,color:C.textDim}}>
          Secure payment \u00b7 Instant access \u00b7 Money-back guarantee
        </div>
      </div>
    </div>
  );
}

/* SETTINGS SCREEN — profile + tier display + Walk of Shame downgrade */

const SHAME_PHRASE = "I am lowering my standards because the work is too hard";

function SettingsScreen({onBack,onLogout,authProvider,userEmail,tier,onTierChange}){
  const [showWalk,setShowWalk]=useState(false);
  const [walkTxt,setWalkTxt]=useState("");
  const [walkPhase,setWalkPhase]=useState("input"); // input | paying | done
  const [cooldown,setCooldown]=useState(false);

  const prov=PROVIDERS.find(p=>p.id===authProvider);
  const initial=(userEmail||"?")[0].toUpperCase();
  const activeTier=TIERS.find(t=>t.id===tier)||null;
  const canDowngrade=activeTier&&activeTier.id!=="guide";
  // FIX 5: normalize both strings — case-insensitive, strip trailing/stray punctuation
  const normalizedInput=walkTxt.toLowerCase().replace(/[^a-z0-9\s]/g,"").trim();
  const normalizedTarget=SHAME_PHRASE.toLowerCase().replace(/[^a-z0-9\s]/g,"").trim();
  const shameMatches=normalizedInput===normalizedTarget;

  const handleShameConfirm=()=>{
    setCooldown(true);setWalkPhase("done");
    setTimeout(()=>{
      onTierChange("guide");
      setShowWalk(false);setWalkTxt("");setWalkPhase("input");
    },2200);
  };
  const handlePay=()=>{
    setWalkPhase("paying");
    setTimeout(()=>{
      onTierChange("guide");
      setShowWalk(false);setWalkTxt("");setWalkPhase("input");
    },1800);
  };

  const PLAN_ROWS=[
    {label:"AI Chat Sessions",val:"Unlimited",ok:true},
    {label:"Voice Packs",val:"1 included",ok:true},
    {label:"Project Slots",val:"3 / month",ok:true},
    {label:"Handoff Packages",val:"1 / project",ok:true},
    {label:"Investor Catalogue",val:"Premium only",ok:false},
  ];

  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",background:C.bg,
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>

      {/* Scrollable content */}
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
        <ScrHeader title="Account" sub="Settings & Profile" onBack={onBack} right={<AILogo size={36}/>}/>
        <div style={{flex:1,overflowY:"auto",padding:"20px 18px 32px"}}>

          {/* Profile card */}
          <div style={{padding:"20px 18px",borderRadius:22,marginBottom:18,
            background:"linear-gradient(135deg,rgba(245,158,11,.1),rgba(217,119,6,.05))",
            border:"1px solid rgba(245,158,11,.22)",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:58,height:58,borderRadius:17,flexShrink:0,
              background:`linear-gradient(145deg,${C.amber},${C.amberDeep})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:24,fontWeight:700,color:C.amberDark,
              boxShadow:"0 4px 20px rgba(245,158,11,.38)"}}>{initial}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"white",
                fontWeight:400,letterSpacing:"-.2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {userEmail||"Unknown"}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginTop:6}}>
                {prov&&(<div style={{width:22,height:22,borderRadius:7,background:"rgba(255,255,255,.09)",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{prov.icon}</div>)}
                <span style={{fontSize:11.5,color:C.textMuted}}>via {authProvider||"unknown"}</span>
                <div style={{marginLeft:"auto",padding:"2px 8px",borderRadius:6,
                  background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.25)"}}>
                  <span style={{fontSize:9.5,fontWeight:700,color:C.green,letterSpacing:".5px"}}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accountability Tier */}
          {activeTier&&(
            <>
              <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,
                textTransform:"uppercase",marginBottom:12}}>Accountability Tier</div>
              <div style={{padding:"14px 16px",borderRadius:18,marginBottom:10,
                background:`${activeTier.color}0d`,border:`1.5px solid ${activeTier.color}38`,
                display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${activeTier.color}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                  {activeTier.badge}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.5,fontWeight:700,color:"white"}}>{activeTier.name}</div>
                  <div style={{fontSize:12,color:activeTier.color,marginTop:2}}>{activeTier.tagline}</div>
                </div>
                <div style={{padding:"3px 9px",borderRadius:7,background:`${activeTier.color}18`,
                  border:`1px solid ${activeTier.color}40`}}>
                  <span style={{fontSize:9,fontWeight:700,color:activeTier.color,letterSpacing:"1px",
                    textTransform:"uppercase"}}>ACTIVE</span>
                </div>
              </div>
              {canDowngrade?(
                <button onClick={()=>setShowWalk(true)} style={{width:"100%",padding:"12px",
                  borderRadius:14,marginBottom:20,
                  background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.18)",
                  color:"rgba(239,68,68,.75)",fontSize:13,fontWeight:600,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .2s"}}
                  onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,.11)"}
                  onMouseOut={e=>e.currentTarget.style.background="rgba(239,68,68,.06)"}>
                  <svg viewBox="0 0 24 24" fill="rgba(239,68,68,.7)" width="15" height="15">
                    <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  Downgrade Accountability Tier
                </button>
              ):(
                <div style={{padding:"10px 14px",borderRadius:14,marginBottom:20,
                  background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,
                  fontSize:12,color:C.textDim,textAlign:"center"}}>
                  Already on the lowest tier — The Guide
                </div>
              )}
            </>
          )}

          {/* Free plan */}
          <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,
            textTransform:"uppercase",marginBottom:12}}>Account Plan</div>
          <div style={{padding:"15px 16px",borderRadius:18,background:C.surface,
            border:`1px solid ${C.border}`,marginBottom:18}}>
            <div style={{fontSize:16,fontWeight:700,color:"white",marginBottom:4}}>Free Plan</div>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:13}}>3 projects/month \u00b7 Basic voice pack</div>
            {PLAN_ROWS.map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"7px 0",borderTop:i===0?`1px solid ${C.border}`:"none",
                borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:12.5,color:C.textMuted}}>{row.label}</span>
                <span style={{fontSize:12.5,fontWeight:500,
                  color:row.ok?"rgba(255,255,255,.75)":"rgba(245,158,11,.7)"}}>{row.val}</span>
              </div>
            ))}
            <button style={{width:"100%",marginTop:14,padding:"12px",border:"none",borderRadius:14,
              background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
              fontSize:13.5,fontWeight:600,color:C.amberDark,cursor:"pointer",
              boxShadow:"0 4px 16px rgba(245,158,11,.3)"}}>
              Upgrade to Pro \u2736
            </button>
          </div>

          {/* Active project */}
          <div style={{fontSize:10,letterSpacing:"2.5px",color:C.textDim,fontWeight:500,
            textTransform:"uppercase",marginBottom:12}}>Active Project</div>
          <div style={{padding:"14px 16px",borderRadius:18,background:C.surface,
            border:`1px solid ${C.border}`,marginBottom:18,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:"rgba(245,158,11,.1)",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg viewBox="0 0 24 24" fill={C.amber} width="20" height="20">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"white"}}>Productivity Layer</div>
              <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Level 3 Active \u00b7 MVP Blueprint</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:11,color:C.amber,fontWeight:500}}>L3 \u25b8</div>
          </div>

          {/* Sign out */}
          <button onClick={onLogout} style={{width:"100%",padding:"15px",borderRadius:18,
            background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.18)",
            fontSize:15,fontWeight:600,color:"#ef4444",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:9,transition:"background .2s"}}
            onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,.13)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(239,68,68,.07)"}>
            <svg viewBox="0 0 24 24" fill="#ef4444" width="18" height="18">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Walk of Shame modal — absolute sibling, not inside scroll */}
      {showWalk&&(
        <div style={{position:"absolute",inset:0,zIndex:200,
          background:"rgba(0,0,0,.88)",backdropFilter:"blur(14px)",
          display:"flex",alignItems:"flex-end",animation:"overlayIn .25s ease"}}>
          <div style={{width:"100%",background:"#0d0d1a",
            borderRadius:"28px 28px 0 0",padding:"10px 22px 40px",
            border:"1px solid rgba(239,68,68,.2)",borderBottom:"none",
            animation:"slideUp .38s cubic-bezier(.22,1,.36,1)",
            boxShadow:"0 -20px 60px rgba(0,0,0,.75),0 0 0 1px rgba(239,68,68,.08)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.12)",margin:"0 auto 16px"}}/>

            {walkPhase==="done"?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:42,marginBottom:12}}>&#128529;</div>
                <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"white",
                  fontWeight:400,marginBottom:10}}>Downgrade Logged</h3>
                <p style={{fontSize:13,color:C.textMuted,lineHeight:1.6}}>
                  48-hour cooldown has begun. You have been moved to The Guide tier. Use this time to reflect.
                </p>
              </div>
            ):walkPhase==="paying"?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:42,marginBottom:12,animation:"breathePulse 1s ease-in-out infinite"}}>
                  {"\uD83D\uDCB3"}
                </div>
                <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"white",
                  fontWeight:400,marginBottom:10}}>Processing Payment</h3>
                <p style={{fontSize:13,color:C.textMuted}}>Bypassing accountability in 3\u2026 2\u2026 1\u2026</p>
              </div>
            ):(
              <>
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div style={{fontSize:38,marginBottom:10}}>&#128534;</div>
                  <div style={{fontSize:9.5,letterSpacing:"2px",textTransform:"uppercase",
                    color:"rgba(239,68,68,.75)",fontWeight:700,marginBottom:6}}>
                    Walk of Shame
                  </div>
                  <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"white",
                    fontWeight:400,marginBottom:7}}>Downgrade Request</h3>
                  <p style={{fontSize:12.5,color:C.textMuted,lineHeight:1.6}}>
                    You are requesting to lower your accountability from{" "}
                    <span style={{color:activeTier?.color,fontWeight:600}}>{activeTier?.name}</span>{" "}
                    to The Guide. A 48-hour cooldown will be enforced.
                  </p>
                </div>

                <div style={{padding:"11px 14px",borderRadius:13,marginBottom:14,
                  background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)"}}>
                  <div style={{fontSize:11.5,color:"rgba(239,68,68,.8)",fontWeight:600,marginBottom:3}}>
                    Acknowledgement required
                  </div>
                  <div style={{fontSize:12,color:C.textMuted,lineHeight:1.55}}>
                    Type this phrase in full — every word — to proceed with the downgrade:
                  </div>
                </div>

                <div style={{fontSize:12,fontStyle:"italic",color:"rgba(239,68,68,.7)",textAlign:"center",
                  padding:"8px 12px",borderRadius:10,marginBottom:10,
                  background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.12)"}}>
                  "{SHAME_PHRASE}"
                </div>

                <input type="text" value={walkTxt} onChange={e=>setWalkTxt(e.target.value)}
                  placeholder="Type the phrase above..."
                  style={{width:"100%",padding:"12px 14px",borderRadius:12,marginBottom:12,
                    background:"rgba(255,255,255,.06)",outline:"none",color:"white",
                    fontSize:13,fontFamily:"'DM Sans',sans-serif",
                    border:`1.5px solid ${shameMatches?"rgba(239,68,68,.6)":"rgba(255,255,255,.12)"}`,
                    transition:"border-color .2s"}}/>

                <button onClick={shameMatches?handleShameConfirm:undefined} style={{
                  width:"100%",padding:"14px",border:"none",borderRadius:16,marginBottom:10,
                  background:shameMatches?"rgba(239,68,68,.85)":"rgba(255,255,255,.05)",
                  color:shameMatches?"white":"rgba(255,255,255,.2)",
                  fontSize:14,fontWeight:600,cursor:shameMatches?"pointer":"default",
                  transition:"all .2s"}}>
                  {shameMatches
                    ?"Confirm Downgrade \u2014 48h Cooldown Begins"
                    :"Type the phrase to confirm"}
                </button>

                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
                  <span style={{fontSize:11,color:C.textDim}}>or skip the shame</span>
                  <div style={{flex:1,height:1,background:"rgba(255,255,255,.07)"}}/>
                </div>

                <button onClick={handlePay} style={{
                  width:"100%",padding:"14px",border:"none",borderRadius:16,marginBottom:10,
                  background:"rgba(245,158,11,.09)",border:"1px solid rgba(245,158,11,.28)",
                  color:C.amber,fontSize:14,fontWeight:600,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .2s"}}
                  onMouseOver={e=>e.currentTarget.style.background="rgba(245,158,11,.16)"}
                  onMouseOut={e=>e.currentTarget.style.background="rgba(245,158,11,.09)"}>
                  <span style={{fontSize:15}}>{"\uD83D\uDCB3"}</span>
                  $4.99 \u2014 Skip the Shame (Instant Downgrade)
                </button>

                <button onClick={()=>{setShowWalk(false);setWalkTxt("");setWalkPhase("input");}}
                  style={{width:"100%",padding:"11px",border:"none",borderRadius:12,
                    background:"transparent",fontSize:13,color:C.textDim,cursor:"pointer"}}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* PREFLIGHT SCREEN — webcam + checklist + hold-to-confirm */

function PreflightScreen({onBack,onConfirm}){
  const [checks,setChecks]=useState([false,false]);
  const [camReady,setCamReady]=useState(false);
  const [camError,setCamError]=useState(false);
  const [holdProg,setHoldProg]=useState(0);
  const [holding,setHolding]=useState(false);
  const [confirmed,setConfirmed]=useState(false);
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const rafRef=useRef(null);
  const holdStart=useRef(null);

  useEffect(()=>{
    let isMounted=true; // FIX 2: guard against unmount-before-permission-resolve
    if(!navigator.mediaDevices?.getUserMedia){setCamError(true);return;}
    navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false})
      .then(stream=>{
        if(!isMounted){
          // Component already unmounted while prompt was pending — kill the stream immediately
          stream.getTracks().forEach(t=>t.stop());
          return;
        }
        streamRef.current=stream;
        if(videoRef.current){
          videoRef.current.srcObject=stream;
          videoRef.current.play().catch(()=>{});
        }
        setCamReady(true);
      })
      .catch(()=>{if(isMounted)setCamError(true);});
    return()=>{
      isMounted=false; // prevents any late .then() from touching unmounted state
      streamRef.current?.getTracks().forEach(t=>t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  },[]);

  useEffect(()=>{
    if(camReady&&videoRef.current&&streamRef.current){
      videoRef.current.srcObject=streamRef.current;
      videoRef.current.play().catch(()=>{});
    }
  },[camReady]);

  const allChecked=checks.every(Boolean);

  const startHold=()=>{
    if(!allChecked||confirmed)return;
    setHolding(true);
    holdStart.current=Date.now();
    const tick=()=>{
      const prog=Math.min(100,(Date.now()-holdStart.current)/2200*100);
      setHoldProg(prog);
      if(prog<100){
        rafRef.current=requestAnimationFrame(tick);
      } else {
        setConfirmed(true);
        streamRef.current?.getTracks().forEach(t=>t.stop());
        setTimeout(onConfirm,600);
      }
    };
    rafRef.current=requestAnimationFrame(tick);
  };

  const stopHold=()=>{
    if(confirmed)return;
    setHolding(false);
    cancelAnimationFrame(rafRef.current);
    setHoldProg(0);
  };

  const ITEMS=[
    "Close all unnecessary tabs & notifications",
    "Enable Do Not Disturb on all devices",
  ];

  return(
    <div style={{position:"absolute",inset:0,
      background:"linear-gradient(170deg,#03030a 0%,#090912 100%)",
      display:"flex",flexDirection:"column",overflowY:"auto",
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>

      {/* Header */}
      <div style={{padding:"54px 20px 0",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:9,letterSpacing:"3px",textTransform:"uppercase",
            color:"rgba(245,158,11,.55)",fontWeight:700}}>Pre-Flight Protocol</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"white",
            fontWeight:400,letterSpacing:"-.2px",marginTop:3}}>Prepare Your Environment</div>
        </div>
        <div style={{width:36}}/>
      </div>

      {/* Camera feed */}
      <div style={{margin:"18px 20px 0",borderRadius:20,overflow:"hidden",position:"relative",
        background:"#04040c",
        border:`1.5px solid ${camReady?"rgba(245,158,11,.35)":"rgba(255,255,255,.08)"}`,
        aspectRatio:"4/3",flexShrink:0,transition:"border-color .4s"}}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{width:"100%",height:"100%",objectFit:"cover",
            transform:"scaleX(-1)",
            display:camReady&&!camError?"block":"none"}}/>

        {/* Scanning line — visible when cam ready */}
        {camReady&&!camError&&(
          <div style={{position:"absolute",left:0,right:0,height:2,
            background:"linear-gradient(90deg,transparent,rgba(245,158,11,.5),transparent)",
            animation:"scanLine 2.8s linear infinite",pointerEvents:"none"}}/>
        )}

        {/* LIVE badge */}
        {camReady&&!camError&&(
          <div style={{position:"absolute",top:10,left:10,
            padding:"3px 9px",borderRadius:6,
            background:"rgba(4,4,12,.8)",backdropFilter:"blur(8px)",
            fontSize:8.5,fontWeight:700,color:"rgba(245,158,11,.9)",
            letterSpacing:"1.5px",display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green,
              animation:"blinkDot 1.2s ease-in-out infinite"}}/>
            LIVE
          </div>
        )}

        {/* Placeholder */}
        {(!camReady||camError)&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:10}}>
            <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.12)" width="44" height="44">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            <div style={{fontSize:12,color:"rgba(255,255,255,.25)",textAlign:"center",lineHeight:1.5}}>
              {camError?"Camera access denied\nFocus mode active":"Activating camera\u2026"}
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div style={{margin:"18px 20px 0",flexShrink:0}}>
        <div style={{fontSize:9.5,letterSpacing:"2px",textTransform:"uppercase",
          color:C.textDim,fontWeight:600,marginBottom:10}}>Environment Check</div>
        {ITEMS.map((item,i)=>(
          <button key={i}
            onClick={()=>setChecks(prev=>{const n=[...prev];n[i]=!n[i];return n;})}
            style={{width:"100%",display:"flex",alignItems:"center",gap:12,
              padding:"11px 14px",borderRadius:14,marginBottom:8,
              background:checks[i]?"rgba(74,222,128,.07)":C.surface,
              border:`1px solid ${checks[i]?"rgba(74,222,128,.28)":C.border}`,
              cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
            <div style={{width:22,height:22,borderRadius:7,flexShrink:0,
              background:checks[i]?"rgba(74,222,128,.14)":"rgba(255,255,255,.06)",
              border:`1.5px solid ${checks[i]?"rgba(74,222,128,.55)":"rgba(255,255,255,.15)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
              {checks[i]&&(
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#4ade80"
                  strokeWidth="2.5" strokeLinecap="round"
                  style={{animation:"checkPop .3s cubic-bezier(.22,1,.36,1)"}}>
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </div>
            <span style={{fontSize:13.5,color:checks[i]?"rgba(255,255,255,.88)":C.textMuted,
              fontWeight:500}}>
              {i+1}. {item}
            </span>
          </button>
        ))}
      </div>

      {/* Affirmation */}
      <div style={{margin:"14px 20px 0",padding:"14px 18px",borderRadius:16,
        background:"rgba(245,158,11,.06)",border:"1px solid rgba(245,158,11,.15)",flexShrink:0}}>
        <p style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:14,
          color:"rgba(245,158,11,.88)",lineHeight:1.7,textAlign:"center"}}>
          "My environment is clear. I commit the next 90 minutes entirely to my venture."
        </p>
      </div>

      {/* Hold to Confirm button */}
      <div style={{margin:"16px 20px 36px",flexShrink:0}}>
        <div
          onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold}
          onTouchStart={startHold} onTouchEnd={stopHold}
          style={{position:"relative",borderRadius:22,overflow:"hidden",height:58,
            background:confirmed?"rgba(74,222,128,.1)":allChecked?"rgba(245,158,11,.09)":"rgba(255,255,255,.04)",
            border:`1px solid ${confirmed?"rgba(74,222,128,.4)":allChecked?"rgba(245,158,11,.32)":"rgba(255,255,255,.08)"}`,
            cursor:allChecked&&!confirmed?"pointer":"default",
            userSelect:"none",WebkitUserSelect:"none",
            WebkitTouchCallout:"none", // FIX 3: suppress iOS Safari long-press context menu
            transition:"border-color .25s"}}>

          {/* Progress fill */}
          {holdProg>0&&!confirmed&&(
            <div style={{position:"absolute",left:0,top:0,bottom:0,
              width:`${holdProg}%`,
              background:`linear-gradient(90deg,${C.amber},${C.amberDeep})`,
              borderRadius:holdProg<98?"22px 0 0 22px":22,
              transition:"none"}}/>
          )}
          {confirmed&&(
            <div style={{position:"absolute",inset:0,background:"rgba(74,222,128,.15)"}}/>
          )}

          {/* Label */}
          <div style={{position:"absolute",inset:0,display:"flex",
            alignItems:"center",justifyContent:"center",gap:10}}>
            {/* Voice waveform during hold */}
            {holding&&holdProg>0&&!confirmed&&(
              <div style={{display:"flex",gap:2,alignItems:"center"}}>
                {[0,1,2,3,4,5,6].map(i=>(
                  <div key={i} style={{width:3,height:14,borderRadius:2,
                    background:`rgba(20,8,0,.65)`,
                    animation:`waveBar .7s ease-in-out ${i*.08}s infinite`,
                    transformOrigin:"center"}}/>
                ))}
              </div>
            )}
            {!holding&&!confirmed&&(
              <span style={{fontSize:13,zIndex:1}}>{allChecked?"\uD83C\uDFA4":"\uD83D\uDD12"}</span>
            )}
            <span style={{fontSize:13.5,fontWeight:600,zIndex:1,
              color:confirmed?"#4ade80":allChecked?(holdProg>0?C.amberDark:C.amber):"rgba(255,255,255,.25)"}}>
              {confirmed?"\u2713 Confirmed \u2014 Entering Sprint"
                :holdProg>0?`Voice Verifying\u2026 ${Math.round(holdProg)}%`
                :allChecked?"Hold to Confirm (Voice Verified)"
                :"Complete checklist to unlock"}
            </span>
          </div>
        </div>
        {allChecked&&!confirmed&&holdProg===0&&(
          <div style={{textAlign:"center",marginTop:8,fontSize:11,color:C.textDim}}>
            Hold for 2 seconds to lock in your commitment
          </div>
        )}
      </div>
    </div>
  );
}

/* SPRINT BAR — 90-min countdown with warning & demo controls */

function SprintBar({seconds,state,onDemo}){
  const mm=String(Math.floor(seconds/60)).padStart(2,"0");
  const ss=String(seconds%60).padStart(2,"0");

  const bgMap={active:"rgba(255,255,255,.03)",warning:"rgba(245,158,11,.07)",locked:"rgba(239,68,68,.06)"};
  const txtMap={active:C.textDim,warning:C.amber,locked:C.red};
  const lblMap={active:"\uD83E\uDDE0  Ultradian Sprint Active",warning:"\u26A0\uFE0F  5 Min Remaining \u2014 Save Now",locked:"\uD83D\uDD12  Sprint Complete"};

  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px",flexShrink:0,
      background:bgMap[state],
      borderBottom:`1px solid ${state==="warning"?"rgba(245,158,11,.2)":C.border}`,
      animation:state==="warning"?"sprintWarnBg 1.8s ease-in-out infinite":"none"}}>
      <span style={{fontSize:11,fontWeight:600,color:txtMap[state],flex:1,letterSpacing:".1px"}}>
        {lblMap[state]}
      </span>
      <span style={{fontSize:13,fontWeight:700,color:txtMap[state],
        fontFamily:"'Fira Code','Courier New',monospace",letterSpacing:"1px",
        animation:state==="warning"?"breathePulse 1s ease-in-out infinite":"none"}}>
        {mm}:{ss}
      </span>
      {state!=="locked"&&(
        <button onClick={onDemo} style={{
          fontSize:8.5,fontWeight:700,padding:"3px 8px",borderRadius:5,
          background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",
          color:"rgba(255,255,255,.35)",cursor:"pointer",
          letterSpacing:".5px",textTransform:"uppercase",marginLeft:2}}>
          \u26A1 Demo
        </button>
      )}
    </div>
  );
}

/* PHASE 2 — FOUNDER READINESS BAR */

function FounderReadinessBar({score,toast}){
  return(
    <div style={{padding:"6px 16px 7px",flexShrink:0,position:"relative",
      background:"rgba(124,58,237,.06)",
      borderBottom:"1px solid rgba(124,58,237,.14)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:10.5,color:"rgba(167,139,250,.75)",fontWeight:600,
          letterSpacing:".1px",whiteSpace:"nowrap"}}>{"\uD83C\uDFAF"} Readiness</span>
        <div style={{flex:1,height:4,background:"rgba(124,58,237,.14)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:2,
            background:"linear-gradient(90deg,#6d28d9,#a78bfa)",
            width:`${score}%`,transition:"width .8s cubic-bezier(.22,1,.36,1)"}}/>
        </div>
        <span style={{fontSize:10.5,fontWeight:700,color:"#a78bfa",
          minWidth:32,textAlign:"right"}}>{score}%</span>
      </div>
      {toast&&(
        <div style={{position:"absolute",top:-44,right:14,zIndex:50,
          padding:"7px 13px",borderRadius:10,
          background:"linear-gradient(135deg,#6d28d9,#a78bfa)",
          boxShadow:"0 4px 18px rgba(109,40,217,.45)",
          fontSize:11.5,fontWeight:600,color:"white",whiteSpace:"nowrap",
          animation:"toastPop .4s cubic-bezier(.22,1,.36,1)"}}>
          +{toast.amount} Readiness: {toast.skill} {"\u2713"}
        </div>
      )}
    </div>
  );
}

/* PHASE 2 — INJECT VIDEO CARD */

function InjectVideoCard({payload,msgId,videoLockedMsgId,onWatched}){
  const isThisLocked=videoLockedMsgId===msgId;
  const alreadyWatched=!isThisLocked&&videoLockedMsgId!==msgId;
  const [simProgress,setSimProgress]=useState(0);
  const [simPlaying,setSimPlaying]=useState(false);
  const simRef=useRef(null);

  const startSim=()=>{
    if(simPlaying||alreadyWatched)return;
    setSimPlaying(true);
    let p=0;
    simRef.current=setInterval(()=>{
      p+=1.8;
      setSimProgress(Math.min(100,p));
      if(p>=100)clearInterval(simRef.current);
    },80);
  };
  useEffect(()=>()=>clearInterval(simRef.current),[]);

  const watched=alreadyWatched||(simProgress>=100&&!isThisLocked);
  const canUnlock=simProgress>=100&&isThisLocked;

  return(
    <div style={{marginTop:10,borderRadius:16,overflow:"hidden",
      border:`1px solid ${isThisLocked?"rgba(56,189,248,.28)":watched?"rgba(74,222,128,.22)":C.border}`,
      transition:"border-color .3s"}}>
      {/* Fake video area */}
      <div style={{height:136,background:"linear-gradient(135deg,#07071a,#0f0f28)",
        position:"relative",display:"flex",alignItems:"center",justifyContent:"center",
        cursor:simPlaying||watched?"default":"pointer"}}
        onClick={startSim}>
        {/* Scanline overlay */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0px,rgba(0,0,0,.12) 1px,transparent 1px,transparent 2px)"}}/>
        {!simPlaying&&!watched&&(
          <div style={{width:52,height:52,borderRadius:"50%",
            background:"rgba(245,158,11,.18)",border:"2px solid rgba(245,158,11,.55)",
            display:"flex",alignItems:"center",justifyContent:"center",
            animation:"videoPlayPulse 2s ease-in-out infinite"}}>
            <svg viewBox="0 0 24 24" fill={C.amber} width="22" height="22"><path d="M8 5v14l11-7z"/></svg>
          </div>
        )}
        {simPlaying&&!watched&&(
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"rgba(245,158,11,.8)",fontWeight:600,marginBottom:10}}>
              Playing\u2026
            </div>
            <div style={{width:130,height:3,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${simProgress}%`,
                background:`linear-gradient(90deg,${C.amber},${C.amberDeep})`,
                borderRadius:2,transition:"width .1s linear"}}/>
            </div>
            <div style={{fontSize:10,color:C.textDim,marginTop:6}}>{Math.round(simProgress)}%</div>
          </div>
        )}
        {watched&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <svg viewBox="0 0 24 24" fill="#4ade80" width="30" height="30">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <span style={{fontSize:11,color:"#4ade80",fontWeight:600}}>Watched</span>
          </div>
        )}
        <div style={{position:"absolute",bottom:8,right:10,padding:"2px 7px",borderRadius:5,
          background:"rgba(0,0,0,.7)",fontSize:10,color:"rgba(255,255,255,.65)",fontFamily:"monospace"}}>
          {payload.duration}
        </div>
      </div>
      {/* Info */}
      <div style={{padding:"10px 14px",background:"rgba(255,255,255,.03)",
        borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:13.5,fontWeight:600,color:"white",marginBottom:2}}>{payload.title}</div>
        <div style={{fontSize:11.5,color:C.textMuted}}>{payload.subtitle}</div>
      </div>
      {/* Action */}
      <div style={{padding:"10px 14px",background:"rgba(255,255,255,.02)"}}>
        {isThisLocked?(
          <button onClick={canUnlock?()=>onWatched(msgId):startSim} style={{
            width:"100%",padding:"10px",border:"none",borderRadius:11,
            background:canUnlock
              ?"linear-gradient(135deg,#4ade80,#16a34a)"
              :simPlaying
                ?`linear-gradient(135deg,${C.blue},rgba(56,189,248,.7))`
                :`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
            color:canUnlock?"rgba(0,20,0,.9)":"white",
            fontSize:13,fontWeight:600,
            cursor:"pointer",transition:"all .3s",
            display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {canUnlock&&<svg viewBox="0 0 24 24" fill="rgba(0,20,0,.9)" width="14" height="14"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>}
            {canUnlock
              ?"Mark Video as Watched \u2014 Unlock Chat"
              :simPlaying
                ?`Watching\u2026 ${Math.round(simProgress)}%`
                :"\u25b6 Play to unlock chat"}
          </button>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:6,
            fontSize:12,color:"rgba(74,222,128,.8)",fontWeight:500}}>
            <svg viewBox="0 0 24 24" fill="#4ade80" width="14" height="14"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
            Video watched \u2014 chat unlocked
          </div>
        )}
      </div>
    </div>
  );
}

/* PHASE 2 — SHOW DIFF CARD */

function ShowDiffCard({payload}){
  return(
    <div style={{marginTop:10,borderRadius:16,overflow:"hidden",
      border:"1px solid rgba(245,158,11,.2)",animation:"diffIn .4s ease"}}>
      <div style={{padding:"7px 14px",background:"rgba(245,158,11,.08)",
        borderBottom:"1px solid rgba(245,158,11,.14)",
        fontSize:9.5,letterSpacing:"2px",textTransform:"uppercase",
        color:"rgba(245,158,11,.75)",fontWeight:700}}>
        {payload.label||"Pitch Language Translation"}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
        <div style={{padding:"12px 12px",background:"rgba(239,68,68,.05)",
          borderRight:`1px solid ${C.border}`}}>
          <div style={{fontSize:8.5,fontWeight:700,letterSpacing:"1.5px",
            textTransform:"uppercase",color:"rgba(239,68,68,.7)",marginBottom:7}}>
            {"\uD83D\uDE10"} Casual
          </div>
          <p style={{fontSize:11.5,color:"rgba(255,255,255,.5)",lineHeight:1.65}}>
            {payload.casual}
          </p>
        </div>
        <div style={{padding:"12px 12px",background:"rgba(74,222,128,.04)"}}>
          <div style={{fontSize:8.5,fontWeight:700,letterSpacing:"1.5px",
            textTransform:"uppercase",color:"rgba(74,222,128,.75)",marginBottom:7}}>
            {"\uD83C\uDFAF"} Investor-Grade
          </div>
          <p style={{fontSize:11.5,color:C.textPrimary,lineHeight:1.65,fontWeight:500}}>
            {payload.professional}
          </p>
        </div>
      </div>
    </div>
  );
}

/* PHASE 2 — COURSE SCREEN (module-list version) */

function CourseScreen({payload,onComplete,onSkip}){
  const [step,setStep]=useState(0);
  const modules=payload?.modules||(payload?.steps?.map(s=>s.title))||["The Problem","The Framework","The Application"];
  const totalSteps=modules.length;
  const [done,setDone]=useState(false);

  const advance=()=>{
    if(step<totalSteps-1){setStep(prev=>prev+1);}
    else{setDone(true);setTimeout(onComplete,1800);}
  };

  if(done) return(
    <div style={{position:"absolute",inset:0,background:C.bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"40px 24px",animation:"fadeIn .4s ease",zIndex:100}}>
      <div style={{fontSize:58,marginBottom:18}}>{"\uD83C\uDFC6"}</div>
      <div style={{fontSize:10,letterSpacing:"2.5px",textTransform:"uppercase",
        color:C.amber,fontWeight:700,marginBottom:10}}>Course Complete</div>
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:"white",
        fontWeight:400,letterSpacing:"-.3px",textAlign:"center",marginBottom:12}}>
        {payload?.courseTitle||payload?.title||"Founder Fundamentals"}
      </h2>
      <p style={{fontSize:13.5,color:C.textMuted,textAlign:"center",lineHeight:1.7}}>
        Knowledge integrated. Returning you to the Project Director\u2026
      </p>
    </div>
  );

  return(
    <div style={{position:"absolute",inset:0,background:C.bg,display:"flex",
      flexDirection:"column",animation:"slideUp .35s ease",zIndex:100}}>
      <ScrHeader
        title={payload?.courseTitle||payload?.title||"Founder Fundamentals"}
        sub="Mandatory Training"
        onBack={onSkip||(() => {})}
        right={
          <div style={{padding:"4px 8px",background:"rgba(245,158,11,.15)",
            borderRadius:6,color:C.amber,fontSize:11,fontWeight:700}}>
            {step+1} / {totalSteps}
          </div>
        }/>

      <div style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
        <AILogo size={48} strong/>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:"white",
          marginTop:16,marginBottom:8}}>
          {modules[step]}
        </h2>
        <p style={{fontSize:14,color:C.textMuted,lineHeight:1.6,marginBottom:32}}>
          {payload?.steps?.[step]?.description||
            "You cannot proceed to the Project Hub until you master these fundamentals. I have generated a custom curriculum based on your knowledge gaps."}
        </p>

        {/* Module list */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {modules.map((mod,i)=>(
            <div key={i} style={{padding:"16px",borderRadius:16,
              background:i===step?"rgba(245,158,11,.08)":i<step?"rgba(74,222,128,.05)":C.surface,
              border:`1px solid ${i===step?C.amber:i<step?"rgba(74,222,128,.2)":C.border}`,
              display:"flex",alignItems:"center",gap:14,transition:"all .3s"}}>
              <div style={{width:32,height:32,borderRadius:10,flexShrink:0,
                background:i===step?C.amber:i<step?"#4ade80":"rgba(255,255,255,.05)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:i>step?C.textMuted:C.bg,fontWeight:700,fontSize:14}}>
                {i<step?"\u2713":i+1}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,
                  color:i<=step?"white":C.textMuted}}>{mod}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:4}}>
                  {i===step?"In Progress":i<step?"Mastered":"Locked"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{padding:"20px",borderTop:`1px solid ${C.border}`,
        background:"rgba(9,9,15,.95)",backdropFilter:"blur(24px)"}}>
        <button onClick={advance} style={{
          width:"100%",padding:"16px",borderRadius:18,border:"none",
          background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
          color:C.amberDark,fontSize:15,fontWeight:600,cursor:"pointer",
          boxShadow:"0 8px 24px rgba(245,158,11,.3)",letterSpacing:"-.1px"}}>
          {step<totalSteps-1?"Complete Module \u2192":"Finish Course & Return to Chat"}
        </button>
      </div>
    </div>
  );
}
/* HOME SCREEN — GAPS 6 & dynamic hub teaser FIXED */

function HomeScreen({onNewProject,onAnalyze,onHub,onSettings,level3Complete,userEmail}){
  const initial=(userEmail||"A")[0].toUpperCase();
  return(
    <div style={{position:"absolute",inset:0,
      background:`linear-gradient(175deg,${C.bg} 0%,#0f0f1c 55%,#0a1520 100%)`,
      display:"flex",flexDirection:"column",padding:"0 24px",
      animation:"slideInLeft .35s cubic-bezier(.22,1,.36,1)"}}>
      <div style={{position:"absolute",top:100,right:-50,width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,.11) 0%,transparent 70%)",filter:"blur(35px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:200,left:-70,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,.06) 0%,transparent 70%)",filter:"blur(45px)",pointerEvents:"none"}}/>

      {/* GAP 6 FIXED: User avatar / settings button */}
      <button onClick={onSettings} style={{
        position:"absolute",top:52,right:24,zIndex:10,
        width:36,height:36,borderRadius:11,
        background:C.surface,border:`1px solid ${C.border}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",transition:"background .15s"}}
        onMouseOver={e=>e.currentTarget.style.background=C.surfaceHover}
        onMouseOut={e=>e.currentTarget.style.background=C.surface}>
        <div style={{width:26,height:26,borderRadius:8,
          background:`linear-gradient(145deg,${C.amber},${C.amberDeep})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,fontWeight:700,color:C.amberDark}}>
          {initial}
        </div>
      </button>

      <div style={{marginTop:76,position:"relative",zIndex:1}}>
        <div style={{width:58,height:58,borderRadius:17,background:`linear-gradient(145deg,${C.amber},${C.amberDeep})`,
          display:"flex",alignItems:"center",justifyContent:"center",marginBottom:26,
          boxShadow:"0 6px 28px rgba(245,158,11,.38),0 0 0 1px rgba(245,158,11,.18)",
          animation:"glowPulse 3s ease-in-out infinite"}}>
          <svg viewBox="0 0 24 24" fill={C.amberDark} width="30" height="30">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 11a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2z"/>
          </svg>
        </div>
        <div style={{fontSize:10.5,letterSpacing:"3.5px",textTransform:"uppercase",color:"rgba(245,158,11,.6)",fontWeight:500,marginBottom:11}}>
          Proactive AI Partner
        </div>
        <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:38,fontWeight:400,lineHeight:1.11,
          letterSpacing:"-.5px",color:"white",marginBottom:14}}>
          Ideas become<br/><span style={{color:C.amber,fontStyle:"italic"}}>ventures.</span>
        </h1>
        <p style={{fontSize:14,color:C.textMuted,lineHeight:1.68,maxWidth:275}}>
          Your proactive AI guides you from first spark to refined strategy.
        </p>
      </div>
      <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.065),transparent)",margin:"26px 0 22px"}}/>
      <div style={{display:"flex",flexDirection:"column",gap:11,zIndex:1}}>
        <button onClick={onNewProject} style={{width:"100%",border:"none",cursor:"pointer",padding:0,
          background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,borderRadius:22,
          boxShadow:"0 8px 28px rgba(245,158,11,.38)",transition:"transform .18s,box-shadow .18s"}}
          onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 36px rgba(245,158,11,.5)";}}
          onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 28px rgba(245,158,11,.38)";}}>
          <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:15.5,fontWeight:600,color:C.amberDark,letterSpacing:"-.2px"}}>Start a New Project</div>
              <div style={{fontSize:11.5,color:"rgba(20,8,0,.5)",marginTop:3}}>Begin from a fresh idea</div>
            </div>
            <div style={{width:36,height:36,borderRadius:11,background:"rgba(0,0,0,.16)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.amberDark} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
          </div>
        </button>
        <button onClick={onAnalyze} style={{width:"100%",border:`1px solid ${C.border}`,cursor:"pointer",
          background:C.surface,borderRadius:22,backdropFilter:"blur(16px)",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 20px",transition:"transform .18s,background .18s"}}
          onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.background=C.surfaceHover;}}
          onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.background=C.surface;}}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:15.5,fontWeight:600,color:"white",letterSpacing:"-.2px"}}>Analyze My Data</div>
            <div style={{fontSize:11.5,color:C.textDim,marginTop:3}}>Upload &amp; review your notes</div>
          </div>
          <div style={{width:36,height:36,borderRadius:11,background:"rgba(56,189,248,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg viewBox="0 0 24 24" fill={C.blue} width="18" height="18"><path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14z"/></svg>
          </div>
        </button>
      </div>

      {/* Dynamic Hub teaser */}
      <button onClick={onHub} style={{marginTop:"auto",marginBottom:28,zIndex:1,
        width:"100%",padding:"13px 16px",borderRadius:16,
        background:level3Complete?"rgba(74,222,128,.04)":"rgba(255,255,255,.03)",
        border:`1px solid ${level3Complete?"rgba(74,222,128,.2)":C.border}`,
        display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"background .2s"}}
        onMouseOver={e=>e.currentTarget.style.background=level3Complete?"rgba(74,222,128,.07)":"rgba(255,255,255,.055)"}
        onMouseOut={e=>e.currentTarget.style.background=level3Complete?"rgba(74,222,128,.04)":"rgba(255,255,255,.03)"}>
        <div style={{width:34,height:34,borderRadius:10,
          background:level3Complete?"rgba(74,222,128,.12)":"rgba(245,158,11,.1)",
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg viewBox="0 0 24 24" fill={level3Complete?"#4ade80":"rgba(245,158,11,.7)"} width="17" height="17">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
          </svg>
        </div>
        <div style={{flex:1,textAlign:"left"}}>
          {level3Complete?(
            <>
              <div style={{fontSize:13.5,fontWeight:600,color:"#4ade80"}}>
                \u2713 Level 3 Complete
              </div>
              <div style={{fontSize:11,color:"rgba(74,222,128,.6)",marginTop:2}}>
                Handoff package ready \u00b7 View Catalogue
              </div>
            </>
          ):(
            <>
              <div style={{fontSize:13.5,fontWeight:600,color:"rgba(255,255,255,.65)"}}>Project Hub</div>
              <div style={{fontSize:11,color:C.textDim,marginTop:2}}>Level 3 active \u00b7 65% complete</div>
            </>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:48,height:4,background:"rgba(255,255,255,.08)",borderRadius:2}}>
            <div style={{height:"100%",width:level3Complete?"100%":"65%",
              background:level3Complete?C.green:C.amber,borderRadius:2,transition:"width .6s ease"}}/>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </button>
    </div>
  );
}

/* APP */

export default function App(){
  const [screen,setScreen]=useState("auth");
  const [authProvider,setAuthProvider]=useState(null);
  const [userEmail,setUserEmail]=useState("");
  const [accountabilityTier,setAccountabilityTier]=useState(null);
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [isAnalyzing,setIsAnalyzing]=useState(false);
  const [isTyping,setIsTyping]=useState(false);
  const [isRecording,setIsRecording]=useState(false);
  const [showChips,setShowChips]=useState(false);
  const [level3Complete,setLevel3Complete]=useState(false);
  const [handoffGenerating,setHandoffGenerating]=useState(false);
  const [showHandoffModal,setShowHandoffModal]=useState(false);
  const [showDb,setShowDb]=useState(false);
  // PHASE 2 — Founder Readiness & JSON Director
  const [readinessScore,setReadinessScore]=useState(0);
  const [readinessToast,setReadinessToast]=useState(null);
  const [videoLockedMsgId,setVideoLockedMsgId]=useState(null);
  const [coursePayload,setCoursePayload]=useState(null);
  // PHASE 2 — Founder Readiness + video lock + course
  const [readinessScore,setReadinessScore]=useState(0);
  const [readinessToast,setReadinessToast]=useState(null);
  const [videoLockedMsgId,setVideoLockedMsgId]=useState(null);
  const [coursePayload,setCoursePayload]=useState(null);
  // PHASE 2 — JSON state machine
  const [readinessScore,setReadinessScore]=useState(0);
  const [readinessToast,setReadinessToast]=useState(null);
  const [videoLockedMsgId,setVideoLockedMsgId]=useState(null);
  const [coursePayload,setCoursePayload]=useState(null);
  // PHASE 2 — JSON state machine
  const [readinessScore,setReadinessScore]=useState(0);
  const [readinessToast,setReadinessToast]=useState(null);
  const [videoLockedMsgId,setVideoLockedMsgId]=useState(null);
  const [coursePayload,setCoursePayload]=useState(null);
  // PHASE 2 — JSON state machine state
  const [readinessScore,setReadinessScore]=useState(0);
  const [readinessToast,setReadinessToast]=useState(null);
  const [videoLockedMsgId,setVideoLockedMsgId]=useState(null);
  const [coursePayload,setCoursePayload]=useState(null);
  // PHASE 2 — Proactive AI Director state
  const [readinessScore,setReadinessScore]=useState(0);
  const [readinessToast,setReadinessToast]=useState(null);
  const [videoLockedMsgId,setVideoLockedMsgId]=useState(null);
  const [coursePayload,setCoursePayload]=useState(null);
  // PHASE 2 — parse structured JSON response and drive UI
  const processJsonResponse=(json)=>{
    if(json.uiAction==="start_course"){
      const msgId=crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random());
      setMessages(p=>[...p,{id:msgId,type:"ai",text:json.replyText}]);
      setCoursePayload(json.actionPayload);
      setTimeout(()=>setScreen("course"),1300);
      return;
    }
    const msgId=crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random());
    setMessages(p=>[...p,{
      id:msgId,type:"ai",
      text:json.replyText,
      uiAction:json.uiAction||"none",
      actionPayload:json.actionPayload||{},
      isPraise:!!json._isPraise,
      learnedSkill:json.learnedSkill,
    }]);
    if(json.uiAction==="inject_video")setVideoLockedMsgId(msgId);
    if((json.readinessScoreIncrease||0)>0){
      setReadinessScore(prev=>Math.min(100,prev+(json.readinessScoreIncrease||0)));
      if(json.learnedSkill){
        setReadinessToast({skill:json.learnedSkill,amount:json.readinessScoreIncrease});
        setTimeout(()=>setReadinessToast(null),3500);
      }
    }
  };

  const handleWatchedVideo=(msgId)=>{
    if(videoLockedMsgId===msgId)setVideoLockedMsgId(null);
  };

  const handleCourseComplete=()=>{
    setReadinessScore(prev=>Math.min(100,prev+20));
    setReadinessToast({skill:coursePayload?.title||"Founder Fundamentals",amount:20});
    setTimeout(()=>setReadinessToast(null),4000);
    setScreen("chat");
    setTimeout(()=>setMessages(p=>[...p,{
      id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),
      type:"ai",
      text:"Excellent execution. Course complete.\n\nYour cognitive architecture has been updated. Continue building your venture with this foundation in place.",
    }]),400);
  };
  const [sprintSeconds,setSprintSeconds]=useState(5400);
  const [sprintState,setSprintState]=useState("active"); // active | warning | locked
  const sprintRef=useRef(null);
  const warningRef=useRef(false);
  const typingTimeoutRef=useRef(null); // FIX 1: prevents ghost messages after Back
  const msgEnd=useRef(null);

  useEffect(()=>{msgEnd.current?.scrollIntoView({behavior:"smooth"});},[messages,isTyping,isAnalyzing]);

  // PHASE 2 — JSON response processor (replaces slot machine as the single output handler)
  const processJsonResponse=(json)=>{
    if(json.uiAction==="start_course"){
      // Show transition message then navigate to course
      const tid=crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random());
      setMessages(p=>[...p,{id:tid,type:"ai",text:json.replyText}]);
      setCoursePayload(json.actionPayload);
      setTimeout(()=>setScreen("course"),1300);
      return;
    }
    const msgId=crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random());
    setMessages(p=>[...p,{
      id:msgId,type:"ai",
      text:json.replyText,
      uiAction:json.uiAction||"none",
      actionPayload:json.actionPayload||{},
      isPraise:!!json._isPraise,
    }]);
    if(json.uiAction==="inject_video")setVideoLockedMsgId(msgId);
    if((json.readinessScoreIncrease||0)>0){
      setReadinessScore(prev=>Math.min(100,prev+(json.readinessScoreIncrease||0)));
      if(json.learnedSkill){
        setReadinessToast({skill:json.learnedSkill,amount:json.readinessScoreIncrease});
        setTimeout(()=>setReadinessToast(null),3500);
      }
    }
  };

  // PHASE 2 — unlock chat after video watched
  const handleWatchedVideo=(msgId)=>{
    if(videoLockedMsgId===msgId)setVideoLockedMsgId(null);
    // Award readiness for completing the video module
    const msg=messages.find(m=>m.id===msgId);
    if(msg?.learnedSkill){
      setReadinessScore(prev=>Math.min(100,prev+5));
      setReadinessToast({skill:msg.learnedSkill,amount:5});
      setTimeout(()=>setReadinessToast(null),3500);
    }
  };
  useEffect(()=>{
    if(screen!=="chat"||sprintState==="locked"){
      clearInterval(sprintRef.current);
      return;
    }
    sprintRef.current=setInterval(()=>{
      setSprintSeconds(prev=>{
        if(prev<=0){clearInterval(sprintRef.current);setSprintState("locked");return 0;}
        // Trigger 5-min warning at exactly 300 seconds remaining
        if(prev===301&&!warningRef.current){
          warningRef.current=true;
          setSprintState("warning");
          setMessages(m=>[...m,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"ai",
            text:"Warning: Acetylcholine dropping. You are entering a biological trough. Save your work. Sprint ends in 5 minutes.",
            isWarning:true}]);
        }
        return prev-1;
      });
    },1000);
    return()=>clearInterval(sprintRef.current);
  },[screen,sprintState]);

  const handleAuth=(id)=>{
    const emails={google:"alex.ventures@gmail.com",apple:"alex@icloud.com",meta:"alex.ventures@meta.com"};
    setAuthProvider(id);setUserEmail(emails[id]);setScreen("onboarding");
  };

  // GAP 5 FIXED: logout resets all state back to auth
  const handleLogout=()=>{
    setScreen("auth");setAuthProvider(null);setUserEmail("");setAccountabilityTier(null);
    setMessages([]);setInput("");setIsAnalyzing(false);setIsTyping(false);
    setIsRecording(false);setShowChips(false);setLevel3Complete(false);
    setHandoffGenerating(false);setShowHandoffModal(false);setShowDb(false);
    // Phase 2 reset
    setReadinessScore(0);setReadinessToast(null);
    setVideoLockedMsgId(null);setCoursePayload(null);
  };

  const handleNewProject=()=>{
    // Reset sprint for fresh session
    clearInterval(sprintRef.current);
    setSprintSeconds(5400);setSprintState("active");warningRef.current=false;
    setMessages([]);setShowChips(false);setIsAnalyzing(false);
    setScreen("preflight");
  };

  // Called when PreflightScreen hold-confirm completes
  const handlePreflightConfirm=()=>{
    setScreen("chat");
    setTimeout(()=>setMessages([{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"ai",
      text:"Great, it seems like you have an idea already. Can you tell me more about it?"}]),300);
  };

  // Demo fast-forward: active → warning → locked
  const handleDemoFastForward=()=>{
    clearInterval(sprintRef.current);
    if(sprintState==="active"){
      warningRef.current=true;
      setSprintSeconds(300);
      setSprintState("warning");
      setMessages(m=>[...m,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"ai",
        text:"Warning: Acetylcholine dropping. You are entering a biological trough. Save your work. Sprint ends in 5 minutes.",
        isWarning:true}]);
    } else if(sprintState==="warning"){
      setSprintSeconds(0);
      setSprintState("locked");
    }
  };

  const handleAnalyze=()=>{
    setMessages([]);setShowChips(false);setIsAnalyzing(true);setScreen("analysis");
    setTimeout(()=>{
      setIsAnalyzing(false);
      setMessages([{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"ai",
        text:"I found 3 realistic ideas from your chat history.\n\nIdea 1 passes the Physics Check but already exists in the market.\n\nIdea 2 is highly unique \u2014 let's map it out.",
        hasChips:true}]);
      setShowChips(true);
    },2600);
  };

  // PHASE 2 — JSON-driven handleSend: routes input to structured LLM response simulation
  const handleSend=()=>{
    if(!input.trim()||sprintState==="locked"||videoLockedMsgId)return;
    const raw=input.trim();
    const norm=raw.toLowerCase();
    setInput("");
    setMessages(p=>[...p,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"user",text:raw}]);
    setIsTyping(true);

    // Route to simulated structured JSON response
    let json;
    if(norm.includes("don't know what cac is")||norm.includes("what is cac")||norm==="cac")
      json={...SIMULATED_RESPONSES.cac};
    else if(norm.includes("want to make a pitch")||norm.includes("make a pitch")||norm.includes("write a pitch"))
      json={...SIMULATED_RESPONSES.pitch};
    else if(norm.includes("don't know how supply chains work")||norm.includes("supply chain"))
      json={...SIMULATED_RESPONSES.supplyChain};
    else if(norm.includes("teach me everything")||norm==="teach me")
      json={...SIMULATED_RESPONSES.course};
    else{
      // Fallback: JSON-wrapped slot machine (80% clinical / 20% praise)
      const isPraise=Math.random()<0.2;
      const pool=isPraise?PRAISE:CLINICAL;
      json={
        replyText:pool[Math.floor(Math.random()*pool.length)],
        uiAction:"none",actionPayload:{},
        readinessScoreIncrease:isPraise?3:0,
        learnedSkill:null,_isPraise:isPraise,
      };
    }

    const delay=900+Math.random()*500;
    typingTimeoutRef.current=setTimeout(()=>{
      setIsTyping(false);
      processJsonResponse(json);
    },delay);
  };

  // GAP 1 FIXED: Hub CTA after "Tell me about Idea 2"
  const handleChip=(label)=>{
    setShowChips(false);
    setMessages(p=>[...p,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"user",text:label}]);
    setIsTyping(true);
    const text=label==="Tell me about Idea 2"
      ?"Idea 2 is a context-aware productivity layer that sits on top of existing project tools. It uniquely bridges communication gaps between async teams \u2014 no direct competitor takes this approach.\n\nWant me to start building the Blueprint?"
      :"All 3 ideas:\n\n1. Smart inventory for local restaurants \u2014 solid demand but Shopify and Toast already dominate.\n\n2. Context-aware async team productivity layer \u2014 highly unique, real pain point.\n\n3. AI micro-freelance matching \u2014 crowded market (Fiverr, Toptal).\n\nIdea 2 is your strongest bet.";
    typingTimeoutRef.current=setTimeout(()=>{
      setIsTyping(false);
      setMessages(p=>[...p,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"ai",text}]);
      if(label==="Tell me about Idea 2"){
        typingTimeoutRef.current=setTimeout(()=>{
          setIsTyping(true);
          typingTimeoutRef.current=setTimeout(()=>{
            setIsTyping(false);
            setMessages(p=>[...p,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"ai",
              text:"Strong signal \u2014 this idea addresses a real gap in the market.\n\nReady to take this to your 5-Level Project Blueprint?",
              hasHubBtn:true}]);
          },1200);
        },700);
      }
    },1450);
  };

  const handleRecord=()=>{
    if(isRecording){setIsRecording(false);setTimeout(()=>setInput("I want to build a productivity layer for async teams that keeps context without endless meetings."),400);}
    else setIsRecording(true);
  };

  const handleBack=()=>{
    clearInterval(sprintRef.current);
    clearTimeout(typingTimeoutRef.current);
    setSprintSeconds(5400);setSprintState("active");warningRef.current=false;
    setScreen("home");setMessages([]);setIsAnalyzing(false);setIsTyping(false);
    setIsRecording(false);setInput("");setShowChips(false);
    setVideoLockedMsgId(null);
  };

  // PHASE 2 — parse simulated JSON and drive all UI state
  const processJsonResponse=(json)=>{
    if(json.uiAction==="start_course"){
      const tid=crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random());
      setMessages(p=>[...p,{id:tid,type:"ai",text:json.replyText}]);
      setCoursePayload(json.actionPayload);
      setTimeout(()=>setScreen("course"),1300);
      return;
    }
    const msgId=crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random());
    setMessages(p=>[...p,{
      id:msgId,type:"ai",
      text:json.replyText,
      uiAction:json.uiAction||"none",
      actionPayload:json.actionPayload||{},
      isPraise:!!json._isPraise,
      learnedSkill:json.learnedSkill,
    }]);
    if(json.uiAction==="inject_video")setVideoLockedMsgId(msgId);
    if(json.readinessScoreIncrease>0){
      setReadinessScore(prev=>Math.min(100,prev+json.readinessScoreIncrease));
      if(json.learnedSkill){
        setReadinessToast({skill:json.learnedSkill,amount:json.readinessScoreIncrease});
        setTimeout(()=>setReadinessToast(null),3600);
      }
    }
  };

  const handleWatchedVideo=(msgId)=>{
    if(videoLockedMsgId===msgId)setVideoLockedMsgId(null);
  };

  const handleCourseComplete=()=>{
    setScreen("chat");
    setReadinessScore(prev=>Math.min(100,prev+20));
    setReadinessToast({skill:coursePayload?.title||"Founder Fundamentals",amount:20});
    setTimeout(()=>setReadinessToast(null),3600);
    setTimeout(()=>setMessages(p=>[...p,{
      id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),
      type:"ai",
      text:"Excellent execution. You have completed the course.\n\nYour cognitive architecture has been updated. Continue building with this new foundation in place.",
    }]),400);
  };

  // PHASE 2 — JSON-driven router (replaces slot machine for named intents)
  const handleSend=()=>{
    if(!input.trim()||sprintState==="locked"||videoLockedMsgId)return;
    const raw=input.trim();
    const norm=raw.toLowerCase();
    setInput("");
    setMessages(p=>[...p,{id:crypto.randomUUID?crypto.randomUUID():(Date.now()+Math.random()),type:"user",text:raw}]);
    setIsTyping(true);

    let json;
    if(norm.includes("don't know what cac is")||norm.includes("what is cac")||norm==="cac")
      json={...SIMULATED_RESPONSES.cac};
    else if(norm.includes("want to make a pitch")||norm.includes("make a pitch"))
      json={...SIMULATED_RESPONSES.pitch};
    else if(norm.includes("don't know how supply chains work")||norm.includes("supply chain"))
      json={...SIMULATED_RESPONSES.supplyChain};
    else if(norm.includes("teach me everything"))
      json={...SIMULATED_RESPONSES.course};
    else{
      // Fallback: JSON-wrapped slot machine
      const isPraise=Math.random()<0.2;
      const pool=isPraise?PRAISE:CLINICAL;
      json={
        replyText:pool[Math.floor(Math.random()*pool.length)],
        uiAction:"none",actionPayload:{},
        readinessScoreIncrease:isPraise?3:0,
        learnedSkill:null,_isPraise:isPraise,
      };
    }
    typingTimeoutRef.current=setTimeout(()=>{
      setIsTyping(false);
      processJsonResponse(json);
    },900+Math.random()*500);
  };

  const handleGenerateHandoff=()=>{
    setHandoffGenerating(true);
    setTimeout(()=>{setHandoffGenerating(false);setLevel3Complete(true);setShowHandoffModal(true);},2600);
  };

  const inChat=screen==="chat"||screen==="analysis";

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"radial-gradient(ellipse at 35% 25%,#1a1028 0%,#08080e 55%,#06101a 100%)",
      padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{CSS}</style>

      <div style={{display:"flex",alignItems:"stretch"}}>
        <div style={{width:390,height:844,borderRadius:50,overflow:"hidden",position:"relative",flexShrink:0,
          boxShadow:"0 0 0 1px rgba(255,255,255,.07),0 40px 90px rgba(0,0,0,.88),0 0 60px rgba(245,158,11,.03)",
          background:C.bg}}>
          <StatusBar/>

          {screen==="auth"&&<AuthScreen onAuth={handleAuth}/>}
          {screen==="onboarding"&&<OnboardingScreen provider={authProvider} onComplete={(tier)=>{setAccountabilityTier(tier);setScreen("home");}}/>}
          {screen==="home"&&(
            <HomeScreen
              onNewProject={handleNewProject}
              onAnalyze={()=>setScreen("upload")}
              onHub={()=>setScreen("hub")}
              onSettings={()=>setScreen("settings")}
              level3Complete={level3Complete}
              userEmail={userEmail}/>
          )}
          {screen==="upload"&&<UploadScreen onBack={()=>setScreen("home")} onAnalyze={handleAnalyze}/>}

          {/* PREFLIGHT SCREEN */}
          {screen==="preflight"&&(
            <PreflightScreen onBack={()=>setScreen("home")} onConfirm={handlePreflightConfirm}/>
          )}

          {inChat&&(
            <div style={{position:"absolute",inset:0,background:C.bgChat,
              display:"flex",flexDirection:"column",
              animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)"}}>

              {/* Pulsing amber border overlay when in warning state */}
              {sprintState==="warning"&&(
                <div style={{position:"absolute",inset:0,zIndex:30,pointerEvents:"none",
                  animation:"warningGlow 1.6s ease-in-out infinite",borderRadius:0}}/>
              )}

              <ChatHeader title={screen==="analysis"?"Data Analysis":"New Project"} onBack={handleBack}/>

              {/* Sprint bar + Readiness bar — only for new project chat */}
              {screen==="chat"&&(
                <>
                  <SprintBar seconds={sprintSeconds} state={sprintState} onDemo={handleDemoFastForward}/>
                  <FounderReadinessBar score={readinessScore} toast={readinessToast}/>
                </>
              )}

              <div style={{flex:1,overflowY:"auto",padding:"18px 14px",
                display:"flex",flexDirection:"column",gap:10,position:"relative",
                filter:sprintState==="locked"?"blur(5px)":"none",
                transition:"filter .4s",
                pointerEvents:sprintState==="locked"?"none":"auto"}}>
                {isAnalyzing&&<WaveAnim label="Processing uploaded files\u2026"/>}
                {messages.map(msg=>(
                  <MsgBubble key={msg.id} msg={msg} showChips={showChips}
                    onSelectChip={handleChip} onGoToHub={()=>setScreen("hub")}
                    videoLockedMsgId={videoLockedMsgId}
                    onWatched={handleWatchedVideo}/>
                ))}
                {isTyping&&<TypingInd/>}
                <div ref={msgEnd}/>
              </div>

              {/* LOCKOUT OVERLAY */}
              {sprintState==="locked"&&(
                <div style={{position:"absolute",inset:0,zIndex:40,
                  background:"rgba(9,9,15,.88)",backdropFilter:"blur(4px)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  padding:"0 22px",animation:"overlayIn .35s ease"}}>
                  <div style={{width:"100%",background:"#0d0d1c",borderRadius:26,
                    padding:"32px 24px 28px",
                    border:"1px solid rgba(239,68,68,.22)",
                    boxShadow:"0 0 50px rgba(239,68,68,.08)",
                    animation:"lockoutIn .5s cubic-bezier(.22,1,.36,1)",textAlign:"center"}}>
                    <div style={{fontSize:52,marginBottom:14,
                      animation:"breathePulse 2s ease-in-out infinite"}}>
                      {"\uD83D\uDD12"}
                    </div>
                    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26,
                      fontWeight:400,color:"white",letterSpacing:"-.3px",marginBottom:12}}>
                      Sprint Complete
                    </h2>
                    <p style={{fontSize:13.5,color:C.textMuted,lineHeight:1.72,marginBottom:22}}>
                      You are locked out for 20 minutes to replenish neurochemicals.
                      <br/><br/>
                      Walk away from the screen.
                    </p>
                    <div style={{padding:"14px 18px",borderRadius:16,marginBottom:22,
                      background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.18)"}}>
                      <div style={{fontSize:9.5,fontWeight:700,letterSpacing:"2px",
                        textTransform:"uppercase",color:"rgba(239,68,68,.65)",marginBottom:8}}>
                        Neurochemical Cooldown
                      </div>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:36,
                        color:"#ef4444",fontWeight:400,letterSpacing:"2px",
                        animation:"breathePulse 2s ease-in-out infinite"}}>
                        20:00
                      </div>
                      <div style={{fontSize:11,color:C.textDim,marginTop:6}}>
                        Acetylcholine &amp; dopamine replenishment window
                      </div>
                    </div>
                    <p style={{fontSize:11.5,color:C.textDim,lineHeight:1.6,marginBottom:20}}>
                      This lockout is enforced by your Accountability Engine. Return after 20 minutes for optimal cognitive performance.
                    </p>
                    <button onClick={()=>{
                      clearInterval(sprintRef.current);
                      setSprintSeconds(5400);setSprintState("active");warningRef.current=false;
                      setScreen("home");setMessages([]);setInput("");
                    }} style={{width:"100%",padding:"13px",border:"none",borderRadius:14,
                      background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
                      color:"rgba(255,255,255,.5)",fontSize:13,fontWeight:500,cursor:"pointer"}}>
                      \u21A9 Exit Sprint \u2014 Return to Hub
                    </button>
                  </div>
                </div>
              )}

              {/* VIDEO INTERCEPT OVERLAY — locks chat above input bar */}
              {messages.some(m=>m.uiAction==="inject_video"&&!m.actionPayload?.watched)&&(
                <div style={{margin:"0 14px 14px",padding:"18px",borderRadius:20,
                  background:"rgba(9,9,15,.95)",border:`1px solid ${C.amber}`,
                  boxShadow:"0 0 30px rgba(245,158,11,.15)",animation:"slideUp .3s ease",
                  position:"relative",zIndex:20}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
                    <div style={{width:44,height:44,borderRadius:12,
                      background:"rgba(245,158,11,.15)",display:"flex",
                      alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:20}}>{"\uD83D\uDCFA"}</span>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.amber,fontWeight:700,
                        textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>
                        Mandatory Intervention
                      </div>
                      <div style={{fontSize:14,fontWeight:600,color:"white",lineHeight:1.4}}>
                        {messages.find(m=>m.uiAction==="inject_video"&&!m.actionPayload?.watched)
                          ?.actionPayload?.title||"Required Knowledge Module"}
                      </div>
                    </div>
                  </div>
                  <div style={{width:"100%",aspectRatio:"16/9",background:"#05050a",
                    borderRadius:12,border:`1px solid ${C.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    marginBottom:14,cursor:"pointer"}}>
                    <div style={{width:48,height:48,borderRadius:"50%",
                      background:"rgba(255,255,255,.1)",display:"flex",
                      alignItems:"center",justifyContent:"center",transition:"transform .2s"}}>
                      <svg viewBox="0 0 24 24" fill="white" width="20" height="20"
                        style={{marginLeft:4}}>
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <button onClick={()=>{
                    setMessages(prev=>prev.map(m=>
                      m.uiAction==="inject_video"
                        ?{...m,actionPayload:{...m.actionPayload,watched:true}}
                        :m
                    ));
                    setVideoLockedMsgId(null);
                    setReadinessScore(prev=>Math.min(100,prev+5));
                  }} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
                    background:`linear-gradient(135deg,${C.amber},${C.amberDeep})`,
                    color:C.amberDark,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                    I have finished the video. Unlock Chat.
                  </button>
                </div>
              )}

              <InputBar value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSend()} onSend={handleSend}
                isRecording={isRecording} onToggleRecord={handleRecord}
                disabled={sprintState==="locked"||messages.some(m=>m.uiAction==="inject_video"&&!m.actionPayload?.watched)}/>
            </div>
          )}

          {screen==="hub"&&(
            <ProjectHubScreen
              onBack={()=>setScreen("home")}
              level3Complete={level3Complete}
              handoffGenerating={handoffGenerating}
              showHandoffModal={showHandoffModal}
              onGenerateHandoff={handleGenerateHandoff}
              onCloseModal={()=>setShowHandoffModal(false)}
              onViewPro={()=>{setShowHandoffModal(false);setScreen("pro-catalogue");}}
              onViewInvestor={()=>setScreen("investor-gate")}/>
          )}
          {screen==="pro-catalogue"&&<ProCatalogueScreen onBack={()=>setScreen("hub")}/>}
          {screen==="investor-gate"&&<InvestorGateScreen onBack={()=>setScreen("hub")}/>}
          {screen==="settings"&&(
            <SettingsScreen
              onBack={()=>setScreen("home")}
              onLogout={handleLogout}
              authProvider={authProvider}
              userEmail={userEmail}
              tier={accountabilityTier}
              onTierChange={t=>setAccountabilityTier(t)}/>
          )}

          {/* PHASE 2 — Course Screen */}
          {screen==="course"&&(
            <CourseScreen
              payload={coursePayload}
              onComplete={handleCourseComplete}
              onSkip={()=>setScreen("chat")}/>
          )}
        </div>

        {/* GAP 7 FIXED: DB panel tab label updated to "VIEW DB" */}
        <div style={{width:showDb?308:44,height:844,
          transition:"width .35s cubic-bezier(.22,1,.36,1)",
          overflow:"hidden",flexShrink:0}}>
          {showDb?(
            <DatabasePanel
              screen={screen} level3Complete={level3Complete}
              authProvider={authProvider} userEmail={userEmail}
              onClose={()=>setShowDb(false)}/>
          ):(
            <button onClick={()=>setShowDb(true)}
              title="View System Architecture"
              style={{
                width:44,height:"100%",
                background:"#0a0a14",
                border:"1px solid rgba(245,158,11,.18)",borderLeft:"none",
                borderRadius:"0 14px 14px 0",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:6,
                color:"rgba(245,158,11,.6)",transition:"background .2s"}}
              onMouseOver={e=>e.currentTarget.style.background="#0f0f1c"}
              onMouseOut={e=>e.currentTarget.style.background="#0a0a14"}>
              <span style={{fontSize:16}}>&#128736;&#65039;</span>
              <span style={{fontSize:7,fontWeight:700,letterSpacing:"2px",
                textTransform:"uppercase",writingMode:"vertical-rl",
                transform:"rotate(180deg)",color:"rgba(245,158,11,.5)",
                lineHeight:1.2}}>
                VIEW DB
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
