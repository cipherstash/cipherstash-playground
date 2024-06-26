# CipherStash Proxy Playground

This is a playground for CipherStash Proxy. It is a collection of microservices that demonstrates how to use CipherStash Proxy to monitor and secure your data in a PostgreSQL database.

## Getting started

Make sure that you have Docker installed on your machine. You can download Docker from [here](https://www.docker.com/products/docker-desktop).
Configure the Proxy config file located at `config/cipherstash-proxy.toml` to your desired configuration, noting that the default configuration is already set up to work with the other services in the playground.

Once you have Docker installed, run the following command to start the playground:

```bash
docker compose up
```

This will start the following services as individual containers using a shared network, and mapping the necessary ports to your local machine:

- **CipherStash Proxy** - a proxy that sits between your application and your database to monitor and secure your data
- **PostgreSQL** - a database that stores dummy data
- **JavaScript application** - very light weight application that demonstrates how to use CipherStash Proxy
- **Grafana** - used for visualizing metrics and logs
- **Prometheus** - used for monitoring
- **Loki** - used for log aggregation
- **Promtail** - used for log collection

### Accessing the services

Access the services at the following endpoints:

- CipherStash Proxy: `postgres://postgres:password@localhost:6432/postgres`
- PostgreSQL: `postgres://postgres:password@localhost:5432/postgres`
- [JavaScript application](http://localhost:8080)
  - The application responds to GET requests at `/` and triggers a data access event by executing a query against the database.
- [Grafana](http://localhost:3000)

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

The application is configured to connect to Postgres, just like any other application would, but instead of connecting directly to the database, it connects to CipherStash Proxy.

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

You can read more about CipherStash Proxy in the [official documentation](https://cipherstash.com/docs/reference/proxy).

### Data access events

CipherStash Proxy produces unique logs to `stdout` for each data access event.
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

CipherStash Proxy exposes metrics in Prometheus format at `http://localhost:9930/metrics`.
Some of these metrics can be visualized in Grafana as an example of how you can monitor CipherStash Proxy.

## Adding your own application

You can add your own application to the playground by adding a new service to the `docker-compose.yml` file, and configuring it to connect to CipherStash Proxy.

For example, if you have an application that connects to a PostgreSQL database with a connection string defined by an environment variable `DATABASE_URL`, you can configure it to connect to CipherStash Proxy by changing the `DATABASE_URL` value to route through CipherStash Proxy.

```yaml
my-application:
  image: myapp/my-application:latest
  ports:
    - "4000:4000"
  environment:
    - DATABASE_URL=postgres://postgres:password@cipherstash-proxy:6432/postgres
```

### Connecting to your own database

Configure CipherStash Proxy by editing the `config/cipherstash-proxy.toml` file, and updating the `[database]` section with the connection details for your database.

```toml
[database]
name = "postgres"
port = 5432
host = "db"
username = "postgres"
password = "password"
```

### Restarting the services

If you make changes to the `docker-compose.yml` file or any config files, you will need to restart the services by running the following commands:

```bash
docker compose down
docker compose up --build
```

## Cleaning up

To stop the playground and remove all containers, run the following command:

```bash
docker compose down
```

This will stop and remove all containers, networks, and volumes created by the playground.




### Testing

The playground includes [Toxiproxy](https://github.com/Shopify/toxiproxy), a framework for simulating network conditions.


