-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "foundedYear" INTEGER,
    "bio" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "realName" TEXT,
    "debutYear" INTEGER,
    "bio" TEXT,
    "imageUrl" TEXT,
    "labelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistNews" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtistNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "coverArt" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "albumId" TEXT,
    "releaseYear" INTEGER,
    "coverArt" TEXT,
    "lyricsKo" TEXT,
    "lyricsEn" TEXT,
    "lyricsRomanized" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongCredit" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "SongCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LyricAnnotation" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "termId" TEXT,
    "lineIndex" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LyricAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodedTerm" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodedTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermDefinition" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "example" TEXT,
    "votesUp" INTEGER NOT NULL DEFAULT 0,
    "votesDown" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TermDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuggestedEdit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "currentVal" TEXT,
    "suggestedVal" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestedEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "flag" TEXT,
    "timezone" TEXT,
    "currency" TEXT,
    "color" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistCity" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'popular-in',

    CONSTRAINT "ArtistCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityEvent" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "artistId" TEXT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "eventDate" TEXT,
    "ticketUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'concert',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongCity" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SongCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingCache" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'daily',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSignal" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "termId" TEXT,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_slug_key" ON "Label"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");

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
CREATE INDEX "GroupMembership_groupId_idx" ON "GroupMembership"("groupId");

-- CreateIndex
CREATE INDEX "GroupMembership_memberId_idx" ON "GroupMembership"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_slug_key" ON "Album"("slug");

-- CreateIndex
CREATE INDEX "Album_artistId_idx" ON "Album"("artistId");

-- CreateIndex
CREATE INDEX "Album_releaseYear_idx" ON "Album"("releaseYear");

-- CreateIndex
CREATE UNIQUE INDEX "Song_slug_key" ON "Song"("slug");

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
CREATE INDEX "LyricAnnotation_songId_idx" ON "LyricAnnotation"("songId");

-- CreateIndex
CREATE INDEX "LyricAnnotation_termId_idx" ON "LyricAnnotation"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "CodedTerm_slug_key" ON "CodedTerm"("slug");

-- CreateIndex
CREATE INDEX "TermDefinition_termId_idx" ON "TermDefinition"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_entityType_entityId_idx" ON "Favorite"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityType_entityId_key" ON "Favorite"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "SuggestedEdit_userId_idx" ON "SuggestedEdit"("userId");

-- CreateIndex
CREATE INDEX "SuggestedEdit_status_idx" ON "SuggestedEdit"("status");

-- CreateIndex
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

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

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistNews" ADD CONSTRAINT "ArtistNews_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongCredit" ADD CONSTRAINT "SongCredit_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongCredit" ADD CONSTRAINT "SongCredit_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LyricAnnotation" ADD CONSTRAINT "LyricAnnotation_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LyricAnnotation" ADD CONSTRAINT "LyricAnnotation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "CodedTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermDefinition" ADD CONSTRAINT "TermDefinition_termId_fkey" FOREIGN KEY ("termId") REFERENCES "CodedTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestedEdit" ADD CONSTRAINT "SuggestedEdit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistCity" ADD CONSTRAINT "ArtistCity_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistCity" ADD CONSTRAINT "ArtistCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityEvent" ADD CONSTRAINT "CityEvent_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityEvent" ADD CONSTRAINT "CityEvent_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongCity" ADD CONSTRAINT "SongCity_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongCity" ADD CONSTRAINT "SongCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSignal" ADD CONSTRAINT "ContentSignal_termId_fkey" FOREIGN KEY ("termId") REFERENCES "CodedTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

