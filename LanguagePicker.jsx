/**
 * src/components/LanguagePicker.jsx
 * ─────────────────────────────────────────────────────────────
 * A full-screen language selection panel used in:
 *  1. Onboarding (before tier selection) — first impression
 *  2. Settings screen — can change anytime
 *
 * Displays all 12 supported languages with flag, native name,
 * and English name. Tapping fires onSelect(code).
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { SUPPORTED_LANGUAGES, t } from "@/lib/i18n";

const C = {
  bg:"#09090f", surface:"rgba(255,255,255,.055)",
  border:"rgba(255,255,255,.08)", amber:"#f59e0b",
  textMuted:"rgba(255,255,255,.42)", textDim:"rgba(255,255,255,.22)",
};

export default function LanguagePicker({ currentLang = "en", onSelect, onBack }) {
  const [search, setSearch] = useState("");

  const filtered = SUPPORTED_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position:"absolute", inset:0, background:C.bg,
      display:"flex", flexDirection:"column",
      animation:"slideInRight .32s cubic-bezier(.22,1,.36,1)",
      fontFamily:"'DM Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ padding:"50px 18px 14px", borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
        background:"rgba(9,9,15,.94)", backdropFilter:"blur(24px)" }}>
        {onBack && (
          <button onClick={onBack} style={{ width:36, height:36, borderRadius:11,
            background:"rgba(255,255,255,.05)", border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color:"rgba(255,255,255,.55)", flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" width="17" height="17">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:600, color:"white" }}>
            {t("language", currentLang)}
          </div>
          <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>
            {SUPPORTED_LANGUAGES.length} languages supported
          </div>
        </div>
        {/* Active language badge */}
        <div style={{ padding:"4px 10px", borderRadius:8,
          background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.25)" }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.amber }}>
            {SUPPORTED_LANGUAGES.find(l=>l.code===currentLang)?.flag}{" "}
            {SUPPORTED_LANGUAGES.find(l=>l.code===currentLang)?.code.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:"12px 18px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8,
          background:"rgba(255,255,255,.04)", border:`1px solid ${C.border}`,
          borderRadius:14, padding:"8px 14px" }}>
          <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.3)" width="16" height="16">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search language…"
            style={{ flex:1, background:"transparent", border:"none", outline:"none",
              color:"white", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}/>
        </div>
      </div>

      {/* Language list */}
      <div style={{ flex:1, overflowY:"auto", padding:"10px 18px 32px" }}>

        {/* RTL note */}
        <div style={{ padding:"10px 12px", borderRadius:12, marginBottom:10,
          background:"rgba(245,158,11,.04)", border:"1px solid rgba(245,158,11,.12)",
          fontSize:11.5, color:C.textMuted, lineHeight:1.55 }}>
          🌍 The AI Director will respond in your chosen language.
          Right-to-left languages (Arabic) auto-switch layout direction.
        </div>

        {filtered.map((lang, i) => {
          const active = lang.code === currentLang;
          return (
            <button key={lang.code} onClick={() => onSelect(lang.code)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:14,
                padding:"13px 14px", borderRadius:16, marginBottom:8, border:"none",
                background: active ? "rgba(245,158,11,.08)" : "rgba(255,255,255,.03)",
                outline: active ? "1.5px solid rgba(245,158,11,.35)" : "1px solid rgba(255,255,255,.06)",
                cursor:"pointer", textAlign:"left", transition:"all .18s",
                animation:`fadeUp .3s ease ${i*.03}s both`,
                fontFamily:"'DM Sans',sans-serif" }}
              onMouseOver={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,.06)")}
              onMouseOut={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,.03)")}>

              {/* Flag */}
              <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
                background: active ? "rgba(245,158,11,.12)" : "rgba(255,255,255,.06)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                {lang.flag}
              </div>

              {/* Names */}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14.5, fontWeight: active ? 700 : 500,
                  color: active ? "white" : "rgba(255,255,255,.7)" }}>
                  {lang.nativeName}
                </div>
                <div style={{ fontSize:11.5, color:C.textDim, marginTop:2 }}>
                  {lang.name}{lang.dir === "rtl" ? " · RTL" : ""}
                </div>
              </div>

              {/* Active check */}
              {active ? (
                <div style={{ width:22, height:22, borderRadius:"50%",
                  background:"rgba(245,158,11,.12)", border:"1.5px solid rgba(245,158,11,.55)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
                    stroke={C.amber} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              ) : (
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.15)" width="16" height="16">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"32px 0", color:C.textDim, fontSize:13 }}>
            No languages match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
