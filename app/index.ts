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

const connect = async () => {
  try {
    await client.connect()
    console.log('Connected to Postgres')
  }
  catch (err) {
    // console.log(err)
  }
}

const app = new Elysia()
	.get('/', async () => {
    console.log('GET /')
    try {
      await connect()
      const res = await client.query('SELECT * FROM users;');
      return res.rows
    }
    catch (err) {
      console.log(err)
      return err
    }
  })
	.listen({
    port: 8080,
    // host: 0.0.0.0,
  })

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)