#!/bin/bash
# Fetch data from The Graph or Envio API and store it in data.json

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Default flags: prefer Envio unless explicitly configured to use The Graph
USE_THEGRAPH=${USE_THEGRAPH:-false}

# Example references
#API_ENDPOINT="https://gateway-arbitrum.network.thegraph.com/api/${THEGRAPH_API_KEY}/deployments/id/QmeregtvXdwydExdwVBs5YEwNV4HC1DKqQoyRgTbkbvFA7"
#API_ENDPOINT="https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/version/latest"
#API_ENDPOINT="https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/v0.1.1"

# Select endpoint and query type
if [ "$USE_THEGRAPH" = "true" ] && [ -n "$THEGRAPH_API_KEY" ]; then
  API_ENDPOINT="https://gateway.thegraph.com/api/${THEGRAPH_API_KEY}/subgraphs/id/9hHo5MpjpC1JqfD3BsgFnojGurXRHTrHWcUcZPPCo6m8"
  QUERY_TYPE="thegraph"
  echo "📊 Using The Graph for GraphQL queries"
else
  API_ENDPOINT="https://indexer.hyperindex.xyz/1a2f51c/v1/graphql"
  QUERY_TYPE="envio"
  echo "📊 Using Envio for GraphQL queries"
fi
echo "   Endpoint: $API_ENDPOINT"

# Build GraphQL query (dual support)
if [ "$QUERY_TYPE" = "thegraph" ]; then
  QUERY='{
    "query": "{ litems(first: 1000, skip: 0, orderBy: latestRequestSubmissionTime, where: {status: Registered, registryAddress: \"0xae6aaed5434244be3699c56e7ebc828194f26dc3\"}) { itemID metadata { props { type label value } } } }"
  }'
else
  # Envio (Hasura style): entity LItem, limit/order_by/where with operators; keep metadata props usage
  QUERY='{
    "query": "{ LItem(limit: 1000, order_by: {latestRequestSubmissionTime: asc}, where: {registryAddress: {_eq: \"0xae6aaed5434244be3699c56e7ebc828194f26dc3\"}, status: {_eq: \"Registered\"}}) { itemID props { label value } } }"
  }'
fi

DATA_FILE="data.json"

# Use curl to execute GraphQL query
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$QUERY" $API_ENDPOINT)

HTTP_CODE=$(echo $RESPONSE | jq -r 'if .errors then "400" else "200" end')

echo "HTTP Status Code: $HTTP_CODE"
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Error detected:" $(echo $RESPONSE | jq '.errors[].message') | tee -a error_log.txt
  exit 1
else
  # Dual response path support: prefer Envio path .data.LItem, else The Graph .data.litems
  PARSED_RESPONSE=$(echo $RESPONSE | jq '[(.data.LItem // .data.litems)[] | {
    itemID: .itemID,
    url: (.metadata.props[]? // .props[]? | select(.label == "Github Repository URL").value),
    commit: (.metadata.props[]? // .props[]? | select(.label == "Commit hash").value),
    chainId: (.metadata.props[]? // .props[]? | select(.label == "EVM Chain ID").value)
  }]')
  echo $PARSED_RESPONSE >$DATA_FILE
fi
