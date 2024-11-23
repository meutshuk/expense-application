/*
  Warnings:

  - You are about to drop the column `token` on the `InvitedUser` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `InvitedUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InvitedUser" DROP CONSTRAINT "InvitedUser_eventId_fkey";

-- AlterTable
ALTER TABLE "InvitedUser" DROP COLUMN "token",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
