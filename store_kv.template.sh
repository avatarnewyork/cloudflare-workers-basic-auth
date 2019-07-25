#!/bin/bash
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$KEY" \
     -X PUT \
     -H "Authorization: Bearer $TOKEN" \
     --data "$HASH"
