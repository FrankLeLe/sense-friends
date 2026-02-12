import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { answers } = await request.json();

  // Build prompt for SecondMe to generate structured DNA
  const prompt = `Based on the following food preference answers, generate a JSON object for a "口味DNA" profile. Answers: ${JSON.stringify(answers)}

Return ONLY valid JSON in this exact format:
{
  "title": "a fun 2-4 character Chinese title like 麻辣探险家",
  "slogan": "a catchy one-line Chinese slogan about their food personality",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "radarData": {
    "spicy": 0-100,
    "sweet": 0-100,
    "fresh": 0-100,
    "adventurous": 0-100,
    "social": 0-100,
    "refined": 0-100
  }
}`;

  try {
    // Try calling SecondMe act API
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

    let dnaData;

    if (res.ok && res.body) {
      // Parse SSE stream to get full response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE data lines
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

      // Try to extract JSON from response
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        dnaData = JSON.parse(jsonMatch[0]);
      }
    }

    // Fallback: generate based on answers directly
    if (!dnaData) {
      dnaData = generateFallbackDna(answers);
    }

    // Save to database
    const dna = await prisma.dnaProfile.upsert({
      where: { userId: session.user.id },
      update: {
        title: dnaData.title,
        slogan: dnaData.slogan,
        tags: JSON.stringify(dnaData.tags),
        radarData: JSON.stringify(dnaData.radarData),
        answers: JSON.stringify(answers),
      },
      create: {
        userId: session.user.id,
        title: dnaData.title,
        slogan: dnaData.slogan,
        tags: JSON.stringify(dnaData.tags),
        radarData: JSON.stringify(dnaData.radarData),
        answers: JSON.stringify(answers),
      },
    });

    return NextResponse.json({ code: 0, data: dna });
  } catch (error) {
    console.error("DNA generation error:", error);
    // Use fallback on any error
    const dnaData = generateFallbackDna(answers);
    const dna = await prisma.dnaProfile.upsert({
      where: { userId: session.user.id },
      update: {
        title: dnaData.title,
        slogan: dnaData.slogan,
        tags: JSON.stringify(dnaData.tags),
        radarData: JSON.stringify(dnaData.radarData),
        answers: JSON.stringify(answers),
      },
      create: {
        userId: session.user.id,
        title: dnaData.title,
        slogan: dnaData.slogan,
        tags: JSON.stringify(dnaData.tags),
        radarData: JSON.stringify(dnaData.radarData),
        answers: JSON.stringify(answers),
      },
    });
    return NextResponse.json({ code: 0, data: dna });
  }
}

function generateFallbackDna(answers: Record<string, string>) {
  const flavor = answers.flavor || "什么都吃";
  const vibe = answers.vibe || "随意自在";

  const titleMap: Record<string, string> = {
    "麻辣": "麻辣探险家", "清淡": "清新养生派", "甜口": "甜蜜美食家",
    "酸辣": "酸辣狂热者", "咸鲜": "咸鲜品味师", "什么都吃": "百味鉴赏家",
  };

  const spicyMap: Record<string, number> = {
    "麻辣": 90, "酸辣": 75, "咸鲜": 40, "清淡": 15, "甜口": 20, "什么都吃": 55,
  };

  return {
    title: titleMap[flavor] || "美食探索者",
    slogan: `${vibe}的${titleMap[flavor] || "美食达人"}，用味蕾感知世界`,
    tags: [flavor, vibe, answers.dietary || "无忌口", answers.budget || "看心情", answers.industry || "跨界"].filter(Boolean),
    radarData: {
      spicy: spicyMap[flavor] || 50,
      sweet: flavor === "甜口" ? 85 : 40,
      fresh: flavor === "清淡" ? 90 : 45,
      adventurous: flavor === "什么都吃" ? 85 : 55,
      social: vibe === "热闹聚会" ? 90 : vibe === "安静聊天" ? 40 : 60,
      refined: vibe === "精致仪式感" ? 90 : 50,
    },
  };
}
