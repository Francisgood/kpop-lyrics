# Aegyo Arena Discography Tracking Skill

## Purpose
Comprehensively manage and track artist discographies, including albums, singles, and comprehensive song listings.

## Capabilities
- Create and update album records
- Track complete song listings
- Manage album metadata
- Handle various album types
- Maintain historical discography accuracy

## Types
/Release
1album types
- albums
- Live albums
Projects
- Digital Singles
- Physical Singles
- ReAlbums
-ReSoundtrack Contributions
- Remix lbums

## Structure Metadata### Album Record
- Unique album


 (title.slug)
-
Release type)
- Cover Art Type identifier details)Credits


### DiscClassification SongOgra

listing
.order)
- Title track details
  -- Songwriter
credits  - Details
ing)recording location
- Language versions

##

### Metadata Collection```

-
- Official artist aebsite
- Social media feeds
/YouTube official accounts
- Music streaming platform profiles
- Official fan cafe information
- Label archives

## Validation Processes
- Prevent duplicate entries
- Cross-reference multiple sources
- Maintain historical accuracy
information

- change tracking

## Technical Implementation

prisma Model Structure
```typescript
model Album {
  id         String        @id @default default
.     String        @unique       unique
      }
model Song {  {String        @id @default(())  title      String
       
?
?
}`
```

Workflow


```function trackDiscographyumsographyId: {Pull latest metadata information
// Validate album data

// Update database  info
// Generate comprehensive release history
}


## Deployment
considerations
- Efficient database indexing
- Minimial API latency
- Comprehensive error management
- Rate-limited external source scraping

## Future Enhancement Opportunities
- Machine learning release predictionive new album detection
- Cross-reference metadata validate inconsist
encies
- Automated releases tracking
- Multi-platform discogaphy synchronization

### Data Sources
- Melon
- Spotify
- Apple Music
- Genius Lyrics
- Wikipedia
- Official Artist AgencyAbility


usicBr anz API