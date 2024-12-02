-- AlterTable
ALTER TABLE "_EventTags" ADD CONSTRAINT "_EventTags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EventTags_AB_unique";

-- AlterTable
ALTER TABLE "_ExpenseTags" ADD CONSTRAINT "_ExpenseTags_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ExpenseTags_AB_unique";
