FROM --platform=linux/amd64 postgres:16 as db

# Install pgvector
RUN apt-get update && apt-get install -y git make build-essential
RUN apt-get install -y postgresql-server-dev-16
RUN git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git
WORKDIR /pgvector
RUN make
RUN make install

WORKDIR /app
COPY init.sh /docker-entrypoint-initdb.d
COPY dump.sql ./scripts/db/dump.sql
