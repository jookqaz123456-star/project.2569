# Generic container — works on Railway, Fly.io, Cloud Run, a VPS, etc.
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
ENV DATA_DIR=/app/data
EXPOSE 3000

# --experimental-sqlite enables the built-in node:sqlite module
CMD ["node", "--experimental-sqlite", "server/server.js"]
