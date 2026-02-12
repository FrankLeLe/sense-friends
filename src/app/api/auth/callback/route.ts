import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  // SecondMe may redirect back with error param if user denied
  if (error) {
    console.error("[callback] OAuth denied by provider:", error);
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  // Step 1: Exchange code for tokens
  let tokenResult;
  try {
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
    tokenResult = await tokenRes.json();
    console.log("[callback] token exchange status:", tokenRes.status, JSON.stringify(tokenResult));
  } catch (err) {
    console.error("[callback] token exchange network error:", err);
    return NextResponse.redirect(new URL("/login?error=token_network_error", request.url));
  }

  if (tokenResult.code !== 0 || !tokenResult.data) {
    console.error("[callback] token exchange rejected:", JSON.stringify(tokenResult));
    return NextResponse.redirect(
      new URL(`/login?error=token_failed&detail=${encodeURIComponent(tokenResult.message || tokenResult.msg || JSON.stringify(tokenResult))}`, request.url)
    );
  }

  const { accessToken, refreshToken, expiresIn } = tokenResult.data;

  // Step 2: Fetch user info
  let userInfo: Record<string, string> = {};
  try {
    const userRes = await fetch(
      `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const userResult = await userRes.json();
    console.log("[callback] user info status:", userRes.status, JSON.stringify(userResult));
    userInfo = userResult.code === 0 && userResult.data ? userResult.data : {};
  } catch (err) {
    console.warn("[callback] user info fetch failed, continuing:", err);
  }

  // Step 3: Create or update user in DB
  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userInfo.email ? [{ email: userInfo.email }] : []),
          ...(userInfo.route ? [{ route: userInfo.route }] : []),
        ].length > 0
          ? [
              ...(userInfo.email ? [{ email: userInfo.email }] : []),
              ...(userInfo.route ? [{ route: userInfo.route }] : []),
            ]
          : [{ id: "___never_match___" }], // no identifiable info, skip lookup
      },
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: userInfo.name || existing.name,
          email: userInfo.email || existing.email,
          avatarUrl: userInfo.avatarUrl || existing.avatarUrl,
          route: userInfo.route || existing.route,
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: userInfo.email || null,
          name: userInfo.name || userInfo.route || "用户",
          avatarUrl: userInfo.avatarUrl || null,
          route: userInfo.route || null,
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000),
        },
      });
    }

    // Step 4: Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    console.log("[callback] login success, user:", user.id, user.name);
    return response;
  } catch (err) {
    console.error("[callback] DB error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=db_error&detail=${encodeURIComponent(String(err))}`, request.url)
    );
  }
}
