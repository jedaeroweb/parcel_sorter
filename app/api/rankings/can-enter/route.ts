import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { score } = await req.json();

  const row = db.prepare(`
    SELECT score
    FROM rankings
    ORDER BY score DESC, created_at ASC
    LIMIT 1 OFFSET 99
  `).get() as { score: number } | undefined;

  return NextResponse.json({
    canEnter: !row || score > row.score,
  });
}