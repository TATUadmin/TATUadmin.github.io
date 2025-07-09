-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAnalytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "analyticsId" TEXT NOT NULL,

    CONSTRAINT "DailyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewerSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "firstView" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastView" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewerSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_itemId_key" ON "Analytics"("itemId");

-- CreateIndex
CREATE INDEX "Analytics_itemId_idx" ON "Analytics"("itemId");

-- CreateIndex
CREATE INDEX "DailyAnalytics_analyticsId_idx" ON "DailyAnalytics"("analyticsId");

-- CreateIndex
CREATE INDEX "DailyAnalytics_date_idx" ON "DailyAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAnalytics_analyticsId_date_key" ON "DailyAnalytics"("analyticsId", "date");

-- CreateIndex
CREATE INDEX "ViewerSession_itemId_idx" ON "ViewerSession"("itemId");

-- CreateIndex
CREATE INDEX "ViewerSession_sessionId_idx" ON "ViewerSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewerSession_sessionId_itemId_key" ON "ViewerSession"("sessionId", "itemId");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAnalytics" ADD CONSTRAINT "DailyAnalytics_analyticsId_fkey" FOREIGN KEY ("analyticsId") REFERENCES "Analytics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
