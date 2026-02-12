import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all users with DNA profiles (excluding current user)
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      dnaProfile: { isNot: null },
    },
    include: { dnaProfile: true },
  });

  // Get current user's DNA
  const myDna = await prisma.dnaProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Get existing matches
  const existingMatches = await prisma.match.findMany({
    where: { userAId: session.user.id },
    include: {
      userB: { include: { dnaProfile: true } },
      transactions: true,
    },
    orderBy: { score: "desc" },
  });

  if (candidates.length === 0 && existingMatches.length === 0) {
    // Seed mock users if no real candidates exist
    await seedMockUsers(session.user.id);
    const matches = await prisma.match.findMany({
      where: { userAId: session.user.id },
      include: { userB: { include: { dnaProfile: true } } },
      orderBy: { score: "desc" },
    });
    return NextResponse.json({ code: 0, data: matches.map(formatMatch) });
  }

  // Create matches for new candidates
  const existingBIds = new Set(existingMatches.map((m) => m.userBId));
  for (const candidate of candidates) {
    if (existingBIds.has(candidate.id)) continue;
    const score = myDna && candidate.dnaProfile
      ? computeScore(myDna, candidate.dnaProfile, session.user, candidate)
      : Math.floor(Math.random() * 30 + 50);

    await prisma.match.create({
      data: {
        userAId: session.user.id,
        userBId: candidate.id,
        score,
      },
    });
  }

  const allMatches = await prisma.match.findMany({
    where: { userAId: session.user.id },
    include: { userB: { include: { dnaProfile: true } } },
    orderBy: { score: "desc" },
  });

  return NextResponse.json({ code: 0, data: allMatches.map(formatMatch) });
}

function computeScore(
  myDna: { radarData: string },
  otherDna: { radarData: string },
  myUser: { industry?: string | null; mbti?: string | null },
  otherUser: { industry?: string | null; mbti?: string | null }
): number {
  try {
    const myRadar = JSON.parse(myDna.radarData);
    const otherRadar = JSON.parse(otherDna.radarData);
    const keys = ["spicy", "sweet", "fresh", "adventurous", "social", "refined"];

    // Cosine similarity on radar data
    let dotProduct = 0, magA = 0, magB = 0;
    for (const k of keys) {
      const a = myRadar[k] || 0;
      const b = otherRadar[k] || 0;
      dotProduct += a * b;
      magA += a * a;
      magB += b * b;
    }
    const cosineSim = magA && magB ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;

    let score = Math.round(cosineSim * 70); // base: 0-70

    // Industry bonus (+10)
    if (myUser.industry && otherUser.industry && myUser.industry === otherUser.industry) {
      score += 10;
    }

    // MBTI compatibility bonus (+10)
    if (myUser.mbti && otherUser.mbti) {
      const compatible = ["INTJ-ENFP", "INFP-ENTJ", "ISFJ-ESTP", "ENFP-INTJ", "ENTJ-INFP", "ESTP-ISFJ"];
      const pair = `${myUser.mbti}-${otherUser.mbti}`;
      if (compatible.includes(pair)) score += 10;
      else if (myUser.mbti === otherUser.mbti) score += 5;
    }

    // Random variance (+0-10)
    score += Math.floor(Math.random() * 10);

    return Math.min(99, Math.max(30, score));
  } catch {
    return Math.floor(Math.random() * 30 + 50);
  }
}

async function seedMockUsers(userId: string) {
  const mocks = [
    { name: "林小厨", industry: "互联网/科技", mbti: "ENFP", job: "产品经理", ageRange: "25-30", dna: { title: "麻辣探险家", slogan: "无辣不欢的美食冒险家", tags: ["麻辣", "热闹聚会", "互联网/科技"], radarData: { spicy: 92, sweet: 30, fresh: 40, adventurous: 88, social: 85, refined: 45 } }, score: 87 },
    { name: "素素", industry: "教育", mbti: "INFP", job: "老师", ageRange: "23-28", dna: { title: "清新养生派", slogan: "用最简单的食材做最温暖的饭", tags: ["清淡", "安静聊天", "素食"], radarData: { spicy: 10, sweet: 55, fresh: 95, adventurous: 35, social: 40, refined: 80 } }, score: 72 },
    { name: "吃货阿杰", industry: "自由职业", mbti: "ESTP", job: "自由撰稿人", ageRange: "26-32", dna: { title: "百味鉴赏家", slogan: "人生苦短，什么都要尝一尝", tags: ["什么都吃", "随意自在", "自由职业"], radarData: { spicy: 65, sweet: 60, fresh: 55, adventurous: 95, social: 70, refined: 50 } }, score: 81 },
  ];

  for (const mock of mocks) {
    const mockUser = await prisma.user.create({
      data: {
        name: mock.name,
        industry: mock.industry,
        mbti: mock.mbti,
        job: mock.job,
        ageRange: mock.ageRange,
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
      data: { userAId: userId, userBId: mockUser.id, score: mock.score },
    });
  }
}

interface MatchRow {
  id: string;
  score: number;
  unlocked: boolean;
  restaurantName: string | null;
  budget: string | null;
  paymentRule: string | null;
  icebreaker: string | null;
  userB: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    industry: string | null;
    job: string | null;
    mbti: string | null;
    ageRange: string | null;
    healthCertified: boolean;
    dnaProfile: { title: string; slogan: string; tags: string; radarData: string } | null;
  };
}

function formatMatch(m: MatchRow) {
  return {
    id: m.id,
    score: m.score,
    unlocked: m.unlocked,
    restaurantName: m.restaurantName,
    budget: m.budget,
    paymentRule: m.paymentRule,
    icebreaker: m.icebreaker,
    user: {
      id: m.userB.id,
      name: m.userB.name,
      avatarUrl: m.userB.avatarUrl,
      industry: m.userB.industry,
      job: m.userB.job,
      mbti: m.userB.mbti,
      ageRange: m.userB.ageRange,
      healthCertified: m.userB.healthCertified,
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
