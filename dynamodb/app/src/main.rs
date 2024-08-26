mod common;
use crate::common::User;
use cipherstash_dynamodb::EncryptedTable;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .without_time()
        .init();

    let config = aws_config::from_env()
        .endpoint_url("http://localhost:8000")
        .load()
        .await;

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

    Ok(())
}