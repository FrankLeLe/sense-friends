import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId } = await request.json();

  if (!matchId) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  // Verify user belongs to this match
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Mark all messages from the other user as read
  const result = await prisma.directMessage.updateMany({
    where: {
      matchId,
      senderId: { not: session.user.id },
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({ code: 0, data: { updated: result.count } });
}
