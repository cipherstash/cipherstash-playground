# CipherStash Proxy Playground

This is a playground for the CipherStash Proxy. It is a collection of microservices that demonstrate how to use the CipherStash Proxy to monitor and secure your data in a PostgreSQL database.

## Getting Started

To get started, you will need to have Docker installed on your machine. You can download Docker from [here](https://www.docker.com/products/docker-desktop).
Configure the Proxy config file located at `config/cipherstash-proxy.toml` to your desired configuration.

Once you have Docker installed, you can run the following command to start the playground:

```bash
docker compose up
```

This will start the following services:

- CipherStash Proxy
- PostgreSQL (this is currently hosted on Supabase and not on your local machine)
- Grafana
- Prometheus
- Loki
- Promtail
- Postgres

You can access the following services:

- CipherStash Proxy: postgres://postgres:password@localhost:6432/postgres
- Grafana: http://localhost:3000
  - Grafana Username: admin
  - Grafana Password: admin

## Grafana Dashboards

The playground comes with a pre-configured Grafana dashboard that shows the following metrics:

- Data access events which are logged to Loki
- Various metrics from the CipherStash Proxy

You can access the dashboard by logging into Grafana and selecting the `CipherStash Proxy` dashboard and this will also be the default dashboard.

## Example application (in progress)

The playground also comes with an example application that demonstrates how to use the CipherStash Proxy in a Node.js application. This is currently a work in progress and will be available soon.
