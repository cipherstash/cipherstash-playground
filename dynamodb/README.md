# CipherStash for DynamoDB Playground

This is a playground for CipherStash for DynamoDB.
CipherStash for DynamoDB is a simple interface for storing and retrieving encrypted data from DynamoDB.

## Table of Contents

- [Supported languages](#supported-languages)
  - [Requesting new language support](#requesting-new-language-support)
- [Prerequisites](#prerequisites)
  - [Step 1 - Create a CipherStash account](#step-1---create-a-cipherstash-account)
  - [Step 2 - Install the CLI](#step-2---install-the-cli)
  - [Step 3 - Create a dataset and client key](#step-3---create-a-dataset-and-client-key)
  - [Step 4 - Init ZeroKMS](#step-4---init-zerokms)
  - [Step 5 - Setting the environment variables](#step-5---setting-the-environment-variables)
    - [Set the environment variables](#set-the-environment-variables)
- [Getting started with the playground](#getting-started-with-the-playground)
  - [Running the application](#running-the-application)
- [Integrating in your application](#integrating-in-your-application)
  - [Configuring a table](#configuring-a-table)
  - [Integrating the SDK in app](#integrating-the-sdk-in-app)
    - [Dependencies](#dependencies)
    - [Defining a table struct](#defining-a-table-struct)
    - [Querying and searching the table](#querying-and-searching-the-table)
- [Support](#support)

## Supported languages

We currently support the following languages:

- [Rust](https://github.com/cipherstash/cipherstash-playground/tree/main/rust)

### Requesting new language support

If you have a language you'd like supported, please [open a discussion](https://github.com/cipherstash/cipherstash-dynamodb/discussions/categories/ideas) or upvote an existing one.

## Prerequisites

You will need to have completed the following steps before using CipherStash for DynamoDB in this playground or in your own application:

1. [Create a CipherStash account](#step-1---create-a-cipherstash-account)
2. [Install the CLI](#step-2---install-the-cli)
3. [Login and create a Dataset](#step-3---create-a-dataset)
4. [Init ZeroKMS](#step-4---init-zerokms)

### Step 1 - Create a CipherStash account

To use CipherStash for DynamoDB, you must first [create a CipherStash account](https://cipherstash.com/signup).

### Step 2 - Install the CLI

The `stash` CLI tool is required to create and manage datasets and keys used for encryption and decryption.
Install the CLI by following the instructions in the [CLI reference doc](https://cipherstash.com/docs/reference/cli).

### Step 3 - Create a dataset and client key

To use CipherStash for DynamoDB, you must create a dataset and a client key.

1. [Create a dataset](https://cipherstash.com/docs/how-to/creating-datasets)
2. [Create a client key](https://cipherstash.com/docs/how-to/creating-clients)
3. [Create an access key](https://cipherstash.com/docs/how-to/creating-access-keys)

### Step 4 - Init ZeroKMS

ZeroKMS uses a root key to encrypt and decrypt data.
This key is initialized on upload of a Dataset configuration.
This step is an artifact of the SQL implementation of CipherStash.
For now, it is sufficient to upload an empty configuration.

There is an empty `dataset.yml` in this repository, ready to be uploaded.
Upload it to ZeroKMS using the following command:

```bash
stash datasets config upload --file dataset.yml --client-id $CS_CLIENT_ID --client-key $CS_CLIENT_KEY
```

### Step 5 - Setting the environment variables

With the above steps completed, you need to set the following environment variables:

- `CS_WORKSPACE_ID` - The workspace ID of the workspace you created in the previous step.
- `CS_CLIENT_ACCESS_KEY` - The client access key of the client you created in the previous step.
- `CS_CLIENT_ID` - The client ID of the client you created in the previous step.
- `CS_CLIENT_KEY` - The client key of the client you created in the previous step.
- `CS_VITUR_IDP_HOST` - This value will be dependent on the region of your workspace.

> Note: The default value for CS_VITUR_IDP_HOST is "https://ap-southeast-2.aws.auth.viturhosted.net".

#### Set the environment variables

This playground is configured to work with [direnv](https://direnv.net/), which is a tool that loads environment variables from `.envrc` files.
Copy the `.envrc.example` file to `.envrc` and fill in the values for the environment variables.

```bash
export CS_WORKSPACE_ID=<your workspace ID>
export CS_CLIENT_ACCESS_KEY=<your client access key>
export CS_CLIENT_ID=<your client ID>
export CS_CLIENT_KEY=<your client key>
export CS_VITUR_IDP_HOST=<your vitur IDP host>
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local
export AWS_DEFAULT_REGION=us-east-1
```

These environment variables will be used by the application in order to perform the encryption and decryption operations, and communicate with the local DynamoDB instance.

For production use, you should use a tool like [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) to store these environment variables.

## Getting started with the playground

Make sure that you have the following installed on your machine:

- [Docker](https://www.docker.com/products/docker-desktop)
- [Rust](https://www.rust-lang.org/tools/install)

Once you have the dependencies installed, run the following command to start the playground:

```bash
docker compose up --build
```

This will create a local DynamoDB instance and initialize a `users` table.
You will also be able to access the DynamoDB Admin UI at [http://localhost:8001](http://localhost:8001).

### Running the application

> **Note:** The following assumes that you've already completed the [Prerequisites](#prerequisites) section, and started the local DynamoDB instance.

To run the application, navigate to the `app` directory and run the following command:

```bash
cd app
cargo run
```

This will start the application, delete the `cool@dude.com` record, create a new record, search for the record by email, and print the result.
You should see the following output:

```bash
Running `target/debug/app`
INFO Initializing...
INFO Fetching dataset config...
INFO Ready!
[src/main.rs:34:5] user = Some(
    User {
        email: "cool@dude.com",
        name: "Cool dude",
        count: 100,
    },
)
```

The above example shows how to initialize a table, create a record, and query the table for a specific record.
The data in the table is encrypted and searchable, which you can validate by exploring the DynamoDB Admin UI at [http://localhost:8001](http://localhost:8001).

## Integrating in your application

### Configuring a table

Any table that you want to use with CipherStash for DynamoDB must have the following attributes:

- Partition key (must be of type string)
- Sort key (must be of type string)
- Term field (must be of type string)

CipherStash for DynamoDB also expects a Global Secondary Index called **TermIndex** to exist if you want to search and query against records.

This is the create table command we used to initialize the `users` table for the playground.

```bash
aws dynamodb create-table \
  --endpoint-url http://localhost:8000 \
  --table-name users \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=term,AttributeType=B \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --global-secondary-indexes "IndexName=TermIndex,KeySchema=[{AttributeName=term,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"
```

### Integrating the SDK in app

> **Note:** The instructions below are written in Rust, and you can find the crate [here](https://crates.io/crates/cipherstash_dynamodb).
> We are working on additional language support, and we will update this section as we add more languages.

#### Dependencies

We publish a crate to [Cloudsmith](https://cloudsmith.io), which you'll need to configure in your `.cargo/config.toml` file to install the crate:

```toml
[registries.cipherstash-cipherstash]
index = "sparse+https://cargo.cloudsmith.io/cipherstash/cipherstash/"
```

The Rust crate can then be installed using the following command:

```bash
cargo install cipherstash-dynamodb --registry cipherstash-cipherstash
```

You can also add the crate to your `Cargo.toml` file:

```toml
[dependencies]
cipherstash-dynamodb = { version = "0.4.0", registry = "cipherstash-cipherstash" }
```

The example application has already included the `cipherstash-dynamodb` crate in its `Cargo.toml` file.

#### Defining a table struct

The first step is to define a struct that represents the table you want to store in DynamoDB.
For the playground, we have defined a struct called `User` that represents a user in our application, and have configured a few attributes to be encrypted and searchable.

```rust
use cipherstash_dynamodb::{Decryptable, Encryptable, Searchable};

#[derive(Debug, Encryptable, Decryptable, Searchable)]
#[cipherstash(sort_key_prefix = "user")]
pub struct User {
    #[cipherstash(query = "exact", compound = "email#name")]
    #[cipherstash(query = "exact")]
    #[partition_key]
    pub email: String,

    #[cipherstash(query = "prefix", compound = "email#name")]
    #[cipherstash(query = "prefix")]
    pub name: String,

    #[cipherstash(plaintext)]
    pub count: i32,
}

impl User {
    #[allow(dead_code)]
    pub fn new(email: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            email: email.into(),
            name: name.into(),
            count: 100,
        }
    }
}
```

You can find more information about the usgae of the `Encryptable` and `Decryptable` traits in the [CipherStash Rust doc](https://cipherstash.com/rustdoc/cipherstash_dynamodb/index.html).

#### Querying and searching the table

The below example shows the playground application that demonstrates how to initialize a table, create a record, and query the table for a specific record.

```rust
...
let client = aws_sdk_dynamodb::Client::new(&config);
let table = EncryptedTable::init(client, "users").await?;

// clean up the cool dude
table.delete::<User>("cool@dude.com").await?;

// create a cool dude
table
  .put(User::new("cool@dude.com", "Cool dude"))
  .await?;

// get the cool dude
let user: Option<User> = table.get("cool@dude.com").await?;

// print the cool dude
dbg!(user);
...
```

You can see the full example in the `app/src/main.rs` file.

## Support

If you are interested in CipherStash for DynamoDB, or have any questions use the following channels:

- [Discussing with the community](https://github.com/cipherstash/cipherstash-playground/discussions)
- [Scheduling a discovery call with the CipherStash team](https://calendly.com/cipherstash/discovery-call)
