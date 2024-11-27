/*
  Warnings:

  - You are about to drop the column `key` on the `PushSubscription` table. All the data in the column will be lost.
  - Added the required column `auth` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expirationTime` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "key",
ADD COLUMN     "auth" TEXT NOT NULL,
DROP COLUMN "expirationTime",
ADD COLUMN     "expirationTime" INTEGER NOT NULL;
