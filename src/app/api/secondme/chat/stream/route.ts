import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  const res = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/chat/stream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
        sessionId: body.sessionId,
      }),
    }
  );

  if (!res.ok || !res.body) {
    return new Response(JSON.stringify({ error: "Chat request failed" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream SSE response through
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
