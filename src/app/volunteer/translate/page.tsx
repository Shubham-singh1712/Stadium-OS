"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useVolunteerStore } from "@/stores/volunteerStore";

const LANG_OPTIONS = ["Spanish", "French", "Arabic", "Portuguese", "German", "Japanese", "Chinese"];

export default function TranslatePage() {
  const [translateFrom, setTranslateFrom] = useState("Fan speaks...");
  const [translateResult, setTranslateResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Spanish");
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser. Please try using Chrome or Edge.");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-US";
      
      rec.onstart = () => {
        setIsListening(true);
      };
      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setTranslateFrom(transcript);
      };
      rec.onerror = () => {
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      rec.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
    }
  };

  const speakTranslation = () => {
    if (!translateResult) return;
    try {
      const textToSpeak = translateResult.split("—")[0].replace(/\[.*\]:/, "");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const langCodes: Record<string, string> = {
        "Spanish": "es-ES", "French": "fr-FR", "Arabic": "ar-SA",
        "Portuguese": "pt-PT", "German": "de-DE", "Japanese": "ja-JP", "Chinese": "zh-CN"
      };
      utterance.lang = langCodes[selectedLang] || "es-ES";
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Text to speech error:", e);
    }
  };

  const handleTranslate = () => {
    if (!translateFrom.trim() || translateFrom === "Fan speaks...") return;
    setIsTranslating(true);
    setTimeout(() => {
      const phrases: Record<string, string> = {
        "where is my seat": "¿Dónde está mi asiento? — Sección 112, Fila G.",
        "where is the bathroom": "¿Dónde está el baño? — El baño más cercano está a 50 metros a la derecha.",
        "i need help": "Necesito ayuda. — Un voluntario está en camino.",
      };
      const key = Object.keys(phrases).find(k => translateFrom.toLowerCase().includes(k));
      setTranslateResult(key ? phrases[key] : `[${selectedLang} Translation]: "${translateFrom}" — AI translation generated. Please verify with official FIFA language services.`);
      setIsTranslating(false);
      
      // Complete Spanish translation task in store
      useVolunteerStore.getState().completeTask("t5");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Volunteer Hub</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>
            Sara Mitchell · Badge VOL-2026-4421 · East Wing
          </p>
        </div>
      </div>



      {/* Translation Tab Panel */}
      <motion.div key="translate" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card" style={{ maxWidth: "640px" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>🌐 AI Translation Assistant</h3>
          <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))", marginBottom: "1.5rem" }}>
            Cortex AI assists in real-time translation. Speak into the mic (English) or type below to translate.
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label htmlFor="translate-textarea" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))" }}>
                Fan says (English):
              </label>
              <button
                onClick={startListening}
                style={{
                  background: isListening ? "hsl(0,84%,60% / 0.15)" : "hsl(var(--surface-3))",
                  border: isListening ? "1px solid hsl(0,84%,60% / 0.4)" : "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.75rem",
                  color: isListening ? "hsl(0,84%,65%)" : "hsl(var(--foreground))",
                  padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px",
                  fontWeight: 600
                }}
              >
                <span>🎙️</span> {isListening ? "Listening..." : "Speak (Microphone)"}
              </button>
            </div>
            <textarea
              id="translate-textarea"
              value={translateFrom === "Fan speaks..." ? "" : translateFrom}
              onChange={(e) => setTranslateFrom(e.target.value || "Fan speaks...")}
              placeholder="Type what the fan is saying in English..."
              style={{
                width: "100%", padding: "0.875rem 1rem",
                background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-md)", color: "hsl(var(--foreground))",
                fontFamily: "var(--font-sans)", fontSize: "0.9375rem", resize: "vertical",
                minHeight: "80px", outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "160px" }}>
              <label htmlFor="translate-lang" style={{ fontSize: "0.8125rem", fontWeight: 500, color: "hsl(var(--foreground-muted))", display: "block", marginBottom: "0.5rem" }}>
                Translate to:
              </label>
              <select
                id="translate-lang"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  width: "100%", padding: "0.625rem 0.875rem",
                  background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-sm)", color: "hsl(var(--foreground))",
                  fontFamily: "var(--font-sans)", fontSize: "0.875rem", outline: "none",
                }}
              >
                {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleTranslate}
              disabled={isTranslating}
              style={{ alignSelf: "flex-end", padding: "0.625rem 1.5rem" }}
            >
              {isTranslating ? "Translating..." : "Translate →"}
            </button>
          </div>

          {translateResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "1rem 1.25rem", borderRadius: "var(--radius-md)",
                background: "hsl(210 90% 60% / 0.08)", border: "1px solid hsl(210 90% 60% / 0.2)",
                display: "flex", flexDirection: "column", gap: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "hsl(210,90%,70%)", fontWeight: 600 }}>
                  ✦ Cortex AI Translation — {selectedLang}
                </span>
                <button
                  onClick={speakTranslation}
                  style={{
                    background: "hsl(var(--surface-3))", border: "1px solid hsl(var(--border))",
                    borderRadius: "4px", padding: "4px 8px", cursor: "pointer",
                    fontSize: "0.75rem", color: "hsl(var(--foreground))", display: "flex",
                    alignItems: "center", gap: "4px"
                  }}
                >
                  <span>🔊</span> Speak Out Loud
                </button>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--foreground))", lineHeight: 1.4 }}>
                {translateResult.split("—")[0].replace(/\[.*\]:/, "").trim()}
              </p>
              <p style={{ fontSize: "0.875rem", color: "hsl(var(--foreground-muted))" }}>
                {translateResult.includes("—") ? translateResult.split("—")[1].trim() : ""}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
