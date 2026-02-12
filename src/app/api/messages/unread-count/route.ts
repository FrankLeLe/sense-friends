import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count all unread messages sent to the current user across all matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
      unlocked: true,
    },
    select: { id: true },
  });

  const matchIds = matches.map((m) => m.id);

  const count = await prisma.directMessage.count({
    where: {
      matchId: { in: matchIds },
      senderId: { not: session.user.id },
      read: false,
    },
  });

  return NextResponse.json({ code: 0, data: { count } });
}
