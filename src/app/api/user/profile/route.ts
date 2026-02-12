import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const ALLOWED_FIELDS = ["name", "avatarUrl", "industry", "job", "mbti", "ageRange", "bio"] as const;

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Only pick allowed fields
  const data: Record<string, string> = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      industry: true,
      job: true,
      mbti: true,
      ageRange: true,
      bio: true,
    },
  });

  return NextResponse.json({ code: 0, data: user });
}
