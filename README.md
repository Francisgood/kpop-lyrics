# Aegyo Arena: K-Pop Lyrics & Artist Collaboration Network

## Project Overview
Aegyo Arena is a comprehensive K-pop lyrics, annotations, and artist collaboration platform.

## Prerequisites
- Node.js (v22+)
- npm
- Git

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

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Run Database Migrations
npx prisma migrate deploy

# Seed Initial Database
npx prisma db seed
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
- Use a production-ready database (consider PostgreSQL for scaling)
- Set up proper security headers and CORS configurations

## Tech Stack
- Next.js 15
- React 19
- Prisma ORM
- SQLite (development)
- TypeScript

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.