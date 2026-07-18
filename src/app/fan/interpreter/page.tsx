"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Volume2, Copy } from "lucide-react";
import { toast } from "sonner";
import { InterpreterSidePanel } from "@/components/interpreter/InterpreterSidePanel";

interface Message {
  id: string;
  sender: "fan" | "volunteer";
  originalText: string;
  translatedText: string;
  detectedLang?: string;
  flag?: string;
  isEmergency?: boolean;
}

const COMMON_SIGNS = [
  { id: "s1", original: "SALIDA DE EMERGENCIA", detected: "Spanish", flag: "🇪🇸", translation: "EMERGENCY EXIT", category: "Emergency" },
  { id: "s2", original: "ACCESO AL ESTADIO - PUERTA A", detected: "Spanish", flag: "🇪🇸", translation: "STADIUM ACCESS - GATE A", category: "Gates" },
  { id: "s3", original: "SERVICIOS MÉDICOS / PRIMEROS AUXILIOS", detected: "Spanish", flag: "🇪🇸", translation: "MEDICAL SERVICES / FIRST AID", category: "Medical" },
  { id: "s4", original: "SECTOR DE ALIMENTOS Y BEBIDAS", detected: "Spanish", flag: "🇪🇸", translation: "FOOD AND BEVERAGES ZONE", category: "Concessions" },
  { id: "s5", original: "KONTROLLPUNKT / SICHERHEIT", detected: "German", flag: "🇩🇪", translation: "SECURITY CHECKPOINT", category: "Security" },
  { id: "s6", original: "TOILETTEN / SANITÄRANLAGEN", detected: "German", flag: "🇩🇪", translation: "RESTROOMS", category: "Restrooms" },
  { id: "s7", original: "ESTAÇÃO DE METRÔ - ACESSO ESTE", detected: "Portuguese", flag: "🇧🇷", translation: "METRO STATION - EAST ENTRANCE", category: "Metro" },
];

const EMERGENCY_PHRASES = ["lost my child", "need medical help", "emergency", "lost"];

const DETECTED_SIMULATED_PHRASES = [
  { text: "Dónde está la puerta de salida más cercana?", lang: "Spanish", flag: "🇪🇸", translation: "Where is the nearest exit gate?" },
  { text: "He perdido a mi hijo en el área de comida.", lang: "Spanish", flag: "🇪🇸", translation: "I lost my child in the food court area." },
  { text: "Ich brauche dringend medizinische Hilfe.", lang: "German", flag: "🇩🇪", translation: "I urgently need medical help." },
  { text: "Onde fica a estação de metrô?", lang: "Portuguese", flag: "🇧🇷", translation: "Where is the metro station?" },
];

export default function FanInterpreterPage() {
  const [activeTab, setActiveTab] = useState<"voice" | "conversation" | "text" | "sign">("voice");
  const [langFrom, setLangFrom] = useState("es");
  const [langTo, setLangTo] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [voiceTranslated, setVoiceTranslated] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [detectedFlag, setDetectedFlag] = useState("");
  const [conversation, setConversation] = useState<Message[]>([
    {
      id: "m1",
      sender: "fan",
      originalText: "Hola, ¿cómo llego a la zona de asientos de la Puerta A?",
      translatedText: "Hello, how do I get to the Gate A seating area?",
      detectedLang: "Spanish",
      flag: "🇪🇸",
    },
    {
      id: "m2",
      sender: "volunteer",
      originalText: "Sure! Take the escalator on your left up to the second level.",
      translatedText: "¡Claro! Suba por la escalera mecánica a su izquierda hasta el segundo nivel.",
      detectedLang: "English",
      flag: "🇺🇸",
    }
  ]);
  const [simulatedOcrText, setSimulatedOcrText] = useState("");
  const [simulatedOcrTranslated, setSimulatedOcrTranslated] = useState("");
  const [ocrLang, setOcrLang] = useState("");
  const [ocrFlag, setOcrFlag] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "conversation") {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, activeTab]);

  // Audio Pronunciation
  const speakText = (text: string, lang = "en-US") => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
      toast.success("Playing translated audio");
    } else {
      toast.error("Audio playback is not supported on this device.");
    }
  };

  // Text Copy
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Simulate Voice input trigger
  const handleStartVoiceSim = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setVoiceText("");
    setVoiceTranslated("");
    setDetectedLang("");
    setDetectedFlag("");

    // Cycle through mock phrase translation after 2.5 seconds
    setTimeout(() => {
      const randomPhrase = DETECTED_SIMULATED_PHRASES[Math.floor(Math.random() * DETECTED_SIMULATED_PHRASES.length)];
      setVoiceText(randomPhrase.text);
      setVoiceTranslated(randomPhrase.translation);
      setDetectedLang(randomPhrase.lang);
      setDetectedFlag(randomPhrase.flag);
      setIsRecording(false);

      const isEmergency = EMERGENCY_PHRASES.some(phrase => randomPhrase.translation.toLowerCase().includes(phrase));
      if (isEmergency) {
        toast.error("🚨 Emergency phrase detected!");
      } else {
        toast.success("Translation complete!");
      }
    }, 2500);
  };

  // Submit Text Translation
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let translation = "This is a simulated translation of your input.";
    const lang = "Spanish";
    const flag = "🇪🇸";

    if (inputText.toLowerCase().includes("hola")) {
      translation = "Hello.";
    } else if (inputText.toLowerCase().includes("metro")) {
      translation = "Where is the metro?";
    } else if (inputText.toLowerCase().includes("baño") || inputText.toLowerCase().includes("aseos")) {
      translation = "Where are the restrooms?";
    }

    const isEmergency = EMERGENCY_PHRASES.some(phrase => inputText.toLowerCase().includes(phrase) || translation.toLowerCase().includes(phrase));

    const newMessage: Message = {
      id: Math.random().toString(),
      sender: "fan",
      originalText: inputText,
      translatedText: translation,
      detectedLang: lang,
      flag: flag,
      isEmergency: isEmergency,
    };

    setConversation(prev => [...prev, newMessage]);
    setInputText("");

    if (isEmergency) {
      toast.error("🚨 Emergency phrase detected!");
    } else {
      toast.success("Translated successfully.");
    }
  };

  // Simulate Sign Image Upload & OCR Scanning
  const handleSignUpload = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setSimulatedOcrText("");
    setSimulatedOcrTranslated("");

    // Simulate scanning progress bar
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      let signLang = "Spanish";
      if (langFrom === "de") signLang = "German";
      else if (langFrom === "pt") signLang = "Portuguese";
      else if (langFrom === "fr") signLang = "French";
      else if (langFrom === "ar") signLang = "Arabic";

      const matchedSigns = COMMON_SIGNS.filter(s => s.detected.toLowerCase() === signLang.toLowerCase());
      const listToPick = matchedSigns.length > 0 ? matchedSigns : COMMON_SIGNS;
      const sign = listToPick[Math.floor(Math.random() * listToPick.length)];

      setSimulatedOcrText(sign.original);
      setSimulatedOcrTranslated(sign.translation);
      setOcrLang(sign.detected);
      setOcrFlag(sign.flag);
      setIsScanning(false);
      toast.success(`OCR Scan Complete: Translated ${sign.detected} Sign`);
    }, 1200);
  };

  // Simulate two-way Conversation response
  const handleConversationSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const fanMsg = inputText;
    const isEmergency = EMERGENCY_PHRASES.some(phrase => fanMsg.toLowerCase().includes(phrase));

    const newMessage: Message = {
      id: Math.random().toString(),
      sender: "fan",
      originalText: fanMsg,
      translatedText: `Translated: ${fanMsg}`,
      detectedLang: "Spanish",
      flag: "🇪🇸",
      isEmergency: isEmergency,
    };

    setConversation(prev => [...prev, newMessage]);
    setInputText("");

    // Simulate volunteer reply after 2 seconds
    setTimeout(() => {
      const replies = [
        "Please follow the exit signs toward Concourse B.",
        "You can find the nearest medical center just behind Gate C.",
        "The food stands in Section 112 accept mobile card payments.",
        "I can walk with you there, please follow me."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMessage: Message = {
        id: Math.random().toString(),
        sender: "volunteer",
        originalText: randomReply,
        translatedText: `Traducido: ${randomReply}`,
        detectedLang: "English",
        flag: "🇺🇸",
      };
      setConversation(prev => [...prev, replyMessage]);
    }, 2000);
  };

  const isEmergencyActive =
    (activeTab === "voice" && EMERGENCY_PHRASES.some(phrase => voiceTranslated.toLowerCase().includes(phrase))) ||
    (activeTab === "sign" && simulatedOcrTranslated === "EMERGENCY EXIT") ||
    (activeTab === "conversation" && conversation.some(m => m.isEmergency));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>🗣️ Cortex AI Live Interpreter</h2>
        <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
          Real-time multilingual interpreter companion for World Cup attendees.
        </p>
      </div>

      {/* Language Configuration Selector Deck */}
      <div className="glass-card" style={{ display: "flex", gap: "1.5rem", padding: "1rem 1.25rem", alignItems: "center" }}>
        <div style={{ display: "flex", flex: 1, gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "180px" }}>
            <label htmlFor="langFromSelect" style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--foreground-muted))" }}>Translate From</label>
            <select
              id="langFromSelect"
              value={langFrom}
              onChange={(e) => {
                setLangFrom(e.target.value);
                toast.info(`Source language set to ${e.target.selectedOptions[0].text}`);
              }}
              style={{
                background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-sm)", color: "white", padding: "0.4375rem 0.75rem", fontSize: "0.875rem"
              }}
            >
              <option value="es">Spanish 🇪🇸</option>
              <option value="de">German 🇩🇪</option>
              <option value="pt">Portuguese 🇧🇷</option>
              <option value="fr">French 🇫🇷</option>
              <option value="ar">Arabic 🇸🇦</option>
              <option value="en">English 🇺🇸</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "180px" }}>
            <label htmlFor="langToSelect" style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--foreground-muted))" }}>Translate To</label>
            <select
              id="langToSelect"
              value={langTo}
              onChange={(e) => {
                setLangTo(e.target.value);
                toast.info(`Target language set to ${e.target.selectedOptions[0].text}`);
              }}
              style={{
                background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-sm)", color: "white", padding: "0.4375rem 0.75rem", fontSize: "0.875rem"
              }}
            >
              <option value="en">English 🇺🇸</option>
              <option value="es">Spanish 🇪🇸</option>
              <option value="de">German 🇩🇪</option>
              <option value="pt">Portuguese 🇧🇷</option>
              <option value="fr">French 🇫🇷</option>
              <option value="ar">Arabic 🇸🇦</option>
            </select>
          </div>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", borderLeft: "1px solid hsl(var(--border))", paddingLeft: "1.25rem" }}>
          🛡️ Cortex engine handles automatic fallback overrides.
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Interpreter modes"
        style={{ display: "flex", gap: "0.375rem", padding: "0.25rem", background: "hsl(var(--surface-2))", borderRadius: "var(--radius-md)", width: "fit-content" }}
      >
        {(["voice", "conversation", "text", "sign"] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            id={`tab-${tab}`}
            aria-controls={`panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)",
              background: activeTab === tab ? "hsl(var(--surface-3))" : "transparent",
              border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
              fontSize: "0.875rem", fontWeight: 500,
              color: activeTab === tab ? "hsl(var(--foreground))" : "hsl(var(--foreground-muted))",
              transition: "all 0.15s ease",
            }}
          >
            {tab === "voice" && "🎙️ Live Voice"}
            {tab === "conversation" && "💬 Conversation"}
            {tab === "text" && "📝 Text Translation"}
            {tab === "sign" && "📷 Camera Sign"}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
        {/* Active Tab Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* VOICE TRANSLATION */}
          {activeTab === "voice" && (
            <div
              role="tabpanel"
              id="panel-voice"
              aria-labelledby="tab-voice"
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "1.5rem" }}
            >
              <h3 style={{ fontWeight: 600 }}>🎙️ Tap to Speak</h3>
              <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))", textAlign: "center" }}>
                Speak in your native language. Cortex will automatically translate and read it aloud.
              </p>

              {/* Bouncing audio waveform when recording */}
              {isRecording ? (
                <div style={{ display: "flex", gap: "4px", height: "40px", alignItems: "center" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <motion.div
                      key={bar}
                      animate={{ height: [12, 36, 12] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: bar * 0.08 }}
                      style={{ width: "4px", background: "hsl(var(--accent-blue))", borderRadius: "2px" }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ height: "40px", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))" }}>Ready to listen</span>
                </div>
              )}

              <button
                onClick={handleStartVoiceSim}
                style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: isRecording ? "linear-gradient(135deg, hsl(0 84% 55%), hsl(0 84% 45%))" : "linear-gradient(135deg, hsl(210 90% 55%), hsl(210 90% 45%))",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.35)", transition: "all 0.2s ease"
                }}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                <Mic size={32} color="white" />
              </button>

              <AnimatePresence>
                {voiceText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "1rem" }}
                  >
                    <div style={{ background: "hsl(var(--surface-2))", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border))" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", display: "flex", alignItems: "center", gap: "4px" }}>
                          {detectedFlag} Spoken ({detectedLang})
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button aria-label="Copy to clipboard" onClick={() => copyText(voiceText)} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--foreground-muted))" }} title="Copy">
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.9375rem" }}>{voiceText}</p>
                    </div>

                    <div style={{ background: "hsl(var(--surface-3))", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--accent-blue) / 0.25)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "hsl(var(--accent-blue))", fontWeight: 600 }}>🇺🇸 Translated (English)</span>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button aria-label="Play audio" onClick={() => speakText(voiceTranslated)} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--accent-blue))" }} title="Play Audio">
                            <Volume2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{voiceTranslated}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TWO-WAY CONVERSATION */}
          {activeTab === "conversation" && (
            <div
              role="tabpanel"
              id="panel-conversation"
              aria-labelledby="tab-conversation"
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", height: "450px" }}
            >
              <div style={{ padding: "1rem", borderBottom: "1px solid hsl(var(--border))", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>💬 Two-way Conversation Mode</span>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>Fan 🇪🇸 ⟷ Volunteer 🇺🇸</span>
              </div>

              {/* Chat Thread */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {conversation.map((msg) => {
                  const isFan = msg.sender === "fan";
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isFan ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        background: isFan ? "hsl(var(--surface-3))" : "hsl(var(--surface-2))",
                        border: msg.isEmergency ? "1px solid hsl(var(--accent-red) / 0.4)" : "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius-md)",
                        padding: "0.75rem 1rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "0.25rem", fontSize: "0.75rem", color: "hsl(var(--foreground-muted))" }}>
                        <span>{msg.flag}</span>
                        <span style={{ fontWeight: 600 }}>{isFan ? "Visitor" : "Volunteer Staff"}</span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", fontStyle: "italic", marginBottom: "0.375rem" }}>
                        {msg.originalText}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.375rem" }}>
                        <p style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{msg.translatedText}</p>
                        <button aria-label="Play audio translation" onClick={() => speakText(msg.translatedText, isFan ? "en-US" : "es-ES")} style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--foreground-subtle))" }}>
                          <Volume2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div ref={conversationEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleConversationSend} style={{ display: "flex", padding: "0.75rem", borderTop: "1px solid hsl(var(--border))", gap: "0.5rem" }}>
                <label htmlFor="interpreter-chat-input" className="sr-only">Type message in Spanish</label>
                <input
                  id="interpreter-chat-input"
                  type="text"
                  placeholder="Type a Spanish phrase..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1, background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius-sm)", color: "white", padding: "0.5rem 0.75rem", fontSize: "0.875rem"
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem", minHeight: 0 }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* TEXT TRANSLATION */}
          {activeTab === "text" && (
            <div
              role="tabpanel"
              id="panel-text"
              aria-labelledby="tab-text"
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <h3 style={{ fontWeight: 600 }}>📝 Manual Text Translation</h3>
              <form onSubmit={handleTextSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <label htmlFor="interpreter-text-input" className="sr-only">Spanish text to translate</label>
                <textarea
                  id="interpreter-text-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter Spanish text to translate to English (e.g. Dónde están los baños?)"
                  style={{
                    width: "100%", height: "100px", background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius-sm)", color: "white", padding: "0.75rem", fontSize: "0.875rem", resize: "none"
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
                  Translate Text
                </button>
              </form>
            </div>
          )}

          {/* CAMERA SIGN TRANSLATION */}
          {activeTab === "sign" && (
            <div
              role="tabpanel"
              id="panel-sign"
              aria-labelledby="tab-sign"
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <h3 style={{ fontWeight: 600 }}>📷 Sign Camera OCR Upload Simulation</h3>
              <p style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>
                Upload or capture a photo of a stadium gateway or concourse sign to scan and translate it.
              </p>

              {/* Simulated File Upload Drag & Drop Area */}
              <div
                onClick={handleSignUpload}
                style={{
                  border: "2px dashed hsl(var(--border))",
                  borderRadius: "var(--radius-md)",
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.01)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
                className="hover:bg-white/[0.03]"
              >
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "hsl(var(--surface-3))", display: "flex",
                  alignItems: "center", justifyItems: "center", justifyContent: "center",
                  fontSize: "1.25rem"
                }}>
                  📷
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Upload sign picture or snap photo</p>
                  <p style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-subtle))", marginTop: "4px" }}>
                    PNG, JPG or WEBP signs accepted (Max 5MB)
                  </p>
                </div>
                <button type="button" className="btn btn-ghost" style={{ fontSize: "0.8125rem", padding: "0.4rem 0.8rem", minHeight: 0 }}>
                  Select File
                </button>
              </div>

              {/* Scanning status */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                        <span style={{ color: "hsl(var(--accent-blue))", fontWeight: 600 }}>⚡ Cortex AI scanning photo...</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div style={{ height: "4px", background: "hsl(var(--surface-2))", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "hsl(var(--accent-blue))", width: `${scanProgress}%`, transition: "width 0.2s ease" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {simulatedOcrText && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}
                  >
                    <div style={{ background: "hsl(var(--surface-2))", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border))" }}>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--foreground-muted))", marginBottom: "0.375rem" }}>
                        {ocrFlag} Original Sign ({ocrLang})
                      </div>
                      <p style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.875rem" }}>{simulatedOcrText}</p>
                    </div>

                    <div style={{ background: "hsl(var(--surface-3))", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--accent-blue) / 0.25)" }}>
                      <div style={{ fontSize: "0.75rem", color: "hsl(var(--accent-blue))", fontWeight: 600, marginBottom: "0.375rem" }}>
                        🇺🇸 Translation (English)
                      </div>
                      <p style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.875rem" }}>{simulatedOcrTranslated}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Dynamic Contextual Recommendations and Navigation */}
        <InterpreterSidePanel
          isEmergencyActive={isEmergencyActive}
          voiceTranslated={voiceTranslated}
          simulatedOcrTranslated={simulatedOcrTranslated}
          speakText={speakText}
        />
      </div>
    </div>
  );
}
