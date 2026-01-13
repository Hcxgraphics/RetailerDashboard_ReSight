# Test Amazon webhook - ORDER_PLACED event (PowerShell)

Write-Host "Testing Amazon Webhook - ORDER_PLACED event" -ForegroundColor Green
Write-Host ""

$body = @{
    eventType = "ORDER_PLACED"
    asin = "AMZ-001"
    price = 1299.0
    quantity = 1
    region = "IN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/integrations/amazon/webhook" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host ""
Write-Host "✓ Webhook sent!" -ForegroundColor Green
Write-Host ""
Write-Host "Check metrics: Invoke-RestMethod http://localhost:8000/metrics"
Write-Host "Check item: Invoke-RestMethod http://localhost:8000/item/AMZ-001"
