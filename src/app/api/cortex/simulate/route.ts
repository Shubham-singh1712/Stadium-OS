import { NextResponse } from "next/server";
import { z } from "zod";

// Simple in-memory rate limit map (reset on cold start)
const RATE_LIMIT_MAP = new Map<string, { count: number, resetTime: number }>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60000; // 1 minute


const requestSchema = z.object({
  scenario: z.string(),
  currentState: z.unknown(),
});

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!origin || !host || !origin.includes(host)) {
      return NextResponse.json({ error: "Forbidden: CSRF origin validation failed" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const rlData = RATE_LIMIT_MAP.get(ip);
    
    if (rlData && rlData.resetTime > now) {
      if (rlData.count >= MAX_REQUESTS) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      }
      rlData.count++;
    } else {
      RATE_LIMIT_MAP.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
    }

    const { scenario, currentState } = parsed.data;
    const simState = currentState as {
      activeScenario?: { stage: number };
      crowd?: { riskScore: number };
    } | null | undefined;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const systemInstruction = `You are the Cortex AI Simulation Engine.
Your job is to generate the NEXT tick of a live stadium simulation.
Scenario: ${scenario}
Current State: ${JSON.stringify(currentState, null, 2)}

You must respond ONLY with a JSON object that satisfies this schema:
{
  "newTimelineEvents": [
    { "category": "Cortex AI", "message": "...", "severity": "info" | "warning" | "critical" | "success" }
  ],
  "newAlerts": [
    { "title": "...", "message": "...", "severity": "warning" | "critical", "zone": "...", "actionRequired": true }
  ],
  "zoneUpdates": [
    { "id": "gate-a", "current": 1900, "status": "red", "aiRecommendation": "..." }
  ],
  "nextStage": 1, // Advance the stage or stay
  "riskScore": 85,
  "riskLevel": "High"
}`;

      const prompt = `Generate the next state for the ${scenario} simulation.`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: { responseMimeType: "application/json" }
            }),
          }
        );

        if (!response.ok) throw new Error(`Gemini API error`);
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          return NextResponse.json(JSON.parse(responseText));
        }
      } catch (err) {
        console.error("Gemini simulation failed:", err);
      }
    }

    // Fallback if no API key or failed
    return NextResponse.json({
      newTimelineEvents: [],
      newAlerts: [],
      zoneUpdates: [],
      nextStage: simState?.activeScenario?.stage || 0,
      riskScore: simState?.crowd?.riskScore || 50,
      riskLevel: "Moderate"
    });

  } catch (error) {
    console.error("Simulation API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
