FROM --platform=linux/amd64 oven/bun:latest

WORKDIR /app
COPY . .
# install dependencies
RUN bun install

CMD ["./entrypoint.sh"]