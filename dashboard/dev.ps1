# Arranque limpio del dashboard (misma ruta siempre — evita error de React duplicado)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Deteniendo procesos Node previos..."
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (Test-Path "pages") {
  Remove-Item -Recurse -Force "pages"
  Write-Host "Eliminada carpeta pages/ (conflicto con App Router)"
}

if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
}

Write-Host "Iniciando en $PWD ..."
npm run dev
