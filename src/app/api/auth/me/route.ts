import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatarUrl: session.user.avatarUrl,
      industry: session.user.industry,
      job: session.user.job,
      mbti: session.user.mbti,
      ageRange: session.user.ageRange,
      bio: session.user.bio,
      healthCertified: session.user.healthCertified,
      balance: session.user.balance,
    },
  });
}
