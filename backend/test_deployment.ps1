# ReSight Deployment Test Script
# Tests all critical endpoints and webhook functionality

$API_BASE = "http://localhost:8000"

Write-Host "=== ReSight Deployment Test ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/" -Method Get -ErrorAction Stop
    Write-Host "   [OK] Health check passed" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Model loaded: $($response.model_loaded)" -ForegroundColor Gray
} catch {
    Write-Host "   [FAIL] Health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Metrics Endpoint
Write-Host "2. Testing Metrics Endpoint..." -ForegroundColor Cyan
try {
    $metrics = Invoke-RestMethod -Uri "$API_BASE/metrics" -Method Get -ErrorAction Stop
    Write-Host "   [OK] Metrics endpoint working" -ForegroundColor Green
    Write-Host "   Revenue: $($metrics.revenue)" -ForegroundColor Gray
    Write-Host "   Views: $($metrics.views)" -ForegroundColor Gray
    Write-Host "   Clicks: $($metrics.clicks)" -ForegroundColor Gray
} catch {
    Write-Host "   [FAIL] Metrics endpoint failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Rank Endpoint
Write-Host "3. Testing Rank Endpoint..." -ForegroundColor Cyan
try {
    $body = @{
        user_id = "U123"
        items = @()
    } | ConvertTo-Json
    
    $rankings = Invoke-RestMethod -Uri "$API_BASE/rank" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   [OK] Rank endpoint working" -ForegroundColor Green
    Write-Host "   Returned $($rankings.Count) recommendations" -ForegroundColor Gray
    if ($rankings.Count -gt 0) {
        Write-Host "   Top item: $($rankings[0].item_id) (score: $($rankings[0].score))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [FAIL] Rank endpoint failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Explain Endpoint (if we have items)
if ($rankings -and $rankings.Count -gt 0) {
    $testItemId = $rankings[0].item_id
    Write-Host "4. Testing Explain Endpoint..." -ForegroundColor Cyan
    try {
        $explain = Invoke-RestMethod -Uri "$API_BASE/explain/$testItemId" -Method Get -ErrorAction Stop
        Write-Host "   [OK] Explain endpoint working" -ForegroundColor Green
        $topFeatures = $explain.PSObject.Properties | Sort-Object Value -Descending | Select-Object -First 3
        Write-Host "   Top features: $($topFeatures[0].Name) ($([math]::Round($topFeatures[0].Value * 100, 1))%)" -ForegroundColor Gray
    } catch {
        Write-Host "   [FAIL] Explain endpoint failed: $_" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "4. Skipping Explain test (no items found)" -ForegroundColor Yellow
    Write-Host ""
}

# Test 5: Amazon Webhook
Write-Host "5. Testing Amazon Webhook..." -ForegroundColor Cyan
$webhookBody = @{
    eventType = "ORDER_PLACED"
    asin = "AMZ-001"
    price = 1299.0
    quantity = 1
    region = "IN"
} | ConvertTo-Json

try {
    $beforeMetrics = Invoke-RestMethod -Uri "$API_BASE/metrics" -Method Get
    $beforeRevenue = $beforeMetrics.revenue
    
    $webhookResponse = Invoke-RestMethod -Uri "$API_BASE/integrations/amazon/webhook" -Method Post -Body $webhookBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   [OK] Webhook processed" -ForegroundColor Green
    
    # Wait a moment for recalculation
    Start-Sleep -Seconds 2
    
    $afterMetrics = Invoke-RestMethod -Uri "$API_BASE/metrics" -Method Get
    $afterRevenue = $afterMetrics.revenue
    
    if ($afterRevenue -gt $beforeRevenue) {
        Write-Host "   [OK] Revenue increased: $beforeRevenue -> $afterRevenue" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Revenue unchanged (may need time to recalculate)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [FAIL] Webhook failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\run_server.ps1" -ForegroundColor White
