import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dna = await prisma.dnaProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!dna) {
    return NextResponse.json({ code: 0, data: null });
  }

  return NextResponse.json({
    code: 0,
    data: {
      ...dna,
      tags: JSON.parse(dna.tags),
      radarData: JSON.parse(dna.radarData),
    },
  });
}
