import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { certUrl } = await request.json();

  if (!certUrl) {
    return NextResponse.json({ error: "certUrl is required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      healthCertUrl: certUrl,
      healthCertified: true,
    },
    select: {
      id: true,
      healthCertified: true,
      healthCertUrl: true,
    },
  });

  return NextResponse.json({ code: 0, data: user });
}
