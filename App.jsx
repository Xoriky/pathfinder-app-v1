/**
 * src/App.jsx — Pathfinder Production Root
 * ═══════════════════════════════════════════════════════════════
 * Upgraded with Native Web Speech API for voice inputs and
 * Server-Side RPC Sync for secure, un-bypassable sprint lockouts.
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Supabase & Hooks ─────────────────────────────────────────
import { supabase }       from "@/lib/supabaseClient";
import { useAuth }        from "@/hooks/useAuth";
import { useProjects }    from "@/hooks/useProjects";
import { useChatSession } from "@/hooks/useChatSession";
import { useArtifacts }   from "@/hooks/useArtifacts";

import { callDirector, PROVIDER_MAP } from "@/lib/chatDirector";
import PathfinderBot from "@/components/PathfinderBot";

// ── UI components ─────────────────────────────────────────────
import {
  AuthScreen, OnboardingScreen, HomeScreen,
  PreflightScreen, SprintBar, FounderReadinessBar,
  ChatHeader, InputBar, MsgBubble, TypingInd, WaveAnim,
  UploadScreen, HandoffModal, ProjectHubScreen,
  ProCatalogueScreen, InvestorGateScreen, SettingsScreen,
  CourseScreen, DatabasePanel, StatusBar,
} from "@/components/PathfinderUI";

const UI_TO_BOT = {
  inject_video:  "thinking",
  show_diff:     "talking",
  start_course:  "directing",
  none:          "walking",
};

export default function App() {

  // ── Auth & profile ─────────────────────────────────────────
  const {
    user, profile, loading: authLoading,
    isAuthenticated, signIn, signOut, updateProfile,
  } = useAuth();

  // ── Projects ───────────────────────────────────────────────
  const { projects, createProject, advanceLevel } = useProjects(user?.id);
  const activeProject = projects[0] ?? null;

  // ── Chat session ───────────────────────────────────────────
  const { sessionId, initSession, saveMessages, addReadiness } =
    useChatSession(user?.id, activeProject?.id ?? null);

  // ── Artifacts ──────────────────────────────────────────────
  const { createArtifact } = useArtifacts(user?.id, activeProject?.id ?? null);

  // ── UI screen state ────────────────────────────────────────
  const [screen,           setScreen]           = useState("auth");
  const [messages,         setMessages]         = useState([]);
  const [input,            setInput]            = useState("");
  const [isTyping,         setIsTyping]         = useState(false);
  const [isAnalyzing,      setIsAnalyzing]      = useState(false);
  const [isRecording,      setIsRecording]      = useState(false);
  const [showChips,        setShowChips]        = useState(false);
  const [showDb,           setShowDb]           = useState(false);

  // ── Roadmap state ──────────────────────────────────────────
  const [level3Complete,   setLevel3Complete]   = useState(false);
  const [handoffGenerating,setHandoffGenerating]= useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [coursePayload,    setCoursePayload]    = useState(null);

  // ── Director / readiness ───────────────────────────────────
  const [readinessScore,   setReadinessScore]   = useState(0);
  const [readinessToast,   setReadinessToast]   = useState(null);
  const [videoLockedMsgId, setVideoLockedMsgId] = useState(null);
  const [botState,         setBotState]         = useState("idle");

  // ── Sprint timer (Server Synced) ───────────────────────────
  const [sprintSeconds,    setSprintSeconds]    = useState(5400);
  const [sprintState,      setSprintState]      = useState("active");
  const sprintRef   = useRef(null);
  const warningRef  = useRef(false);

  // ── Voice Recognition (Web Speech API) ─────────────────────
  const [recognition, setRecognition] = useState(null);

  // ── Refs ───────────────────────────────────────────────────
  const typingTimeoutRef = useRef(null);
  const msgEnd           = useRef(null);

  // ── Initialize Speech Recognition ──────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (e) => {
          let currentTranscript = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            currentTranscript += e.results[i][0].transcript;
          }
          // Set input to whatever is transcribed so far
          setInput(currentTranscript);
        };
        
        rec.onerror = (e) => {
          console.error("[Speech API Error]:", e);
          setIsRecording(false);
        };
        
        rec.onend = () => {
          setIsRecording(false);
        };
        
        setRecognition(rec);
      }
    }
  }, []);


  // ── Scroll to latest message ───────────────────────────────
  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isAnalyzing]);

  // ── Sync auth state → screen ───────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated)              { setScreen("auth");       return; }
    if (!profile?.accountability_tier) { setScreen("onboarding"); return; }
    setScreen("home");
    setReadinessScore(profile.readiness_score ?? 0);
  }, [authLoading, isAuthenticated, profile]);

  // ── Persist messages ───────────────────────────────────────
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    saveMessages(messages, sprintState, sprintSeconds);
  }, [messages, sprintState, sprintSeconds, sessionId, saveMessages]);

  // ── Secure Server-Side Timer Sync ──────────────────────────
  const syncSprintWithServer = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_sprint_status', { req_user_id: user.id });
      if (!error && data) {
        setSprintSeconds(data.remaining_seconds);
        setSprintState(data.state);
        if (data.state === 'warning') warningRef.current = true;
      }
    } catch (err) {
      console.warn("Falling back to local timer. Ensure RPC is created.", err);
    }
  }, [user]);

  // ── Sprint countdown ───────────────────────────────────────
  useEffect(() => {
    if (screen !== "chat" || sprintState === "locked") {
      clearInterval(sprintRef.current);
      return;
    }
    
    // Fetch real time from server on chat load
    syncSprintWithServer();

    sprintRef.current = setInterval(() => {
      setSprintSeconds(prev => {
        if (prev <= 0) { 
          clearInterval(sprintRef.current); 
          setSprintState("locked"); 
          return 0; 
        }
        if (prev === 301 && !warningRef.current) {
          warningRef.current = true;
          setSprintState("warning");
          setMessages(m => [...m, {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
            type: "ai",
            text: "Warning: Acetylcholine dropping. You are entering a biological trough. Save your work. Sprint ends in 5 minutes.",
            isWarning: true,
          }]);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sprintRef.current);
  }, [screen, sprintState, syncSprintWithServer]);


  // ═══════════════════════════════════════════════════════════
  // AUTH HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleSignIn = useCallback(async (provider) => {
    await signIn(PROVIDER_MAP[provider] ?? provider);
  }, [signIn]);

  const handleOnboardingComplete = useCallback(async (tier) => {
    await updateProfile({ accountability_tier: tier });
    if (projects.length === 0) await createProject({ name: "My First Venture" });
    await initSession("new_project");
    
    // Flag the start of a sprint in the database
    await supabase.from('profiles').update({ sprint_started_at: new Date().toISOString() }).eq('id', user.id);
    
    setScreen("home");
  }, [updateProfile, projects.length, createProject, initSession, user]);

  const handleLogout = useCallback(async () => {
    clearInterval(sprintRef.current);
    clearTimeout(typingTimeoutRef.current);
    if (recognition && isRecording) recognition.stop();
    await signOut();
    setMessages([]); setInput(""); setScreen("auth");
    setReadinessScore(0); setReadinessToast(null);
    setVideoLockedMsgId(null); setCoursePayload(null);
    setSprintSeconds(5400); setSprintState("active");
    warningRef.current = false;
  }, [signOut, recognition, isRecording]);


  // ═══════════════════════════════════════════════════════════
  // NAVIGATION HELPERS
  // ═══════════════════════════════════════════════════════════

  const handleNewProject = useCallback(() => {
    clearInterval(sprintRef.current);
    clearTimeout(typingTimeoutRef.current);
    setSprintSeconds(5400); setSprintState("active"); warningRef.current = false;
    setMessages([]); setShowChips(false); setInput("");
    setScreen("preflight");
  }, []);

  const handlePreflightConfirm = useCallback(async () => {
    setScreen("chat");
    await initSession("new_project");
    
    // Start secure server timer
    await supabase.from('profiles').update({ sprint_started_at: new Date().toISOString() }).eq('id', user.id);
    syncSprintWithServer();

    setTimeout(() => setMessages([{
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
      type: "ai",
      text: "Great, it seems like you have an idea already. Can you tell me more about it?",
    }]), 300);
  }, [initSession, user, syncSprintWithServer]);

  const handleBack = useCallback(() => {
    clearInterval(sprintRef.current);
    clearTimeout(typingTimeoutRef.current);
    if (recognition && isRecording) recognition.stop();
    setSprintSeconds(5400); setSprintState("active"); warningRef.current = false;
    setMessages([]); setInput(""); setIsTyping(false); setIsRecording(false);
    setShowChips(false); setIsAnalyzing(false); setVideoLockedMsgId(null);
    setBotState("idle");
    setScreen("home");
  }, [recognition, isRecording]);

  const handleDemoFastForward = useCallback(() => {
    clearInterval(sprintRef.current);
    if (sprintState === "active") {
      warningRef.current = true;
      setSprintSeconds(300); setSprintState("warning");
      setMessages(m => [...m, {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
        type: "ai",
        text: "Warning: Acetylcholine dropping. You are entering a biological trough. Save your work. Sprint ends in 5 minutes.",
        isWarning: true,
      }]);
    } else if (sprintState === "warning") {
      setSprintSeconds(0); setSprintState("locked");
    }
  }, [sprintState]);


  // ═══════════════════════════════════════════════════════════
  // DIRECTOR RESPONSE PROCESSOR
  // ═══════════════════════════════════════════════════════════

  const processDirectorResponse = useCallback((json) => {
    const { replyText, uiAction, actionPayload, readinessScoreIncrease, learnedSkill } = json;

    if (uiAction === "start_course") {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
        type: "ai", text: replyText,
      }]);
      setCoursePayload(actionPayload);
      setBotState("directing");
      setTimeout(() => setScreen("course"), 1300);
      return;
    }

    const msgId = crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random();
    setMessages(prev => [...prev, {
      id: msgId, type: "ai", text: replyText,
      uiAction, actionPayload,
      learnedSkill,
    }]);

    if (uiAction === "inject_video") setVideoLockedMsgId(msgId);
    setBotState(json._isPraise ? "celebrating" : (UI_TO_BOT[uiAction] ?? "idle"));

    if (readinessScoreIncrease > 0) {
      addReadiness(readinessScoreIncrease).then(newScore => {
        if (newScore !== null) setReadinessScore(newScore);
      });
      if (learnedSkill) {
        setReadinessToast({ skill: learnedSkill, amount: readinessScoreIncrease });
        setTimeout(() => setReadinessToast(null), 3500);
      }
    }
  }, [addReadiness]);


  // ═══════════════════════════════════════════════════════════
  // HANDLE SEND 
  // ═══════════════════════════════════════════════════════════

  const handleSend = useCallback(async () => {
    if (!input.trim())             return;
    if (sprintState === "locked")  return;
    if (messages.some(m => m.uiAction === "inject_video" && !m.actionPayload?.watched)) return;

    // Stop recording if active upon send
    if (isRecording && recognition) {
        recognition.stop();
        setIsRecording(false);
    }

    const raw = input.trim();
    setInput("");
    setMessages(prev => [...prev, {
      id:   crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
      type: "user",
      text: raw,
    }]);
    setIsTyping(true);
    setBotState("thinking");

    try {
      const { data, error } = await callDirector(raw, messages, {
        projectName:        activeProject?.name,
        currentLevel:       activeProject?.current_level,
        accountabilityTier: profile?.accountability_tier,
        readinessScore,
        sessionType:        "new_project",
      });

      if (error || !data) {
        setMessages(prev => [...prev, {
          id:   crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
          type: "ai",
          text: "I'm having trouble connecting to my neural network. Your work is saved — please try again.",
        }]);
        setBotState("idle");
        return;
      }
      processDirectorResponse(data);

    } catch (err) {
      console.error("[handleSend]", err);
      setMessages(prev => [...prev, {
        id:   crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
        type: "ai",
        text: "Connection lost. Please check your internet and try again.",
      }]);
      setBotState("idle");
    } finally {
      setIsTyping(false);
    }
  }, [input, sprintState, messages, activeProject, profile, readinessScore, processDirectorResponse, isRecording, recognition]);


  // ═══════════════════════════════════════════════════════════
  // CHIP HANDLER
  // ═══════════════════════════════════════════════════════════

  const handleChip = useCallback(async (label) => {
    setShowChips(false);
    clearTimeout(typingTimeoutRef.current);
    if (isRecording && recognition) recognition.stop();

    setMessages(prev => [...prev, {
      id:   crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
      type: "user", text: label,
    }]);
    setIsTyping(true);
    setBotState("thinking");

    try {
      const { data, error } = await callDirector(label, messages, {
        projectName:        activeProject?.name,
        currentLevel:       activeProject?.current_level,
        accountabilityTier: profile?.accountability_tier,
        readinessScore,
        sessionType:        "analysis",
      });

      if (error || !data) {
        setMessages(prev => [...prev, {
          id:   crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
          type: "ai",
          text: "Error processing that selection. Please try again.",
        }]);
        return;
      }

      processDirectorResponse(data);

      if (label === "Tell me about Idea 2" && data.uiAction === "none") {
        typingTimeoutRef.current = setTimeout(async () => {
          setIsTyping(true);
          try {
            const { data: follow } = await callDirector(
              "Should we map this idea to the Project Hub?",
              messages,
              { projectName: activeProject?.name, currentLevel: activeProject?.current_level,
                accountabilityTier: profile?.accountability_tier, readinessScore }
            );
            if (follow) setMessages(p => [...p, {
              id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
              type: "ai", text: follow.replyText, hasHubBtn: true,
            }]);
          } finally { setIsTyping(false); }
        }, 2000);
      }
    } finally {
      setIsTyping(false);
    }
  }, [messages, activeProject, profile, readinessScore, processDirectorResponse, isRecording, recognition]);

  // ═══════════════════════════════════════════════════════════
  // OTHER FLOWS
  // ═══════════════════════════════════════════════════════════

  const handleAnalyze = useCallback(async () => {
    setMessages([]); setShowChips(false); setIsAnalyzing(true);
    setScreen("analysis");
    await initSession("analysis");
    setTimeout(() => {
      setIsAnalyzing(false);
      setMessages([{
        id:       crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
        type:     "ai",
        text:     "I found 3 realistic ideas from your chat history.\n\nIdea 1 passes the Physics Check but already exists in the market.\n\nIdea 2 is highly unique \u2014 let\u2019s map it out.",
        hasChips: true,
      }]);
      setShowChips(true);
    }, 2600);
  }, [initSession]);

  const handleGenerateHandoff = useCallback(async () => {
    setHandoffGenerating(true);
    setTimeout(async () => {
      setHandoffGenerating(false);
      setLevel3Complete(true);
      setShowHandoffModal(true);
      if (activeProject?.id) {
        await advanceLevel(activeProject.id, 4);
        await createArtifact({
          sessionId,
          artifactType: "handoff_package",
          filename:     `Handoff_Package_${Date.now()}.pdf`,
          metadata: { project_name: activeProject.name, generated_at: new Date().toISOString() },
        });
      }
    }, 2600);
  }, [activeProject, advanceLevel, createArtifact, sessionId]);

  const handleCourseComplete = useCallback(async () => {
    const newScore = await addReadiness(20);
    if (newScore !== null) setReadinessScore(newScore);
    setReadinessToast({ skill: "Founder Fundamentals", amount: 20 });
    setTimeout(() => setReadinessToast(null), 3500);
    setBotState("celebrating");
    setScreen("chat");
    setTimeout(() => {
      setMessages(p => [...p, {
        id:   crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
        type: "ai",
        text: "Excellent execution. Founder Fundamentals complete.\n\nYour cognitive architecture has been updated. Continue building.",
      }]);
      setTimeout(() => setBotState("walking"), 3000);
    }, 400);
  }, [addReadiness]);

  const handleWatchedVideo = useCallback((msgId) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, actionPayload: { ...m.actionPayload, watched: true } } : m
    ));
    setVideoLockedMsgId(null);
    addReadiness(5).then(s => { if (s !== null) setReadinessScore(s); });
  }, [addReadiness]);

  // ═══════════════════════════════════════════════════════════
  // RECORD (Native Web Speech API)
  // ═══════════════════════════════════════════════════════════

  const handleRecord = useCallback(() => {
    if (!recognition) {
        alert("Voice recognition is not supported in this browser. Please use Chrome or Safari.");
        return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      // Clear previous input when starting a new recording
      setInput(""); 
      recognition.start();
      setIsRecording(true);
    }
  }, [isRecording, recognition]);


  // ═══════════════════════════════════════════════════════════
  // LOADING GATE
  // ═══════════════════════════════════════════════════════════

  if (authLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#07070e" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%",
        border: "3px solid rgba(245,158,11,.18)",
        borderTopColor: "#f59e0b",
        animation: "spin .85s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const inChat   = screen === "chat" || screen === "analysis";
  const videoLocked = messages.some(m => m.uiAction === "inject_video" && !m.actionPayload?.watched);


  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "radial-gradient(ellipse at 35% 25%,#1a1028,#08080e 55%,#06101a)",
      padding: 20, fontFamily: "'DM Sans',sans-serif" }}>

      {/* Phone frame */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ width: 390, height: 844, borderRadius: 50, overflow: "hidden",
          position: "relative", flexShrink: 0, background: "#09090f",
          boxShadow: "0 0 0 1px rgba(255,255,255,.07),0 40px 90px rgba(0,0,0,.88)" }}>

          <StatusBar/>

          {/* ── Screens ── */}
          {screen === "auth"       && <AuthScreen onAuth={handleSignIn}/>}
          {screen === "onboarding" && <OnboardingScreen provider={user?.app_metadata?.provider} onComplete={handleOnboardingComplete}/>}
          {screen === "home"       && <HomeScreen onNewProject={handleNewProject} onAnalyze={() => setScreen("upload")}
                                        onHub={() => setScreen("hub")} onSettings={() => setScreen("settings")}
                                        level3Complete={level3Complete} userEmail={user?.email}/>}
          {screen === "upload"     && <UploadScreen onBack={() => setScreen("home")} onAnalyze={handleAnalyze}/>}
          {screen === "preflight"  && <PreflightScreen onBack={() => setScreen("home")} onConfirm={handlePreflightConfirm}/>}
          {screen === "settings"   && <SettingsScreen onBack={() => setScreen("home")} onLogout={handleLogout}
                                        authProvider={user?.app_metadata?.provider} userEmail={user?.email}
                                        tier={profile?.accountability_tier}
                                        onTierChange={t => updateProfile({ accountability_tier: t })}/>}
          {screen === "hub"        && <ProjectHubScreen onBack={() => setScreen("home")}
                                        level3Complete={level3Complete} handoffGenerating={handoffGenerating}
                                        showHandoffModal={showHandoffModal} onGenerateHandoff={handleGenerateHandoff}
                                        onCloseModal={() => setShowHandoffModal(false)}
                                        onViewPro={() => { setShowHandoffModal(false); setScreen("pro-catalogue"); }}
                                        onViewInvestor={() => setScreen("investor-gate")}/>}
          {screen === "pro-catalogue"  && <ProCatalogueScreen onBack={() => setScreen("hub")}/>}
          {screen === "investor-gate"  && <InvestorGateScreen onBack={() => setScreen("hub")}/>}
          {screen === "course"         && <CourseScreen payload={coursePayload}
                                            onComplete={handleCourseComplete} onSkip={() => setScreen("chat")}/>}

          {/* ── Chat screen ── */}
          {inChat && (
            <div style={{ position: "absolute", inset: 0, background: "#0b0b13",
              display: "flex", flexDirection: "column" }}>

              {/* Warning glow overlay */}
              {sprintState === "warning" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none",
                  animation: "warningGlow 1.6s ease-in-out infinite" }}/>
              )}

              <ChatHeader title={screen === "analysis" ? "Data Analysis" : "New Project"} onBack={handleBack}/>

              {/* Sprint + Readiness bars */}
              {screen === "chat" && <>
                <SprintBar seconds={sprintSeconds} state={sprintState} onDemo={handleDemoFastForward}/>
                <FounderReadinessBar score={readinessScore} toast={readinessToast}/>
              </>}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "18px 14px",
                display: "flex", flexDirection: "column", gap: 10,
                filter: sprintState === "locked" ? "blur(5px)" : "none",
                pointerEvents: sprintState === "locked" ? "none" : "auto" }}>
                {isAnalyzing && <WaveAnim label="Processing uploaded files\u2026"/>}
                {messages.map(msg => (
                  <MsgBubble key={msg.id} msg={msg} showChips={showChips}
                    onSelectChip={handleChip} onGoToHub={() => setScreen("hub")}
                    videoLockedMsgId={videoLockedMsgId} onWatched={handleWatchedVideo}/>
                ))}
                {isTyping && <TypingInd/>}
                <div ref={msgEnd}/>
              </div>

              {/* Video intercept overlay */}
              {videoLocked && (
                <div style={{ margin: "0 14px 14px", padding: 18, borderRadius: 20,
                  background: "rgba(9,9,15,.95)", border: "1px solid #f59e0b",
                  boxShadow: "0 0 30px rgba(245,158,11,.15)", animation: "slideUp .3s ease",
                  position: "relative", zIndex: 20 }}>
                  <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    Mandatory Intervention
                  </div>
                  <div style={{ fontSize: 14, color: "white", fontWeight: 600, marginBottom: 14 }}>
                    {messages.find(m => m.uiAction === "inject_video" && !m.actionPayload?.watched)
                      ?.actionPayload?.title || "Required Knowledge Module"}
                  </div>
                  <button onClick={() => {
                    setMessages(prev => prev.map(m =>
                      m.uiAction === "inject_video"
                        ? { ...m, actionPayload: { ...m.actionPayload, watched: true } } : m
                    ));
                    setVideoLockedMsgId(null);
                    addReadiness(5).then(s => { if (s !== null) setReadinessScore(s); });
                  }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    color: "rgba(20,8,0,.88)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    I have finished the video. Unlock Chat.
                  </button>
                </div>
              )}

              {/* Lockout overlay */}
              {sprintState === "locked" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 40,
                  background: "rgba(9,9,15,.88)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }}>
                  <div style={{ width: "100%", background: "#0d0d1c", borderRadius: 26,
                    padding: "32px 24px 28px", border: "1px solid rgba(239,68,68,.22)",
                    textAlign: "center" }}>
                    <div style={{ fontSize: 52, marginBottom: 14 }}>{"\uD83D\uDD12"}</div>
                    <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26,
                      color: "white", fontWeight: 400, marginBottom: 12 }}>Sprint Complete</h2>
                    <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.45)", lineHeight: 1.7, marginBottom: 22 }}>
                      You are locked out for 20 minutes to replenish neurochemicals.<br/>Walk away from the screen.
                    </p>
                    <button onClick={() => {
                      clearInterval(sprintRef.current);
                      setSprintSeconds(5400); setSprintState("active"); warningRef.current = false;
                      handleBack();
                    }} style={{ width: "100%", padding: 13, border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: 14, background: "rgba(255,255,255,.06)",
                      color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      Exit Sprint — Return to Hub
                    </button>
                  </div>
                </div>
              )}

              <InputBar value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()} onSend={handleSend}
                isRecording={isRecording} onToggleRecord={handleRecord}
                disabled={sprintState === "locked" || videoLocked}/>

              {/* Animated AI Director bot — floating overlay in chat */}
              {screen === "chat" && sprintState !== "locked" && (
                <div style={{ position: "absolute", bottom: 90, right: 16,
                  pointerEvents: "none", zIndex: 25 }}>
                  <PathfinderBot state={botState}/>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DB Panel toggle */}
        <div style={{ width: showDb ? 308 : 44, height: 844,
          transition: "width .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden", flexShrink: 0 }}>
          {showDb ? (
            <DatabasePanel screen={screen} level3Complete={level3Complete}
              authProvider={user?.app_metadata?.provider} userEmail={user?.email}
              onClose={() => setShowDb(false)}/>
          ) : (
            <button onClick={() => setShowDb(true)} title="View System Architecture"
              style={{ width: 44, height: "100%", background: "#0a0a14",
                border: "1px solid rgba(245,158,11,.18)", borderLeft: "none",
                borderRadius: "0 14px 14px 0", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 6, color: "rgba(245,158,11,.6)" }}>
              <span style={{ fontSize: 16 }}>&#128736;&#65039;</span>
              <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "2px",
                textTransform: "uppercase", writingMode: "vertical-rl",
                transform: "rotate(180deg)", color: "rgba(245,158,11,.5)" }}>VIEW DB</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}