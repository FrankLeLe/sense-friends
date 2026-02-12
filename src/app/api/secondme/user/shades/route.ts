import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/shades`,
    { headers: { Authorization: `Bearer ${session.user.accessToken}` } }
  );
  const result = await res.json();
  return NextResponse.json(result);
}
