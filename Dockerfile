FROM node:20.16.0-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .
COPY .env .env

RUN pnpm build

ENV NODE_ENV=production

EXPOSE ${PORT}

# 启动应用
CMD ["sh", "-c", "pnpm start --port ${PORT}"]