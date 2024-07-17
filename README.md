# CipherStash Proxy Playground

This is a playground for CipherStash Proxy. It is a collection of microservices that demonstrates how to use CipherStash Proxy to monitor and secure your data in a PostgreSQL database.

## Table of Contents

- [Getting started](#getting-started)
- [Grafana dashboards](#grafana-dashboards)
- [Web application](#web-application)
- [CipherStash Proxy](#cipherstash-proxy)
  - [Data access events](#data-access-events)
  - [Metrics](#metrics)
- [Adding your own application](#adding-your-own-application)
  - [Connecting to your own database](#connecting-to-your-own-database)
  - [Restarting the services](#restarting-the-services)
- [Using CipherStash Encrypt](#using-cipherstash-encrypt)
  - [Step 1: Log in to the CipherStash CLI](#step-1-log-in-to-the-cipherstash-cli)
  - [Step 2: Create a dataset](#step-2-create-a-dataset)
  - [Step 3: Create a client key](#step-3-create-a-client-key)
  - [Step 4: Upload the playground dataset configuration](#step-4-upload-the-playground-dataset-configuration)
  - [Step 5: Update the CipherStash Proxy configuration and restart the services](#step-5-update-the-cipherstash-proxy-configuration-and-restart-the-services)
  - [Step 6: Encrypting data](#step-6-encrypting-data)
  - [Step 7: Removing the plaintext data](#step-7-removing-the-plaintext-data)
  - [Step 8: Enable searchable encryption in use](#step-8-enable-searchable-encryption-in-use)
    - [Verifying the setup](#verifying-the-setup)
  - [Enabling CipherStash Encrypt in your own application](#enabling-cipherstash-encrypt-in-your-own-application)
- [Simulating network conditions](#simulating-network-conditions)
- [Additional example applications](#additional-example-applications)
- [Cleaning up](#cleaning-up)

## Getting started

Make sure that you have Docker installed on your machine. You can download Docker from [here](https://www.docker.com/products/docker-desktop).
Configure the Proxy config file located at `config/cipherstash-proxy.toml` to your desired configuration, noting that the default configuration is already set up to work with the other services in the playground.

Once you have Docker installed, run the following command to start the playground:

```bash
docker compose up
```

Note, the playground is a continuous work in progress so you may need to rebuild the non-published images by running the following command:

```bash
docker compose up --build
```

This will start the following services as individual containers using a shared network, and mapping the necessary ports to your local machine:

- **CipherStash Proxy** - Database proxy that secures and monitors data access events.
- **Web application** - [Next.js](https://nextjs.org/) and [Drizzle ORM](https://orm.drizzle.team/) application.
- **PostgreSQL** - [PostgreSQL](https://www.postgresql.org/) database that stores dummy data
- **Grafana** - [Grafana](https://grafana.com/) instance for visualizing metrics and logs
- **Prometheus** - [P8s](https://prometheus.io/) instance for storing metrics
- **Loki** - Grafana's [Loki](https://grafana.com/oss/loki/) instance for storing logs
- **Promtail** - Grafana's [Promtail](https://grafana.com/docs/loki/latest/send-data/promtail/) agent for collecting logs
- **Toxiproxy** - [Toxiproxy](https://github.com/Shopify/toxiproxy) instance for simulating network conditions

### Accessing the services

Access the services at the following endpoints:

- CipherStash Proxy: `postgres://postgres:password@localhost:6432/postgres`
- PostgreSQL: `postgres://postgres:password@localhost:5432/postgres`
- [Web application](http://localhost:8080)
- [Grafana](http://localhost:3000)

## Grafana dashboards

The playground comes with a pre-configured Grafana dashboard that shows the following metrics:

- Data access events which are logged to Loki
- Various metrics from the CipherStash Proxy

## Web application

Accessible at [http://localhost:8080](http://localhost:8080).

The web application is a Next.js application that uses Server Side Rendered (SSR) components with the Drizzle ORM to query the database.
The application highlights the underlying SQL queries that are executed when you interact with the application.

`app/src/lib/db.mjs` contains the database connection configuration, and is set up to connect to the CipherStash Proxy by default.

```javascript
const client = new Client({
  connectionString: `postgres://${username}:${password}@${host}:${port}/${database}`,
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

If you make changes to the `docker-compose.yml` file or any config files, you will need to restart the services by running the following command:

```bash
docker compose restart
```

## Using CipherStash Encrypt

The playground also includes the Postgres dependencies to use CipherStash Encrypt, a searchable encryption in use solution that allows you to encrypt your data at rest, in transit, and most importanly in use.

To use CipherStash Encrypt, you will need to install the [CipherStash CLI](https://cipherstash.com/docs/reference/cli) create a workspace by [creating an account](https://cipherstash.com/signup), [create an access token in the dashboard](https://cipherstash.com/docs/how-to/creating-access-keys), and then follow the steps below.

#### Step 1: Log in to the CipherStash CLI

You'll use the CipherStash CLI to define a dataset that will be used to encrypt and decrypt data.
The dataset will define which database columns should be encrypted and how the data should be indexed.
Make sure you are logged in to the CipherStash CLI before continuing.

```bash
stash login
```

#### Step 2: Create a dataset

Next, you need to create a dataset for tracking what data needs to be encrypted.
To create your first dataset run the following command:

```bash
stash datasets create users --description "playground dataset"
```

The output will look like this:

```text
Dataset created:
ID         : <a UUID style ID>
Name       : users
Description: playground dataset
```

Note down the dataset ID, as you'll need it in the next step.
You can also set a local environment variable to make it easier to use the dataset ID in the next step:

```bash
export CS_DATASET_ID=<your dataset ID>
```

#### Step 3: Create a client key

Client keys are used to generate data keys used for encrypting and decrypting data.

To create a client, use the dataset ID from `Step 2: Create a dataset` to create a client (making sure you substitute your own dataset ID, if you didn't set the environment variable):

```bash
stash clients create --dataset-id $CS_DATASET_ID "playground application"
```

The output will look like this:

```plain
Client created:
Client ID  : <a UUID style ID>
Name       : playground application
Description:
Dataset ID : <your provided dataset ID>

#################################################
#                                               #
#  Copy and store these credentials securely.   #
#                                               #
#  THIS IS THE LAST TIME YOU WILL SEE THE KEY.  #
#                                               #
#################################################

Client ID          : <a UUID style ID>

Client Key [hex]   : <a long hex string>
```

Note down the client key somewhere safe, like a password vault.
You can also set local environment variables to make it easier to use the key info in the next steps:

```bash
export CS_CLIENT_ID=<your client ID>
export CS_CLIENT_KEY=<your client key>
```

#### Step 4: Upload the playground dataset configuration

Run the following command to upload the dataset configuration and replace `$CS_CLIENT_ID` and `$CS_CLIENT_KEY` with the client ID and client key from `Step: 3 Create a client key` if you didn't set the environment variables:

```bash
stash datasets config upload --file config/cipherstash/dataset.yml --client-id $CS_CLIENT_ID --client-key $CS_CLIENT_KEY
```

#### Step 5: Update the CipherStash Proxy configuration and restart the services

Update the `config/cipherstash/cipherstash-proxy.toml` file to include the access key and client key you created in the previous steps.

It will look like this once you've added the access key and client key:

```toml
## For a complete list of configuration options, see the documentation at https://cipherstash.com/docs/reference/proxy

## Sign up for an account to create an access key: https://dashboard.cipherstash.com
workspace_id = "..."
client_access_key = "..."

prometheus_metrics = true

[encryption]
mode = "encrypted"
client_id = "..."
client_key = "..."

[audit]
## If you have a workspace_id and client_access_key
## set subscriber to "cipherstash" to enable Audit.
subscriber = "cipherstash"

[database]
name = "postgres"
username = "postgres"
password = "password"
## Set host to "db" and port to 5432 to enable the database.
## Set host to "toxiproxy" and port to 5433 to enable ToxiProxy.
host = "db"
port = 5432
```

After updating the configuration file, restart the services by running the following commands:

```bash
docker compose restart
```

#### Step 6: Encrypting data

CipherStash Proxy comes with a helper program called `cipherstash-migrator` that you can use to encrypt data.

```
docker compose exec cipherstash-proxy cipherstash-migrator users --columns email --verbose --name postgres --username postgres --password password
```

This command will encrypt the `email` column in the `users` table.

#### Step 7: Removing the plaintext data

After encrypting the data, you can remove the plaintext data from the database.

```
docker compose exec db psql -U postgres -d postgres -c "UPDATE users SET email = 'protected';"
```

Verify that the data has been protected by running the following command:

```
docker compose exec db psql -U postgres -d postgres -c "SELECT id, name, email FROM users;"
```

You should see the email column replaced with `protected`.

#### Step 8: Enable searchable encryption in use

Update the `config/cipherstash/dataset.yml` file to enable searchable encryption in use, by changing the mode from `plaintext-duplicate` to `encrypted`.

```yaml
mode: encrypted
```

Upload the updated dataset configuration by running the following command:

```bash
stash datasets config upload --file config/cipherstash/dataset.yml --client-id $CS_CLIENT_ID --client-key $CS_CLIENT_KEY
```

Restart the services by running the following command:

```bash
docker compose restart
```

##### Verifying the setup

You can now use the JavaScript application to query the database and see the decrypted data.
Navigate to [http://localhost:8080](http://localhost:8080).

You should see the protected, yet decrypted data:

```json
[
  {
    "id": 1,
    "name": "CJ",
    "email": "cj@cipherstash.com"
  },
  {
    "id": 2,
    "name": "Dan",
    "email": "dan@cipherstash.com"
  }
]
```

If you navigate to [http://localhost:8080/dan](http://localhost:8080/dan), you will see the power of CipherStash Encrypt in action, as the application is executing the following query:

```sql
SELECT id, name, email FROM users WHERE email LIKE 'dan%';
```

This query is executed against the encrypted data, and CipherStash Proxy decrypts the data and returns the results.

### Enabling CipherStash Encrypt in your own application

Use the [Getting Started Guide for CipherStash Encrypt](https://cipherstash.com/docs/getting-started/cipherstash-encrypt) to learn how to use CipherStash Encrypt with your own application.

## Simulating network conditions

The playground includes [Toxiproxy](https://github.com/Shopify/toxiproxy), a framework for simulating network conditions.
You can use Toxiproxy to simulate network latency, packet loss, and other network conditions.

CipherStash Proxy is a PostgreSQL pooler and introducting it into your stack can introduce new network conditions that you may not have experienced before.
Toxiproxy can help you simulate these conditions and test how your application behaves.

## Additional example applications

The playground repo includes a variety of example applications that demonstrate how to use CipherStash Proxy with different technologies.

- **REST API Example** - [Elysia](https://elysiajs.com/) REST API example.

If you have an example application that you would like to add to the playground, please open a pull request!

## Cleaning up

To stop the playground and remove all containers, run the following command:

```bash
docker compose down
```

This will stop and remove all containers, networks, and volumes created by the playground.
