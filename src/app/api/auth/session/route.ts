import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { User, UserRole } from "@/types";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const userRoleSchema = z.enum(["fan", "volunteer", "security", "operations"]);

const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: userRoleSchema,
  language: z.string(),
  sector: z.string().optional(),
  badgeId: z.string().optional(),
});

const postBodySchema = z.union([
  z.object({ role: userRoleSchema, user: z.undefined().optional() }),
  z.object({ user: sessionUserSchema, role: z.undefined().optional() }),
]);

// ─── Demo User Registry ────────────────────────────────────────────────────────

const DEMO_USERS: Record<UserRole, User> = {
  fan: {
    id: "fan-001",
    name: "Alex Rivera",
    role: "fan",
    language: "en",
    sector: "Section 112, Row G, Seat 14",
  },
  volunteer: {
    id: "vol-001",
    name: "Sara Mitchell",
    role: "volunteer",
    language: "en",
    sector: "East Wing",
    badgeId: "VOL-2026-4421",
  },
  security: {
    id: "sec-001",
    name: "Officer Chen",
    role: "security",
    language: "en",
    badgeId: "SEC-2026-0892",
  },
  operations: {
    id: "ops-001",
    name: "Dr. Priya Nair",
    role: "operations",
    language: "en",
    badgeId: "OPS-2026-CHIEF",
  },
};

// ─── Cookie helpers ────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

// ─── GET /api/auth/session ─────────────────────────────────────────────────────

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get("session_user")?.value;
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    let raw: unknown;
    try {
      raw = JSON.parse(sessionUser);
    } catch {
      // Cookie is malformed – clear it and return null
      cookieStore.set("session_user", "", { ...COOKIE_OPTIONS, expires: new Date(0) });
      cookieStore.set("user_role", "", { ...COOKIE_OPTIONS, expires: new Date(0) });
      return NextResponse.json({ user: null });
    }

    const parsed = sessionUserSchema.safeParse(raw);
    if (!parsed.success) {
      // Cookie value doesn't match expected schema – reject it
      cookieStore.set("session_user", "", { ...COOKIE_OPTIONS, expires: new Date(0) });
      cookieStore.set("user_role", "", { ...COOKIE_OPTIONS, expires: new Date(0) });
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: parsed.data });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// ─── POST /api/auth/session ────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const parsed = postBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;
    let user: User;

    if (body.role) {
      user = DEMO_USERS[body.role];
    } else if (body.user) {
      const demoUser = DEMO_USERS[body.user.role];
      if (body.user.id !== demoUser.id || body.user.name !== demoUser.name) {
        return NextResponse.json({ error: "Unauthorized user credentials" }, { status: 403 });
      }
      user = demoUser;
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user", JSON.stringify(user), COOKIE_OPTIONS);
    cookieStore.set("user_role", user.role, COOKIE_OPTIONS);

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

// ─── DELETE /api/auth/session ──────────────────────────────────────────────────

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session_user", "", { ...COOKIE_OPTIONS, expires: new Date(0) });
    cookieStore.set("user_role", "", { ...COOKIE_OPTIONS, expires: new Date(0) });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
