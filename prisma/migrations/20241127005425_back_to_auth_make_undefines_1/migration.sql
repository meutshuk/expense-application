/*
  Warnings:

  - The `expirationTime` column on the `PushSubscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[endpoint]` on the table `PushSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "expirationTime",
ADD COLUMN     "expirationTime" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
