import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { User, UserRole } from "@/types";

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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get("session_user")?.value;
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }
    const user = JSON.parse(sessionUser);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body.role as UserRole;
    let user = body.user as User | undefined;

    if (role && DEMO_USERS[role]) {
      user = DEMO_USERS[role];
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    cookieStore.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session_user", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    cookieStore.set("user_role", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
