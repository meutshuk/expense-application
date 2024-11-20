/*
  Warnings:

  - Added the required column `token` to the `InvitedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvitedUser" ADD COLUMN     "token" TEXT NOT NULL;
