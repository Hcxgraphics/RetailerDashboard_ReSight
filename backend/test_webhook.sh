#!/bin/bash
# Test Amazon webhook - ORDER_PLACED event

echo "Testing Amazon Webhook - ORDER_PLACED event"
echo ""

curl -X POST http://localhost:8000/integrations/amazon/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ORDER_PLACED",
    "asin": "AMZ-001",
    "price": 1299.0,
    "quantity": 1,
    "region": "IN"
  }'

echo ""
echo ""
echo "Check metrics: curl http://localhost:8000/metrics"
echo "Check item: curl http://localhost:8000/item/AMZ-001"
