/*
  Warnings:

  - You are about to drop the column `auth` on the `PushSubscription` table. All the data in the column will be lost.
  - Added the required column `key` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "auth",
ADD COLUMN     "key" TEXT NOT NULL;
