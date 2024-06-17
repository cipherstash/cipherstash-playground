-- CreateTable
CREATE TABLE IF NOT EXISTS users (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,

  PRIMARY KEY ("id")
);

-- Seed
INSERT INTO users (id, name, email) VALUES ('1', 'CJ', 'cj@cipherstash.com');
INSERT INTO users (id, name, email) VALUES ('2', 'Dan', 'dan@cipherstash.com');
