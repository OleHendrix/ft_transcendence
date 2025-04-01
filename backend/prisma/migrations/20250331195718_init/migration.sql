/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `blockedId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `blockerId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `account1Id` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `account2Id` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `blockedUsername` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockerUsername` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username1` to the `ChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username2` to the `ChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverUsername` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderUsername` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "totpSecret" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "loses" INTEGER NOT NULL DEFAULT 0,
    "online" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Account" ("draws", "email", "loses", "online", "password", "totpSecret", "username", "wins") SELECT "draws", "email", "loses", "online", "password", "totpSecret", "username", "wins" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE TABLE "new_Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "blockerUsername" TEXT NOT NULL,
    "blockedUsername" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Block_blockerUsername_fkey" FOREIGN KEY ("blockerUsername") REFERENCES "Account" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Block_blockedUsername_fkey" FOREIGN KEY ("blockedUsername") REFERENCES "Account" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Block" ("createdAt", "id") SELECT "createdAt", "id" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE TABLE "new_ChatSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username1" TEXT NOT NULL,
    "username2" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_username1_fkey" FOREIGN KEY ("username1") REFERENCES "Account" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_username2_fkey" FOREIGN KEY ("username2") REFERENCES "Account" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChatSession" ("createdAt", "id") SELECT "createdAt", "id" FROM "ChatSession";
DROP TABLE "ChatSession";
ALTER TABLE "new_ChatSession" RENAME TO "ChatSession";
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderUsername" TEXT NOT NULL,
    "receiverUsername" TEXT NOT NULL,
    "chatSessionId" INTEGER NOT NULL,
    CONSTRAINT "Message_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_senderUsername_fkey" FOREIGN KEY ("senderUsername") REFERENCES "Account" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_receiverUsername_fkey" FOREIGN KEY ("receiverUsername") REFERENCES "Account" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("chatSessionId", "content", "id", "timestamp") SELECT "chatSessionId", "content", "id", "timestamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
