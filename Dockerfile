FROM node:22-bookworm-slim AS frontend
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/Backend
COPY Backend/package*.json ./
RUN npm ci --omit=dev
COPY Backend/src/ ./src/
COPY --from=frontend /app/Frontend/dist /app/Frontend/dist
USER node
EXPOSE 3001
CMD ["node", "-e", "process.env.JWT_SECRETO = require('node:crypto').randomBytes(48).toString('hex'); require('./src/servidor.js');"]
