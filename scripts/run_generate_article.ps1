# run_generate_article.ps1 - タスクスケジューラから呼ばれる実行ラッパー
#
# 役割:
#   1. 二重起動防止（当日すでに実行済みならスキップ）
#   2. プロジェクトルートへ移動して generate_article.mjs を実行
#   3. 標準出力をログへ追記
#
# 手動実行:
#   powershell -ExecutionPolicy Bypass -File scripts\run_generate_article.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\run_generate_article.ps1 -DryRun
#   powershell -ExecutionPolicy Bypass -File scripts\run_generate_article.ps1 -Force

param(
    [int]$Count = 1,
    [string]$Model = "sonnet",
    [switch]$DryRun,
    [switch]$Force      # 当日実行済みでも強制実行する
)

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$LogDir      = Join-Path $ScriptDir "logs"
$Today       = Get-Date -Format "yyyy-MM-dd"
$StampFile   = Join-Path $LogDir "last_run.txt"
$LogFile     = Join-Path $LogDir "$Today.log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

function Write-Log($msg) {
    $line = "[{0}] [wrapper] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
    Write-Output $line
    # Windows PowerShell 5.1 の Add-Content -Encoding utf8 はBOMを書いてしまい、
    # Node側の追記と混ざるとファイル途中にBOMが入る。BOMなしで追記する。
    [System.IO.File]::AppendAllText(
        $LogFile, $line + [Environment]::NewLine,
        (New-Object System.Text.UTF8Encoding($false))
    )
}

# --- 二重起動防止 ---------------------------------------------------------
# PC起動のたびにトリガーされるため、当日すでに成功していればスキップする
if ((-not $Force) -and (Test-Path $StampFile)) {
    $last = (Get-Content $StampFile -Raw).Trim()
    if ($last -eq $Today) {
        Write-Log "本日($Today)は実行済みのためスキップします。強制実行は -Force"
        exit 0
    }
}

# --- 実行 -----------------------------------------------------------------
Set-Location $ProjectRoot
Write-Log "開始 cwd=$ProjectRoot count=$Count model=$Model dryRun=$($DryRun.IsPresent)"

$nodeArgs = @("scripts/generate_article.mjs", "--count", $Count, "--model", $Model)
if ($DryRun) { $nodeArgs += "--dry-run" }

try {
    & node @nodeArgs 2>&1 | ForEach-Object { Write-Output $_ }
    $code = $LASTEXITCODE
} catch {
    Write-Log "実行時エラー: $_"
    $code = 1
}

if ($code -eq 0) {
    # dry-run は「実行済み」扱いにしない（本番実行を妨げないため）
    if (-not $DryRun) {
        [System.IO.File]::WriteAllText(
            $StampFile, $Today, (New-Object System.Text.UTF8Encoding($false))
        )
    }
    Write-Log "正常終了 (exit=$code)"
} else {
    Write-Log "異常終了 (exit=$code)。スタンプは更新しないので次回起動時に再試行されます"
}

exit $code
