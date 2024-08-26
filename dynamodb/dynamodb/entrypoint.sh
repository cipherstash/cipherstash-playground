#!/bin/bash

set -euo pipefail

export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local
export AWS_DEFAULT_REGION=us-east-1
export DB_PATH=/data

run_dynamodb() {
	java -jar DynamoDBLocal.jar -sharedDb -dbPath "$DB_PATH"
}

create_tables() {
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
}

# Check if this is a new instance
NEW_DB=false
if [ ! -f "$DB_PATH/shared-local-instance.db" ]; then
  NEW_DB=true
fi

run_dynamodb &
PID="$!"

if [ "$NEW_DB" = true ]; then
  sleep 5
  create_tables
fi

wait $PID
exit $?