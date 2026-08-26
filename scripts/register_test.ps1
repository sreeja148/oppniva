$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$body = @{
  email = 'demo2@example.com'
  password = 'password123'
  name = 'Demo'
} | ConvertTo-Json -Depth 5
$r = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method Post -Body $body -ContentType 'application/json' -WebSession $s
$r | ConvertTo-Json
