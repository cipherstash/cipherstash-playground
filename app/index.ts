import { Elysia } from 'elysia'
import pg from 'pg'
const { Client } = pg
 
const client = new Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 6432,
  database: process.env.PG_DATABASE,
})

await client.connect()

const app = new Elysia()
	.get('/', async () => {
    console.log('GET /')
    try {
      const res = await client.query('SELECT id, name, email FROM users;');
      return res.rows
    }
    catch (err) {
      console.log(err)
      return err
    }
  })
  .get('/dan', async () => {
    console.log('GET /')
    try {
      const res = await client.query("SELECT id, name, email FROM users WHERE email LIKE 'dan%';");
      return res.rows
    }
    catch (err) {
      console.log(err)
      return err
    }
  })
	.listen(8080)

console.log(`Demo API running at on port ${app.server?.port}...`)