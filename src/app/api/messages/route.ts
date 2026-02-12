import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matchId = request.nextUrl.searchParams.get("matchId");

  if (matchId) {
    // Get messages for a specific match
    const messages = await prisma.directMessage.findMany({
      where: { matchId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ code: 0, data: messages });
  }

  // Get all conversations (unlocked matches with latest message)
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { userAId: session.user.id, unlocked: true },
        { userBId: session.user.id, unlocked: true },
      ],
    },
    include: {
      userA: { select: { id: true, name: true, avatarUrl: true } },
      userB: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const conversations = matches.map((m) => {
    const other = m.userAId === session.user.id ? m.userB : m.userA;
    const lastMsg = m.messages[0];
    return {
      matchId: m.id,
      user: other,
      lastMessage: lastMsg?.content || null,
      lastMessageAt: lastMsg?.createdAt || m.createdAt,
    };
  });

  return NextResponse.json({ code: 0, data: conversations });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId, content } = await request.json();

  // Verify user is part of this match and it's unlocked
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      unlocked: true,
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found or locked" }, { status: 404 });
  }

  const message = await prisma.directMessage.create({
    data: {
      matchId,
      senderId: session.user.id,
      content,
    },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json({ code: 0, data: message });
}
