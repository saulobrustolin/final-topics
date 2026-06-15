FROM node:20-alpine AS dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:20-alpine AS build-env
WORKDIR /app
COPY package.json package-lock.json babel.config.json ./
COPY --from=dependencies-env /app/node_modules ./node_modules
COPY src ./src
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache ffmpeg
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
