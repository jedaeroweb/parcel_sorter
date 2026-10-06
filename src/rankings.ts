import { db } from "./db";

const PAGE_SIZE = 10;

type Ranking = {
  id: number;
  nickname: string;
  score: number;
  stage: number;
  accuracy: number;
  play_time: number;
  created_at: string;
};

export function getRankings(page: number) {
  const offset = (page - 1) * PAGE_SIZE;

const rankings = db
  .prepare(`
    SELECT
      id,
      nickname,
      score,
      stage,
      accuracy,
      play_time,
      created_at
    FROM rankings
    ORDER BY score DESC, created_at ASC
    LIMIT ?
    OFFSET ?
  `)
  .all(PAGE_SIZE, offset) as Ranking[];

  const total = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM rankings
    `
    )
    .get() as { count: number };

  return {
    rankings,
    totalPages: Math.ceil(total.count / PAGE_SIZE),
  };
}