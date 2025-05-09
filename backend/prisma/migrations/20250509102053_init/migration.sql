/*
  Warnings:

  - You are about to drop the column `p1score` on the `MatchHistory` table. All the data in the column will be lost.
  - You are about to drop the column `p2score` on the `MatchHistory` table. All the data in the column will be lost.
  - Added the required column `p1Score` to the `MatchHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p2Score` to the `MatchHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "winner" TEXT NOT NULL,
    "p1" TEXT NOT NULL,
    "p2" TEXT NOT NULL,
    "p1Score" INTEGER NOT NULL,
    "p2Score" INTEGER NOT NULL,
    "p1Elo" INTEGER NOT NULL,
    "p2Elo" INTEGER NOT NULL,
    "p1Diff" INTEGER NOT NULL,
    "p2Diff" INTEGER NOT NULL,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,
    CONSTRAINT "MatchHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MatchHistory" ("accountId", "id", "p1", "p1Diff", "p1Elo", "p2", "p2Diff", "p2Elo", "time", "winner") SELECT "accountId", "id", "p1", "p1Diff", "p1Elo", "p2", "p2Diff", "p2Elo", "time", "winner" FROM "MatchHistory";
DROP TABLE "MatchHistory";
ALTER TABLE "new_MatchHistory" RENAME TO "MatchHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
