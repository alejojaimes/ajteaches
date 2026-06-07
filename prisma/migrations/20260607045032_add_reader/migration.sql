-- CreateTable
CREATE TABLE "Reader" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "githubUrl" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reader_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reader_clerkUserId_key" ON "Reader"("clerkUserId");

-- CreateIndex
CREATE INDEX "Reader_clerkUserId_idx" ON "Reader"("clerkUserId");
