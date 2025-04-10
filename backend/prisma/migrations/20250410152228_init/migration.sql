-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "winner" TEXT NOT NULL,
    "p1" TEXT NOT NULL,
    "p2" TEXT NOT NULL,
    "p1score" INTEGER NOT NULL,
    "p2score" INTEGER NOT NULL,
    "p1Elo" INTEGER NOT NULL,
    "p2Elo" INTEGER NOT NULL,
    "p1Diff" INTEGER NOT NULL,
    "p2Diff" INTEGER NOT NULL,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    CONSTRAINT "MatchHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MatchHistory" ("accountId", "id", "p1", "p1Diff", "p1Elo", "p1score", "p2", "p2Diff", "p2Elo", "p2score", "winner") SELECT "accountId", "id", "p1", "p1Diff", "p1Elo", "p1score", "p2", "p2Diff", "p2Elo", "p2score", "winner" FROM "MatchHistory";
DROP TABLE "MatchHistory";
ALTER TABLE "new_MatchHistory" RENAME TO "MatchHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
