FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npx next build
EXPOSE 3000
CMD ["sh", "-c", "npm start"]
