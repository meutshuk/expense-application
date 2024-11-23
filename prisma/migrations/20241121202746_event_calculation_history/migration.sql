-- CreateTable
CREATE TABLE "EventCalculationHistory" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "history" JSONB NOT NULL,

    CONSTRAINT "EventCalculationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventCalculationHistory" ADD CONSTRAINT "EventCalculationHistory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCalculationHistory" ADD CONSTRAINT "EventCalculationHistory_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
