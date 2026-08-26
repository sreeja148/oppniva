$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$registerBody = @{
  email = 'demo+judge@example.com'
  password = 'password123'
  name = 'Demo Judge'
} | ConvertTo-Json -Depth 5

Write-Output 'REGISTER:'
try {
  $r = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method Post -Body $registerBody -ContentType 'application/json' -WebSession $s
  $r | ConvertTo-Json
} catch {
  Write-Output "Register failed, attempting login: $_"
  $loginBody = @{ email = 'demo+judge@example.com'; password = 'password123' } | ConvertTo-Json
  $lr = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json' -WebSession $s
  $lr | ConvertTo-Json
}

$profile = @{
  name = 'Demo Judge'
  city = 'Jakarta'
  school = 'Demo High'
  study = 'Grade 12'
  interests = @('Technology','Design')
  skills = @('Coding')
  goal = 'Product & AI Builder'
  availability = @('Online')
}

Write-Output 'SAVE PROFILE:'
$pbody = $profile | ConvertTo-Json -Depth 5
$rp = Invoke-RestMethod -Uri 'http://localhost:3000/api/profile' -Method Post -Body $pbody -ContentType 'application/json' -WebSession $s
$rp | ConvertTo-Json

Write-Output 'RECS:'
$rec = Invoke-RestMethod -Uri 'http://localhost:3000/api/recommendations' -Method Post -Body ($profile | ConvertTo-Json -Depth 5) -ContentType 'application/json' -WebSession $s
$rec | ConvertTo-Json -Depth 5

Write-Output 'OPPS:'
$opps = Invoke-RestMethod -Uri 'http://localhost:3000/api/opportunities' -Method Get -WebSession $s
($opps.opportunities | Measure-Object).Count

$first = $opps.opportunities[0]
Write-Output ('FIRST ID: ' + $first.id)

Write-Output 'SAVING FIRST'
$save = Invoke-RestMethod -Uri 'http://localhost:3000/api/saved' -Method Post -Body (@{id=$first.id} | ConvertTo-Json) -ContentType 'application/json' -WebSession $s
$save | ConvertTo-Json

Write-Output 'PATCH STATUS'
$patch = Invoke-RestMethod -Uri ("http://localhost:3000/api/saved/$($first.id)") -Method Patch -Body (@{status='applied'} | ConvertTo-Json) -ContentType 'application/json' -WebSession $s
$patch | ConvertTo-Json

Write-Output 'DASHBOARD:'
$dash = Invoke-RestMethod -Uri 'http://localhost:3000/api/saved' -Method Get -WebSession $s
$dash | ConvertTo-Json

Write-Output 'LOGOUT:'
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/logout' -Method Post -WebSession $s
Write-Output 'LOGGED OUT'

Write-Output 'LOGIN:'
$loginBody = @{ email = 'demo+judge@example.com'; password = 'password123' } | ConvertTo-Json
$lr = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json' -WebSession $s
$lr | ConvertTo-Json

Write-Output 'DASHBOARD_AFTER_LOGIN:'
$dash2 = Invoke-RestMethod -Uri 'http://localhost:3000/api/saved' -Method Get -WebSession $s
$dash2 | ConvertTo-Json
