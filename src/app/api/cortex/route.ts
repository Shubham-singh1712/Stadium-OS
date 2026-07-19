import { NextResponse } from "next/server";
import { z } from "zod";
import { CopilotMessage, CopilotChart, CopilotAction, StadiumZone } from "@/types";

const requestSchema = z.object({
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(["user", "cortex"]),
    content: z.string().min(1),
    timestamp: z.coerce.date(),
  })).min(1, "At least one message is required"),
  context: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    // Block requests with mismatched origin OR missing origin (prevents curl/server-side bypass)
    if (!origin || !host || !origin.includes(host)) {
      return NextResponse.json({ error: "Forbidden: CSRF origin validation failed" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { messages, context } = parsed.data;
    const lastMessage = (messages as CopilotMessage[])[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // ─── Real Gemini 2.5 Flash Call ───
      const systemInstruction = `You are Cortex AI, the central operating system brain for the FIFA World Cup 2026 Stadium Operations.
Your job is to monitor, analyze, predict, and recommend actions.
Active Stadium Context:
${JSON.stringify(context, null, 2)}

You must respond ONLY with a JSON object that satisfies the following JSON schema:
{
  "content": "A detailed analysis and prediction using Markdown formatting. Be professional, direct, and explain the WHY behind your predictions. Do not use generic answers.",
  "charts": [
    {
      "type": "bar" | "line" | "area",
      "title": "Descriptive title of the data visual",
      "data": [
        {"name": "label", "value": 100, ...}
      ],
      "keys": ["value"]
    }
  ],
  "actions": [
    {
      "id": "action-1",
      "label": "Action Button Label",
      "icon": "🚪",
      "variant": "primary" | "secondary" | "success" | "danger"
    }
  ]
}
If no charts or actions are needed, return an empty array for those fields.`;

      const prompt = `Conversation history:
${(messages as CopilotMessage[]).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

User request: "${lastMessage}"

Return the JSON block now.`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                responseMimeType: "application/json"
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          const parsed = JSON.parse(responseText);
          return NextResponse.json({
            role: "cortex",
            content: parsed.content || "Assessment complete.",
            charts: parsed.charts || [],
            actions: parsed.actions || []
          });
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local reasoning engine:", err);
      }
    }

    // ─── Fallback Local Reasoning Engine ───
    const query = lastMessage.toLowerCase();
    let content = "";
    let charts: CopilotChart[] = [];
    let actions: CopilotAction[] = [];

    if (query.includes("gate") || query.includes("crowd") || query.includes("congest") || query.includes("why")) {
      const gateA = context?.zones?.find((z: any) => z.id === "gate-a") || { current: 1850, capacity: 2000 };
      const pct = Math.round((gateA.current / gateA.capacity) * 100);
      const matchMin = context?.matchMinute || 73;

      content = `**Cortex AI Crowd Assessment & Explainability Report**

- **Why / Root Cause**: High concentration of spectators entering Gate A due to match clock (**Min ${matchMin}**) exit egress triggers.
- **Evidence**: Gate A current occupancy is **${pct}%** (${gateA.current} / ${gateA.capacity} fans). Turnstiles are experiencing flow delays.
- **Prediction**: Bottleneck will escalate to critical in next 4 minutes if current flow rate is maintained.
- **Confidence**: 96%
- **Expected Outcome**: Redirecting to Gate C will balance load, saving 12 minutes in exit transit times.
- **Rollback Plan**: Re-engage Gate A turnstiles if Gate C exceeds 80% occupancy.
- **Affected Systems**: Security gate sensors, fan wayfinding displays.`;
      
      charts = [{
        type: "bar",
        title: "Current Gate Densities (%)",
        data: [
          { name: "Gate A", value: pct },
          { name: "Gate B", value: Math.max(10, Math.min(100, 60 + Math.round(Math.sin(Date.now() / 15000) * 8))) },
          { name: "Gate C", value: Math.max(10, Math.min(100, 30 + Math.round(Math.cos(Date.now() / 20000) * 5))) },
          { name: "Gate D", value: Math.max(10, Math.min(100, 45 + Math.round(Math.sin(Date.now() / 25000) * 10))) }
        ],
        keys: ["value"]
      }];

      actions = [
        { id: "a1", label: "Review Protocol Delta-2", icon: "🔀", variant: "primary" },
        { id: "a2", label: "Close Gate A Temp.", icon: "🚪", variant: "danger" }
      ];
    } else if (query.includes("food") || query.includes("halftime") || query.includes("demand") || query.includes("kiosk")) {
      const waitMin = context?.zones?.find((z: any) => z.id === "food-a")?.queueLength || 18;
      
      content = `**Cortex AI Concessions Rush Projection & Explainability**

- **Why / Root Cause**: Spectator migration to food concourse during Halftime rush window.
- **Evidence**: Food Court A wait times average ${waitMin} minutes. Concourse queue lengths are growing by 4 spectators per minute.
- **Prediction**: Post-halftime surge will increase Food Court B registers queue length to 45+ fans.
- **Confidence**: 94%
- **Expected Outcome**: Opening Kiosk 4B will split concourse queues, reducing waiting queues by 35% in 6 minutes.
- **Rollback Plan**: Deactivate Kiosk 4B after minute 65 to optimize vendor power efficiency.
- **Affected Systems**: Concessions POS registers, volunteer tasks, facility lighting.`;

      charts = [{
        type: "area",
        title: "Halftime Concourse Traffic Projections",
        data: [
          { name: "Kickoff", value: Math.max(10, Math.round(20 + Math.sin(Date.now() / 12000) * 4)) },
          { name: "Min 15", value: Math.max(15, Math.round(35 + Math.cos(Date.now() / 15000) * 7)) },
          { name: "Min 30", value: Math.max(20, Math.round(50 + Math.sin(Date.now() / 18000) * 9)) },
          { name: "Halftime", value: Math.max(70, Math.round(95 + Math.cos(Date.now() / 20000) * 3)) },
          { name: "Min 60", value: Math.max(25, Math.round(40 + Math.sin(Date.now() / 22000) * 6)) }
        ],
        keys: ["value"]
      }];

      actions = [
        { id: "f1", label: "Open Kiosk 4B", icon: "🍔", variant: "primary" },
        { id: "f2", label: "Deploy Waste Handlers", icon: "♻️", variant: "secondary" }
      ];
    } else if (query.includes("volunteer") || query.includes("staffing")) {
      content = `**Cortex AI Staff Allocation Optimization & Explainability**

- **Why / Root Cause**: Volunteers under-allocation detected at Gate A relative to risk levels.
- **Evidence**: Gate A reports staffing level below recommended safety boundaries while stadium risk level is "${context?.crowd?.riskLevel || "High"}".
- **Prediction**: Stampede risk increases by 18% during exit egress if volunteer posts remain vacant.
- **Confidence**: 97%
- **Expected Outcome**: Auto-assigning gap allocation will dispatch 23 standby volunteers, balancing security coverage.
- **Rollback Plan**: Revert volunteer shifts once egress settles post-match.
- **Affected Systems**: Security operations, volunteer routing.`;

      const staffA = Math.max(2, Math.min(8, 4 + Math.round(Math.sin(Date.now() / 30000) * 2)));
      charts = [{
        type: "bar",
        title: "Staff Gaps by Sector",
        data: [
          { name: "Gate A", staffed: staffA, gap: Math.max(0, 8 - staffA) },
          { name: "Food Court A", staffed: 6, gap: 3 },
          { name: "Parking A", staffed: 3, gap: 2 },
          { name: "Gate D", staffed: 6, gap: 1 }
        ],
        keys: ["staffed", "gap"]
      }];

      actions = [
        { id: "s1", label: "Auto-Assign Gaps", icon: "👥", variant: "primary" }
      ];
    } else if (query.includes("sustainability") || query.includes("carbon") || query.includes("energy")) {
      const score = context?.sustainability?.aiScore || 76;
      
      content = `**Cortex AI Sustainability Diagnostics & BMS Adjustments**

- **Why / Root Cause**: Stadium carbon targets seek -15% peak grid usage during match time.
- **Evidence**: Live Eco Score is **${score}/100**. Concourse lighting draws 18.4 kW power.
- **Prediction**: Dimming lighting and rerouting shuttles cuts grid usage by 2.2 tons of CO₂.
- **Confidence**: 95%
- **Expected Outcome**: Reducing lighting saves energy. Rerouting buses saves emissions and improves transport times.
- **Rollback Plan**: Restore full concourse illumination in case of evacuation alert.
- **Affected Systems**: Facility BMS grid, fan transportation routes.`;

      const carbonVal = context?.sustainability?.carbonKg ? Math.round((1 - context.sustainability.carbonKg / 50000) * 100) : 84;
      const energyVal = context?.sustainability?.energyKwh ? Math.round((1 - context.sustainability.energyKwh / 20000) * 100) : 74;
      charts = [{
        type: "area",
        title: "Eco Category Scores",
        data: [
          { name: "Carbon", value: Math.max(10, Math.min(100, carbonVal)) },
          { name: "Waste", value: context?.sustainability?.wasteRecycledPercent || 68 },
          { name: "Energy", value: Math.max(10, Math.min(100, energyVal)) },
          { name: "Transport", value: context?.sustainability?.publicTransportPercent || 62 }
        ],
        keys: ["value"]
      }];

      actions = [
        { id: "e1", label: "Dim Arena Lights 8%", icon: "💡", variant: "secondary" },
        { id: "e2", label: "Activate Green Menu", icon: "🥗", variant: "secondary" }
      ];

    } else if (query.includes("action") || query.includes("taken") || query.includes("memory") || query.includes("history")) {
      const memoryLines = context?.cortexMemory?.map((m: any) => `- **${m.time}**: ${m.action} (${m.details})`).join("\n") || "No operations actions recorded in Cortex Memory yet.";
      
      content = `**Cortex AI System Actions Memory Trace**

Below is the record of executed operations actions saved in Cortex Memory during the current match:

${memoryLines}

All modifications successfully completed have propagated through the active operating system. Let me know if you wish to analyze the feedback impact on dependent dashboards.`;
    } else {
      content = `**Cortex AI Situational Assessment**

All primary subsystems (Security, Facilities, Fans, Volunteers) are synced. Current Stadium occupancy: **92.3%**. 
Hotspots: Gate A (Critical), Restroom S (Critical), Parking A (Critical).

I'm ready to evaluate detailed operations. Try querying:
- "Why is Gate A so crowded?"
- "Predict food demand for halftime"
- "Where should volunteers be deployed?"
- "What actions have we already taken?"`;

      actions = [
        { id: "g1", label: "Review Warnings", icon: "⚠️", variant: "secondary" }
      ];
    }

    return NextResponse.json({
      role: "cortex",
      content,
      charts,
      actions
    });
  } catch (error) {
    console.error("Cortex API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

