#!/usr/bin/env bash
set -euo pipefail

APP_NAME="lms-front"
IMAGE_NAME="${APP_NAME}:latest"
CONTAINER_NAME="${APP_NAME}"
HOST_PORT="3000"
CONTAINER_PORT="3000"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker topilmadi. Docker ni o'rnating va qayta urinib ko'ring." >&2
  exit 1
fi

TEMP_DOCKERFILE=""
DOCKERFILE_PATH="Dockerfile"

if [ ! -f "${DOCKERFILE_PATH}" ]; then
  TEMP_DOCKERFILE=".Dockerfile.deploy"
  DOCKERFILE_PATH="${TEMP_DOCKERFILE}"

  cat > "${TEMP_DOCKERFILE}" <<'DOCKERFILE'
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
DOCKERFILE

  echo "Info: Dockerfile topilmadi. Vaqtinchalik ${TEMP_DOCKERFILE} ishlatiladi."
fi

echo "[1/3] Image build qilinmoqda: ${IMAGE_NAME}"
docker build -f "${DOCKERFILE_PATH}" -t "${IMAGE_NAME}" .

echo "[2/3] Eski container tekshirilmoqda: ${CONTAINER_NAME}"
if docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

echo "[3/3] Yangi container ishga tushirilmoqda"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}" >/dev/null

if [ -n "${TEMP_DOCKERFILE}" ] && [ -f "${TEMP_DOCKERFILE}" ]; then
  rm -f "${TEMP_DOCKERFILE}"
fi

echo "Tayyor. Container: ${CONTAINER_NAME}"
echo "URL: http://localhost:${HOST_PORT}"
echo "Loglar: docker logs -f ${CONTAINER_NAME}"
