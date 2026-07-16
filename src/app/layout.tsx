import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "StadiumOS AI — FIFA World Cup 2026",
  description: "The AI-powered operating system for FIFA World Cup 2026. Intelligent stadium management, crowd intelligence, and fan experience platform.",
  keywords: ["FIFA", "World Cup", "Stadium", "AI", "Operations", "2026"],
  authors: [{ name: "StadiumOS AI Team" }],
};

export const viewport: Viewport = {
  themeColor: "#0f1117",
  width: "device-width",
  initialScale: 1,
};

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get("session_user")?.value;
  let lang = "en";

  if (sessionUser) {
    try {
      const user = JSON.parse(sessionUser);
      if (user.language) {
        lang = user.language;
      }
    } catch (e) {}
  }

  return (
    <html lang={lang} className="dark">
      <body>
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
