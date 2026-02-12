import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const UNLOCK_COST = 10;

const restaurants = [
  "小院私厨", "花开半夏", "老街烧烤", "素心小馆", "渔歌唱晚",
  "辣妹子川菜", "和风亭", "法式小酒馆", "胡同涮肉", "云端茶室",
];

const paymentRules = ["AA制", "轮流请客", "赢家买单", "随心付"];

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const match = await prisma.match.findFirst({
    where: { id, userAId: session.user.id },
    include: {
      userB: { include: { dnaProfile: true } },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.unlocked) {
    return NextResponse.json({ code: 0, data: { unlocked: true } });
  }

  // Create transaction
  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      matchId: id,
      amount: UNLOCK_COST,
      type: "unlock",
    },
  });

  // Generate icebreaker
  let icebreaker = "你好呀！看到我们口味很合拍，要不要一起约顿饭？";
  try {
    const myDna = await prisma.dnaProfile.findUnique({ where: { userId: session.user.id } });
    if (myDna && match.userB.dnaProfile) {
      const prompt = `两个人要约饭，A的口味DNA: ${myDna.title}(${myDna.slogan})，B的口味DNA: ${match.userB.dnaProfile.title}(${match.userB.dnaProfile.slogan})。请生成一句有趣的破冰开场白，20字以内，中文。只返回开场白文字。`;
      const res = await fetch(
        `${process.env.SECONDME_API_BASE_URL}/api/secondme/chat/stream`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: prompt }),
        }
      );
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) fullText += parsed.content;
                if (parsed.data?.content) fullText += parsed.data.content;
              } catch {
                fullText += data;
              }
            }
          }
        }
        if (fullText.trim()) icebreaker = fullText.trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Use default icebreaker
  }

  const restaurantName = restaurants[Math.floor(Math.random() * restaurants.length)];
  const budget = ["人均50-80", "人均80-120", "人均120-200", "人均200+"][Math.floor(Math.random() * 4)];
  const paymentRule = paymentRules[Math.floor(Math.random() * paymentRules.length)];

  const updated = await prisma.match.update({
    where: { id },
    data: {
      unlocked: true,
      icebreaker,
      restaurantName,
      budget,
      paymentRule,
    },
  });

  return NextResponse.json({
    code: 0,
    data: {
      unlocked: true,
      icebreaker: updated.icebreaker,
      restaurantName: updated.restaurantName,
      budget: updated.budget,
      paymentRule: updated.paymentRule,
    },
  });
}
