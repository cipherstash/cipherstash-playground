FROM --platform=linux/amd64 postgres:16 as db
WORKDIR /app
COPY init.sh /docker-entrypoint-initdb.d
COPY dump.sql ./scripts/db/dump.sql
