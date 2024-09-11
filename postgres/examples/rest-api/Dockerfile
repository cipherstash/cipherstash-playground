FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY index.ts ./

RUN bun install

EXPOSE 8080

CMD ["bun", "run", "index.ts"]