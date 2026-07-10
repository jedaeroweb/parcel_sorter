CREATE TABLE rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,

  stage INTEGER NOT NULL,
  accuracy REAL NOT NULL,

  play_time INTEGER NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rankings_score
ON rankings(score DESC);

CREATE INDEX idx_rankings_created_at
ON rankings(created_at DESC);