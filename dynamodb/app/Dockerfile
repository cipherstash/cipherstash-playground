FROM rust:alpine

WORKDIR /app
COPY . .

RUN cargo install
RUN cargo build 

CMD ["./target/debug/app"]