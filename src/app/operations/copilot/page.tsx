"use client";

import { useState, useRef, useEffect } from "react";
import { useCortexStore } from "@/stores/cortexStore";
import { motion, AnimatePresence } from "framer-motion";
import type { CopilotMessage } from "@/types";
import { CopilotMessageBubble } from "@/components/copilot/CopilotMessageBubble";

const PREDEFINED_QUESTIONS = [
  "Why is Gate A so crowded?",
  "Predict food demand for halftime",
  "Where should volunteers be deployed?",
  "Which exit is safest right now?",
  "What's the sustainability impact today?",
];

// AI logic moved to /api/cortex route to simulate real LLM architecture

export default function CopilotPage() {
  const crowd = useCortexStore((state) => state.crowd);
  const sustainability = useCortexStore((state) => state.sustainability);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "cortex",
      content: "**Welcome to Cortex AI Copilot**\n\nI have full situational awareness of the stadium. Ask me anything — from crowd dynamics to vendor performance, sustainability to emergency routing.\n\nI'll provide analysis, predictions, and actionable recommendations.",
      timestamp: new Date(),
      actions: [
        { id: "start-1", label: "Why is Gate A crowded?", icon: "🚪", variant: "secondary" },
        { id: "start-2", label: "Predict food demand", icon: "🍔", variant: "secondary" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/cortex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: { crowd, sustainability },
        }),
      });
      const data = await res.json();
      
      const responseMsg: CopilotMessage = {
        id: `cortex-${Date.now()}`,
        role: "cortex",
        content: data.content,
        timestamp: new Date(),
        charts: data.charts,
        actions: data.actions,
      };
      
      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: "cortex",
        content: "I encountered an error connecting to the Cortex Core.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>AI Operations Copilot</h2>
          <p style={{ fontSize: "0.9375rem", color: "hsl(var(--foreground-muted))" }}>Cortex AI · Full stadium situational awareness</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="live-dot" />
          <span style={{ fontSize: "0.8125rem", color: "hsl(var(--foreground-muted))" }}>Cortex Active</span>
        </div>
      </div>

      {/* Quick questions */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", flexShrink: 0 }}>
        {PREDEFINED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            style={{
              padding: "0.4rem 0.875rem", borderRadius: "999px",
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              color: "hsl(var(--foreground-muted))", cursor: "pointer",
              fontSize: "0.8125rem", fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            className="glass-hover"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <CopilotMessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, hsl(210 90% 55%), hsl(152 70% 45%))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
              }}>✦</div>
              <div style={{
                padding: "0.75rem 1rem",
                background: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-md)",
                display: "flex", gap: "0.3rem", alignItems: "center",
              }}>
                {[0, 0.15, 0.3].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, delay, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(210 90% 60%)" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0,
        display: "flex", gap: "0.75rem", alignItems: "flex-end",
        padding: "1rem", background: "hsl(var(--surface))",
        border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-lg)",
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Ask Cortex AI anything about the stadium..."
          style={{
            flex: 1, resize: "none", border: "none", outline: "none",
            background: "transparent", fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem", color: "hsl(var(--foreground))",
            lineHeight: 1.6, minHeight: "24px", maxHeight: "120px",
          }}
          rows={1}
          aria-label="Ask Cortex AI"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="btn btn-primary"
          style={{ flexShrink: 0 }}
          aria-label="Send message"
        >
          Send →
        </button>
      </div>
    </div>
  );
}
