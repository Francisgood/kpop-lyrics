# Aegyo Arena Artist Management Skill

## Purpose
Maintain, update, and manage artist information in the Aegyo Arena platform.

## Capabilities
- Create new artist profiles
- Update existing artist information
- Manage group memberships
- Track artist collaborations
- Handle artist images and metadata

## Workflow

### 1. Artist Profile Creation
- Validate artist information
- Generate unique slug
- Ensure required fields are populated
- Cross-reference with existing database

### 2. Metadata Updates
- Track changes in:
  - Stage name
  - Real name
  - Debut year
  - Label affiliation
  - Group memberships
  - Biography

### 3. Collaboration Tracking
- Record cross-artist collaborations
- Update song credits
- Manage feature credits

### 4. Image and Visual Management
- Validate image URLs
- Ensure high-resolution images
- Maintain image rights and attribution

### 5. Integrity Checks
- Prevent duplicate entries
- Maintain referential integrity
- Validate cross-references

## Tools Required
- Prisma ORM
- TypeScript
- Next.js API routes
- Image validation libraries

## Deployment Considerations
- Use database transactions
- Implement robust error handling
- Log all changes for audit purposes

## Example Workflow
```typescript
async function updateArtist(artistId: string, updates: ArtistUpdateInput) {
  // Validation
  // Update logic
  // Integrity checks
  // Logging
}
```

## Potential Future Enhancements
- AI-assisted metadata completion
- Automated cross-reference validation
- Image recognition for artist verification