/*
  Warnings:

  - Added the required column `avatar` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "totpSecret" TEXT,
    "twofa" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "winRate" REAL,
    "tournamentWins" INTEGER NOT NULL DEFAULT 0,
    "elo" INTEGER NOT NULL DEFAULT 400
);
INSERT INTO "new_Account" ("admin", "draws", "elo", "email", "id", "losses", "matchesPlayed", "online", "password", "totpSecret", "tournamentWins", "twofa", "username", "winRate", "wins") SELECT "admin", "draws", "elo", "email", "id", "losses", "matchesPlayed", "online", "password", "totpSecret", "tournamentWins", "twofa", "username", "winRate", "wins" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
CREATE UNIQUE INDEX "Account_avatar_key" ON "Account"("avatar");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
