-- AlterTable
ALTER TABLE "LyricAnnotation" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "AnnotationVote" (
    "id" TEXT NOT NULL,
    "annotationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnotationVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnotationComment" (
    "id" TEXT NOT NULL,
    "annotationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnotationComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnnotationVote_annotationId_idx" ON "AnnotationVote"("annotationId");

-- CreateIndex
CREATE INDEX "AnnotationVote_userId_idx" ON "AnnotationVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnotationVote_annotationId_userId_key" ON "AnnotationVote"("annotationId", "userId");

-- CreateIndex
CREATE INDEX "AnnotationComment_annotationId_idx" ON "AnnotationComment"("annotationId");

-- CreateIndex
CREATE INDEX "AnnotationComment_userId_idx" ON "AnnotationComment"("userId");

-- CreateIndex
CREATE INDEX "LyricAnnotation_userId_idx" ON "LyricAnnotation"("userId");

-- AddForeignKey
ALTER TABLE "LyricAnnotation" ADD CONSTRAINT "LyricAnnotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationVote" ADD CONSTRAINT "AnnotationVote_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "LyricAnnotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationVote" ADD CONSTRAINT "AnnotationVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationComment" ADD CONSTRAINT "AnnotationComment_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "LyricAnnotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationComment" ADD CONSTRAINT "AnnotationComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
