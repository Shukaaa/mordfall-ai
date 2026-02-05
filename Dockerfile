FROM oven/bun:alpine

WORKDIR /app

COPY build/ .

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]