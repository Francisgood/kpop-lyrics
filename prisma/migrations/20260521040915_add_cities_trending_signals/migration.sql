-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "flag" TEXT,
    "timezone" TEXT,
    "currency" TEXT,
    "color" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArtistCity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'popular-in',
    CONSTRAINT "ArtistCity_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ArtistCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cityId" TEXT NOT NULL,
    "artistId" TEXT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "eventDate" TEXT,
    "ticketUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'concert',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CityEvent_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CityEvent_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SongCity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SongCity_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SongCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrendingCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'daily',
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContentSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "termId" TEXT,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "category" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentSignal_termId_fkey" FOREIGN KEY ("termId") REFERENCES "CodedTerm" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "ArtistCity_cityId_idx" ON "ArtistCity"("cityId");

-- CreateIndex
CREATE INDEX "ArtistCity_artistId_idx" ON "ArtistCity"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistCity_artistId_cityId_type_key" ON "ArtistCity"("artistId", "cityId", "type");

-- CreateIndex
CREATE INDEX "CityEvent_cityId_idx" ON "CityEvent"("cityId");

-- CreateIndex
CREATE INDEX "CityEvent_type_idx" ON "CityEvent"("type");

-- CreateIndex
CREATE INDEX "SongCity_cityId_rank_idx" ON "SongCity"("cityId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "SongCity_songId_cityId_key" ON "SongCity"("songId", "cityId");

-- CreateIndex
CREATE INDEX "TrendingCache_entityType_period_score_idx" ON "TrendingCache"("entityType", "period", "score");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingCache_entityType_entityId_period_key" ON "TrendingCache"("entityType", "entityId", "period");

-- CreateIndex
CREATE INDEX "ContentSignal_entityType_entityId_idx" ON "ContentSignal"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ContentSignal_category_idx" ON "ContentSignal"("category");

-- CreateIndex
CREATE INDEX "ContentSignal_publishedAt_idx" ON "ContentSignal"("publishedAt");

-- CreateIndex
CREATE INDEX "Album_artistId_idx" ON "Album"("artistId");

-- CreateIndex
CREATE INDEX "Album_releaseYear_idx" ON "Album"("releaseYear");

-- CreateIndex
CREATE INDEX "Artist_type_idx" ON "Artist"("type");

-- CreateIndex
CREATE INDEX "Artist_labelId_idx" ON "Artist"("labelId");

-- CreateIndex
CREATE INDEX "ArtistNews_artistId_idx" ON "ArtistNews"("artistId");

-- CreateIndex
CREATE INDEX "ArtistNews_publishedAt_idx" ON "ArtistNews"("publishedAt");

-- CreateIndex
CREATE INDEX "ArtistNews_category_idx" ON "ArtistNews"("category");

-- CreateIndex
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_entityType_entityId_idx" ON "Favorite"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_memberId_idx" ON "GroupMembership"("memberId");

-- CreateIndex
CREATE INDEX "LyricAnnotation_songId_idx" ON "LyricAnnotation"("songId");

-- CreateIndex
CREATE INDEX "LyricAnnotation_termId_idx" ON "LyricAnnotation"("termId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Song_albumId_idx" ON "Song"("albumId");

-- CreateIndex
CREATE INDEX "Song_viewCount_idx" ON "Song"("viewCount");

-- CreateIndex
CREATE INDEX "Song_releaseYear_idx" ON "Song"("releaseYear");

-- CreateIndex
CREATE INDEX "SongCredit_songId_idx" ON "SongCredit"("songId");

-- CreateIndex
CREATE INDEX "SongCredit_artistId_idx" ON "SongCredit"("artistId");

-- CreateIndex
CREATE INDEX "SongCredit_role_idx" ON "SongCredit"("role");

-- CreateIndex
CREATE INDEX "SuggestedEdit_userId_idx" ON "SuggestedEdit"("userId");

-- CreateIndex
CREATE INDEX "SuggestedEdit_status_idx" ON "SuggestedEdit"("status");

-- CreateIndex
CREATE INDEX "TermDefinition_termId_idx" ON "TermDefinition"("termId");
