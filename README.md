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

## Simulating network conditions

The playground includes [Toxiproxy](https://github.com/Shopify/toxiproxy), a framework for simulating network conditions.
You can use Toxiproxy to simulate network latency, packet loss, and other network conditions.

CipherStash Proxy is a PostgreSQL pooler and introducting it into your stack can introduce new network conditions that you may not have experienced before.
Toxiproxy can help you simulate these conditions and test how your application behaves.


## Encryption Migration

The CipherStash Encryption Migrator encrypts the data in a table.

Assumes that the table has a corresponding dataset and the columns are configured to be encrypted.

Encryption is handled by CipherStash Proxy.

The "database" connection details need to reference your configured CipherStash Proxy pool
Reuses `ENV` variable defined for CipherStash Proxy for common configuration.


### Example
To run the migrator on the `users` table for the `name` column:

```
docker-compose exec cipherstash-proxy cipherstash-migrator users --columns name
```

### Migrator Options

```
Arguments:
  <TABLE>

Options:
  -k, --primary-key <PRIMARY_KEY>  [env: CS_PRIMARY_KEY=] [default: id]
  -c, --columns <COLUMNS>...       [env: CS_COLUMNS=]
  -H, --host <HOST>                Host address of CipherStash Proxy instance [env: CS_HOST=] [default: 127.0.0.1]
  -P, --port <PORT>                Port of CipherStash Proxy instance [env: CS_PORT=6432] [default: 6432]
  -N, --name <NAME>                Name of CipherStash Proxy pool connected to target database [env: CS_DATABASE__NAME=postgres]
  -U, --username <USERNAME>        [env: CS_USERNAME] [env: CS_DATABASE__USERNAME]
  -p, --password <PASSWORD>        [env: CS_PASSWORD] [env: CS_DATABASE__PASSWORD]
  -b, --batch-size <BATCH_SIZE>    [env: CS_BATCH_SIZE=] [default: 100]
  -d, --dry-run                    Run without update. Data is loaded, but updates are not performed [env: CS_DRY_RUN=]
  -v, --verbose                    Turn on additional logging output [env: CS_VERBOSE=]
  -D, --debug                      Turn on debug output [env: CS_DEBUG=]
  -f, --log-format <LOG_FORMAT>    [env: CS_LOG_FORMAT=] [default: text] [possible values: text, structured]
  -h, --help                       Print help (see more with '--help')
  -V, --version                    Print version
```


## Cleaning up

To stop the playground and remove all containers, run the following command:

```bash
docker compose down
```

This will stop and remove all containers, networks, and volumes created by the playground.













pg_dump --host=127.0.0.1 --format=directory --jobs=4 --username postgres --password --column-inserts --table=users --data-only --dbname postgres > users.sql


pg_dump --format=directory --jobs=4 --column-inserts --table=users --data-only > users.sql




psql -d encrypted_db -f ./data.sql





SELECT * FROM users WHERE id = 1;

INSERT INTO users (name, email) VALUES ('Blah', 'Blah@cipherstash.com');

SELECT name FROM users WHERE id = 101;





WORKSPACE_ID=NP7TKR46WUBPFKIR"


DATASET_ID=36a48452-a650-494e-a3c1-35cc0c5013ec

CLIENT_ID=50dae1c9-137d-4c2d-82b2-78bf2693c716

CLIENT_KEY=a4627031a16b7065726d75746174696f6e900d0502090c0608030004070f010b0a0e6770325f66726f6da16b7065726d75746174696f6e9000080709030c020f040e060d0a05010b6570325f746fa16b7065726d75746174696f6e90070f09020a010e0603000b0c0405080d627033a16b7065726d75746174696f6e98210405081315181e181f02090c181a0a10181c16000b171406070111181d0e18190f181b0d031820121818

stash datasets create users --description "UAT: users"


stash clients create --dataset-id 36a48452-a650-494e-a3c1-35cc0c5013ec "playground"

stash datasets config upload --file /Users/tobyhede/src/cipherstash-proxy-playground/config/dataset.yml --client-id 50dae1c9-137d-4c2d-82b2-78bf2693c716 --client-key a4627031a16b7065726d75746174696f6e900d0502090c0608030004070f010b0a0e6770325f66726f6da16b7065726d75746174696f6e9000080709030c020f040e060d0a05010b6570325f746fa16b7065726d75746174696f6e90070f09020a010e0603000b0c0405080d627033a16b7065726d75746174696f6e98210405081315181e181f02090c181a0a10181c16000b171406070111181d0e18190f181b0d031820121818



client_id = "998b4119-0626-4c2a-8fc9-8a7dfa931732"
client_key = "a4627031a16b7065726d75746174696f6e9004050b0a0f08020e0003010c0d0706096770325f66726f6da16b7065726d75746174696f6e90030d0802060c0a09000f0e070504010b6570325f746fa16b7065726d75746174696f6e90070f09020a010e0603000b0c0405080d627033a16b7065726d75746174696f6e98211001181e0e0b121818110f07021513181d181b0517181a03090d14080c18200604181c00181f0a161819"



stash datasets config upload --file /Users/tobyhede/src/cipherstash-proxy-playground/config/dataset.yml --client-id 998b4119-0626-4c2a-8fc9-8a7dfa931732 --client-key a4627031a16b7065726d75746174696f6e9004050b0a0f08020e0003010c0d0706096770325f66726f6da16b7065726d75746174696f6e90030d0802060c0a09000f0e070504010b6570325f746fa16b7065726d75746174696f6e90070f09020a010e0603000b0c0405080d627033a16b7065726d75746174696f6e98211001181e0e0b121818110f07021513181d181b0517181a03090d14080c18200604181c00181f0a161819




```
SINGLE COLUMN [JSONB]


```


docker exec -it 6f0e49683484 "albatross users --columns name email --dry-run --verbose --batch-size 5"

docker exec -it 6f0e49683484 /bin/sh

    - PG_USER=postgres
      - PG_PASSWORD=password
      - PG_DATABASE=postgres
      - PG_HOST=cipherstash-proxy
      - PG_PORT=6432


 docker-compose exec cipherstash-proxy albatross users --columns name email --dry-run --verbose --batch-size 5 --name postgres --username postgres --password password
