import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  db.prepare(`
    INSERT INTO rankings (
      nickname,
      score,
      stage,
      accuracy,
      play_time
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    body.nickname,
    body.score,
    body.stage,
    body.accuracy,
    body.playTime
  );

  return NextResponse.json({
    ok: true,
  });
}