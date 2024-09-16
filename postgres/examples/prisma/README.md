# cipherstash-prisma-orm-example

To install dependencies:

```bash
bun install
```

## Environment variables

Copy the `.env.example` file to the two additional files:

- `.env.local` - Used for the application `index.ts` file and connects through CipherStash Proxy
- `.env` - Used for the Prisma Migrations

Edit the `.env.local` file to include the following environment variables:

```bash
DATABASE_URL=postgres://postgres:password@localhost:6432/postgres
```

Edit the `.env` file to include the following environment variables:

```bash
DATABASE_URL=postgres://postgres:password@localhost:5432/postgres
```

The only difference is the port number.

## Running migrations

To run migrations run the following command:

```bash
bun prisma migrate dev
```

This will run the migrations against the local database.

## Running the application

Run the following command to start the application:

```bash
bun run index.ts
```
