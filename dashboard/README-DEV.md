# Arranque del dashboard (Windows)

Si ves `Missing ActionQueueContext`, `useReducer null` o `_document.tsx`, casi siempre es por:

1. **Dos rutas con distinto capital** (`CosechaCoin` vs `cosechacoin`) → React duplicado.
2. Carpeta vacía **`pages/`** → Next activa Pages Router por error.
3. **Varios `npm run dev`** en puertos 3000 y 3001.

## Solución (una sola vez)

```powershell
# Usa SIEMPRE esta ruta (misma capitalización que el proyecto en Cursor)
cd C:\PROYECTOS\CosechaCoin\dashboard

Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

if (Test-Path pages) { Remove-Item -Recurse -Force pages }
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npm install
.\dev.ps1
```

Abre la URL que muestre la terminal (normalmente http://localhost:3000).

## Versiones actuales

- Next **14.2.18**
- React **18.3.1**

(14.2.10 + 18.2.0 provocaban incompatibilidad con App Router en este entorno.)
