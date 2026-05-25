-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mailingAddress" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "rewardsEnrolled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "webPushEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "PointEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointEvent_userId_idx" ON "PointEvent"("userId");

-- CreateIndex
CREATE INDEX "PointEvent_createdAt_idx" ON "PointEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PointEvent_userId_type_idx" ON "PointEvent"("userId", "type");

-- AddForeignKey
ALTER TABLE "PointEvent" ADD CONSTRAINT "PointEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
