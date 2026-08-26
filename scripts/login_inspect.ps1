$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ email = 'demo+judge@example.com'; password = 'password123' } | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json' -WebSession $s -ErrorAction Stop
Write-Output 'Status:' $response.StatusCode
Write-Output 'Headers:'
$response.Headers
Write-Output 'Cookies in session:'
$s.Cookies.GetCookies('http://localhost:3000') | ForEach-Object { $_.Name + '=' + $_.Value }
$response.Content
