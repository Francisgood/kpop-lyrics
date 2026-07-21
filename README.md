# Aegyo Arena: K-Pop Lyrics & Artist Collaboration Network

## Project Overview
Aegyo Arena is a comprehensive K-pop lyrics, annotations, and artist collaboration platform.

## Prerequisites
- Node.js (v22+)
- npm
- Git
- PostgreSQL (Production)
- SQLite (Development)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Francisgood/kpop-lyrics.git
cd kpop-lyrics
```

### 2. Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```
2. Edit `.env` and replace placeholder values with your specific configurations

### 3. Database Setup

#### Development (SQLite)
```bash
# Generate Prisma Client
npx prisma generate

# Run Database Migrations
npx prisma migrate deploy

# Seed Initial Database
npx prisma db seed
```

#### Production (PostgreSQL)
1. Create a PostgreSQL database
2. Update `.env` with your database credentials
3. Set environment variables:
```bash
export DATABASE_PROVIDER=postgresql
export DATABASE_URL="postgresql://username:password@host:port/database"
```

4. Run production database setup
```bash
# Generate Prisma Client
npx prisma generate

# Run Migrations
npx prisma migrate deploy

# Seed Production Database
npx prisma db seed

# Verify Database
npx prisma migrate status
```

##### Production Database Best Practices
- Use connection pooling
- Enable SSL for database connections
- Implement connection retry logic
- Use environment-specific migration strategies

### 4. Install Dependencies
```bash
npm install
```

### 5. Development Server
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment Considerations
- Ensure all environment variables are properly configured
- Set up proper security headers and CORS configurations
- Use PostgreSQL for production scalability
- Implement robust error logging and monitoring

## Tech Stack
- Next.js 15
- React 19
- Prisma ORM
- PostgreSQL
- TypeScript

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## BTS Giveaway Draw Operations

The frozen public roster commitment, deterministic Chainlink VRF finalizer, verifier, and operator handoff are documented in [docs/giveaway-draw-runbook.md](docs/giveaway-draw-runbook.md). Never commit the private roster or candidate email mapping.

## License
Distributed under the MIT License. See `LICENSE` for more information.
