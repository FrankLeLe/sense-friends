import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Mock users for MVP
const mockUsers = [
  {
    name: "林小厨",
    avatarUrl: "",
    dna: { title: "麻辣探险家", slogan: "无辣不欢的美食冒险家", tags: ["麻辣", "热闹聚会", "互联网/科技"], radarData: { spicy: 92, sweet: 30, fresh: 40, adventurous: 88, social: 85, refined: 45 } },
    score: 87,
  },
  {
    name: "素素",
    avatarUrl: "",
    dna: { title: "清新养生派", slogan: "用最简单的食材做最温暖的饭", tags: ["清淡", "安静聊天", "素食"], radarData: { spicy: 10, sweet: 55, fresh: 95, adventurous: 35, social: 40, refined: 80 } },
    score: 72,
  },
  {
    name: "吃货阿杰",
    avatarUrl: "",
    dna: { title: "百味鉴赏家", slogan: "人生苦短，什么都要尝一尝", tags: ["什么都吃", "随意自在", "自由职业"], radarData: { spicy: 65, sweet: 60, fresh: 55, adventurous: 95, social: 70, refined: 50 } },
    score: 81,
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure mock matches exist for this user
  const existing = await prisma.match.findMany({
    where: { userAId: session.user.id },
    include: { userB: true },
  });

  if (existing.length === 0) {
    // Create mock users and matches
    for (const mock of mockUsers) {
      const mockUser = await prisma.user.create({
        data: {
          name: mock.name,
          avatarUrl: mock.avatarUrl,
          accessToken: "mock",
          refreshToken: "mock",
          tokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.dnaProfile.create({
        data: {
          userId: mockUser.id,
          title: mock.dna.title,
          slogan: mock.dna.slogan,
          tags: JSON.stringify(mock.dna.tags),
          radarData: JSON.stringify(mock.dna.radarData),
        },
      });

      await prisma.match.create({
        data: {
          userAId: session.user.id,
          userBId: mockUser.id,
          score: mock.score,
        },
      });
    }

    // Re-fetch
    const matches = await prisma.match.findMany({
      where: { userAId: session.user.id },
      include: { userB: { include: { dnaProfile: true } } },
      orderBy: { score: "desc" },
    });

    return NextResponse.json({
      code: 0,
      data: matches.map(formatMatch),
    });
  }

  const matches = await prisma.match.findMany({
    where: { userAId: session.user.id },
    include: { userB: { include: { dnaProfile: true } } },
    orderBy: { score: "desc" },
  });

  return NextResponse.json({
    code: 0,
    data: matches.map(formatMatch),
  });
}

function formatMatch(m: { id: string; score: number; unlocked: boolean; userB: { id: string; name: string | null; avatarUrl: string | null; dnaProfile: { title: string; slogan: string; tags: string; radarData: string } | null } }) {
  return {
    id: m.id,
    score: m.score,
    unlocked: m.unlocked,
    user: {
      id: m.userB.id,
      name: m.userB.name,
      avatarUrl: m.userB.avatarUrl,
    },
    dna: m.userB.dnaProfile
      ? {
          title: m.userB.dnaProfile.title,
          slogan: m.userB.dnaProfile.slogan,
          tags: JSON.parse(m.userB.dnaProfile.tags),
          radarData: JSON.parse(m.userB.dnaProfile.radarData),
        }
      : null,
  };
}
