-- CreateTable
CREATE TABLE "MatchHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "winner" TEXT,
    "p1" INTEGER NOT NULL,
    "p2" INTEGER NOT NULL,
    "p1score" INTEGER NOT NULL,
    "p2score" INTEGER NOT NULL,
    "p1Elo" INTEGER NOT NULL,
    "p2Elo" INTEGER NOT NULL,
    "p1Diff" INTEGER NOT NULL,
    "p2Diff" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    CONSTRAINT "MatchHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
