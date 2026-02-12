import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } });
    }
    return null;
  }

  // Check if token needs refresh
  if (session.user.tokenExpiresAt < new Date()) {
    try {
      const refreshed = await refreshToken(session.user.refreshToken);
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
        },
      });
      session.user.accessToken = refreshed.accessToken;
    } catch {
      await prisma.session.delete({ where: { id: sessionId } });
      return null;
    }
  }

  return session;
}

async function refreshToken(refreshTokenValue: string) {
  const res = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/oauth/token/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue,
        client_id: process.env.SECONDME_CLIENT_ID!,
        client_secret: process.env.SECONDME_CLIENT_SECRET!,
      }),
    }
  );
  const result = await res.json();
  if (result.code !== 0 || !result.data) {
    throw new Error("Token refresh failed");
  }
  return result.data;
}
