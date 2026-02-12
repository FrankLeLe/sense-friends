import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(
      `${process.env.SECONDME_API_BASE_URL}/api/oauth/token/code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.SECONDME_REDIRECT_URI!,
          client_id: process.env.SECONDME_CLIENT_ID!,
          client_secret: process.env.SECONDME_CLIENT_SECRET!,
        }),
      }
    );

    const tokenResult = await tokenRes.json();
    if (tokenResult.code !== 0 || !tokenResult.data) {
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", request.url)
      );
    }

    const { accessToken, refreshToken, expiresIn } = tokenResult.data;

    // Fetch user info
    const userRes = await fetch(
      `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const userResult = await userRes.json();
    const userInfo = userResult.code === 0 ? userResult.data : {};

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: userInfo.email || `unknown-${Date.now()}` },
      update: {
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        route: userInfo.route,
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      create: {
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        route: userInfo.route,
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    const response = NextResponse.redirect(new URL("/ai-chat", request.url));
    response.cookies.set("session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
