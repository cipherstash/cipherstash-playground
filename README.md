# CipherStash Proxy Playground

This is a playground for the CipherStash Proxy. It is a collection of microservices that demonstrate how to use the CipherStash Proxy to monitor and secure your data in a PostgreSQL database.

## Getting started

To get started, you will need to have Docker installed on your machine. You can download Docker from [here](https://www.docker.com/products/docker-desktop).
Configure the Proxy config file located at `config/cipherstash-proxy.toml` to your desired configuration, noting that the default configuration is already set up to work with the other services in the playground.

Once you have Docker installed, you can run the following command to start the playground:

```bash
docker compose up
```

This will start the following services:

- CipherStash Proxy - a proxy that sits between your application and your database to monitor and secure your data
- PostgreSQL - a database that stores dummy data
- JavaScript application - very light weight application that demonstrates how to use the CipherStash Proxy
- Grafana - used for visualizing metrics and logs
- Prometheus - used for monitoring
- Loki - used for log aggregation
- Promtail - used for log collection

### Accessing the services

You can access the following services at the following endpoints:

- CipherStash Proxy: `postgres://postgres:password@localhost:6432/postgres`
- PostgreSQL: `postgres://postgres:password@localhost:5432/postgres`
- [JavaScript application](http://localhost:8080)
  - The application responds to GET requests at `/` and triggers a data access event by executing a query against the database.
- [Grafana](http://localhost:3000)
  - Grafana Username: `admin`
  - Grafana Password: `admin`

## Grafana dashboards

The playground comes with a pre-configured Grafana dashboard that shows the following metrics:

- Data access events which are logged to Loki
- Various metrics from the CipherStash Proxy

## JavaScript application

The JavaScript application is a very simple application that demonstrates how to use the CipherStash Proxy.
It is a simple HTTP server that responds to GET requests at `/` and triggers a data access event by executing a query against the database.

```sql
SELECT * FROM users;
```

Note the application is configured to connect to Postgres, just like any other application would, but instead of connecting directly to the database, it connects to the CipherStash Proxy.

```javascript
const client = new Client({
  user: "postgres",
  password: "password",
  host: "cipherstash-proxy",
  port: 6432,
  database: "postgres",
});
```

## CipherStash Proxy

You can read more about the CipherStash Proxy in the [official documentation](https://cipherstash.com/docs/reference/proxy).

### Data access events

The CipherStash Proxy produces unique logs to `stdout` for each data access event.
These logs are then collected by Promtail and sent to Loki for storage.
You can view these logs in Grafana.
The logs contain the following information:

- `id` - a unique identifier for the data access event
- `workspace_id` - the workspace that the data access event belongs to (in this case, `local`)
- `statement_id` - a unique identifier for the statement that triggered the data access event
- `rows_accessed` - the primary key of the rows that were accessed
- `columns_accessed` - the columns that were accessed
- `created_at` - the timestamp of when the data access event occurred

CipherStash Proxy also logs `statement_received` and `statement_completed` events for each statement that is executed against the database.

### Metrics

The CipherStash Proxy exposes metrics in Prometheus format at `http://localhost:8081/metrics`.
These metrics can be visualized in Grafana.
