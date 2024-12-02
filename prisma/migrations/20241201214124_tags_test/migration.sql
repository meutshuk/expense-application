-- DropForeignKey
ALTER TABLE "Tags" DROP CONSTRAINT "Tags_eventId_fkey";

-- CreateTable
CREATE TABLE "_EventTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ExpenseTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventTags_AB_unique" ON "_EventTags"("A", "B");

-- CreateIndex
CREATE INDEX "_EventTags_B_index" ON "_EventTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpenseTags_AB_unique" ON "_ExpenseTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpenseTags_B_index" ON "_ExpenseTags"("B");

-- AddForeignKey
ALTER TABLE "_EventTags" ADD CONSTRAINT "_EventTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTags" ADD CONSTRAINT "_EventTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpenseTags" ADD CONSTRAINT "_ExpenseTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpenseTags" ADD CONSTRAINT "_ExpenseTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
