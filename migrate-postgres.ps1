$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Config
$SrcDockerImage = 'postgres:18-alpine'
$DstDockerImage = 'postgres:18-alpine'

$SrcHost = '101.33.75.223'
$SrcPort = '31812'
$SrcDb   = 'zeabur'
$SrcUser = 'root'
$SrcPass = 'd2507Rf6Vcb4NI9BUKpkLejoY1EmwP83'

$DstHost = '64.83.47.14'
$DstPort = '5432'
$DstDb   = 'mynewapi'         # Change to a new database name if needed, e.g. newapi_20260424
$DstUser = 'user_rmzsQn'
$DstPass = 'password_bDWewb'
$MaintDb = 'template1'

$DumpFile = Join-Path (Get-Location) 'zeabur.dump'

function Invoke-PgContainer {
    param(
        [Parameter(Mandatory = $true)][string]$Image,
        [Parameter(Mandatory = $true)][string]$Password,
        [Parameter(Mandatory = $true)][string[]]$Args
    )

    docker run --rm `
        -e "PGPASSWORD=$Password" `
        -v "${PWD}:/work" `
        -w /work `
        $Image @Args
}

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host ">>> $Message" -ForegroundColor Cyan
}

Write-Step "Check Docker"
docker --version | Out-Null

Write-Step "Check source database connection (read-only)"
Invoke-PgContainer -Image $SrcDockerImage -Password $SrcPass -Args @(
    'psql',
    '-h', $SrcHost,
    '-p', $SrcPort,
    '-U', $SrcUser,
    '-d', $SrcDb,
    '-v', 'ON_ERROR_STOP=1',
    '-c', 'SELECT current_database(), current_user;'
)

Write-Step "Check target server connection"
Invoke-PgContainer -Image $DstDockerImage -Password $DstPass -Args @(
    'psql',
    '-h', $DstHost,
    '-p', $DstPort,
    '-U', $DstUser,
    '-d', $MaintDb,
    '-v', 'ON_ERROR_STOP=1',
    '-c', 'SELECT current_database(), current_user;'
)

Write-Step "Check whether target database already exists"
$dbExists = docker run --rm `
    -e "PGPASSWORD=$DstPass" `
    $DstDockerImage `
    psql `
    -h $DstHost `
    -p $DstPort `
    -U $DstUser `
    -d $MaintDb `
    -tA `
    -v ON_ERROR_STOP=1 `
    -c "SELECT 1 FROM pg_database WHERE datname = '$DstDb';"

if ($dbExists -eq '1') {
    Write-Step "Drop existing target database"
    docker run --rm `
        -e "PGPASSWORD=$DstPass" `
        $DstDockerImage `
        psql `
        -h $DstHost `
        -p $DstPort `
        -U $DstUser `
        -d $MaintDb `
        -v ON_ERROR_STOP=1 `
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DstDb' AND pid <> pg_backend_pid();"

    docker run --rm `
        -e "PGPASSWORD=$DstPass" `
        $DstDockerImage `
        dropdb `
        --if-exists `
        -h $DstHost `
        -p $DstPort `
        -U $DstUser `
        $DstDb
}

Write-Step "Export source database to local dump file"
if (Test-Path $DumpFile) {
    Remove-Item $DumpFile -Force
}

Invoke-PgContainer -Image $SrcDockerImage -Password $SrcPass -Args @(
    'pg_dump',
    '-h', $SrcHost,
    '-p', $SrcPort,
    '-U', $SrcUser,
    '-d', $SrcDb,
    '-Fc',
    '--no-owner',
    '--no-privileges',
    '-f', '/work/zeabur.dump'
)

if (-not (Test-Path $DumpFile)) {
    throw "Export failed: dump file was not created."
}

Write-Step "Create target database"
Invoke-PgContainer -Image $DstDockerImage -Password $DstPass -Args @(
    'createdb',
    '--maintenance-db', $MaintDb,
    '-h', $DstHost,
    '-p', $DstPort,
    '-U', $DstUser,
    $DstDb
)

Write-Step "Restore data into target database"
Invoke-PgContainer -Image $DstDockerImage -Password $DstPass -Args @(
    'pg_restore',
    '-h', $DstHost,
    '-p', $DstPort,
    '-U', $DstUser,
    '-d', $DstDb,
    '--exit-on-error',
    '--single-transaction',
    '--no-owner',
    '--no-privileges',
    '/work/zeabur.dump'
)

Write-Step "Verify migrated tables"
Invoke-PgContainer -Image $DstDockerImage -Password $DstPass -Args @(
    'psql',
    '-h', $DstHost,
    '-p', $DstPort,
    '-U', $DstUser,
    '-d', $DstDb,
    '-v', 'ON_ERROR_STOP=1',
    '-c', '\dt'
)

Write-Host ""
Write-Host "Migration completed." -ForegroundColor Green
Write-Host "Source database was not modified. Local dump file: $DumpFile" -ForegroundColor Green