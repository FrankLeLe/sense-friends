import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await request.json();

  if (!data) {
    return NextResponse.json({ error: "data is required" }, { status: 400 });
  }

  // Parse base64 data (supports data URI format or raw base64)
  let base64 = data;
  let ext = "png";

  if (data.startsWith("data:")) {
    const match = data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 });
    }
    ext = match[1];
    base64 = match[2];
  }

  const buffer = Buffer.from(base64, "base64");
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;

  return NextResponse.json({ code: 0, data: { url } });
}
