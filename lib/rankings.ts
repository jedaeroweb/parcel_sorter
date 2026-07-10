import { db } from "./db";

const PAGE_SIZE = 10;

export function getRankings(page: number) {
  const offset = (page - 1) * PAGE_SIZE;

  const rankings = db
    .prepare(
      `
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
    `
    )
    .all(PAGE_SIZE, offset);

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