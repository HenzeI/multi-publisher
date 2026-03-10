# Multi Publisher

Aplicacion dividida en dos partes:

- `apps/web`: frontend en React + Vite para preparar anuncios, gestionar borradores y lanzar publicaciones.
- `apps/server`: API en Express + TypeScript para exponer archivos, guardar borradores y ejecutar la publicacion automatizada.

El proyecto tambien incluye `packages/shared`, que centraliza tipos y logica compartida entre frontend y backend.

## Requisitos

- Git
- Node.js 20 o superior
- npm
- Google Chrome instalado

## Estructura

```text
multi-publisher/
|-- apps/
|   |-- server/
|   `-- web/
|-- packages/
|   `-- shared/
`-- mireadme.md
```

## Quickstart

```bash
git clone https://github.com/HenzeI/multi-publisher.git
cd multi-publisher
npm install
cd apps/server
npm install
cd ../web
npm install
```

### 1. Configurar el backend

En `apps/server/.env` define al menos estas variables:

```env
PORT=3000
FILES_BASE_DIR=C:/ruta/a/tus/imagenes
DRAFTS_DIR=../../data/drafts
PLAYWRIGHT_USER_DATA_DIR=./.pw-user-data
DEBUG_DIR=./debug
```

Notas:

- `FILES_BASE_DIR` es obligatoria y debe apuntar a una carpeta que exista.
- Si `DRAFTS_DIR`, `PLAYWRIGHT_USER_DATA_DIR` o `DEBUG_DIR` no existen, el servidor las crea.
- El frontend consume la API en `http://localhost:3000/api`.

### 2. Levantar el backend

En una terminal:

```bash
cd multi-publisher/apps/server
npm run dev
```

El servidor quedara disponible en `http://localhost:3000`.

### 3. Levantar el frontend

En otra terminal:

```bash
cd multi-publisher/apps/web
npm run dev
```

La aplicacion web quedara disponible en `http://localhost:5173`.

## Flujo de uso

1. Arranca primero `apps/server`.
2. Arranca despues `apps/web`.
3. Abre `http://localhost:5173`.
4. Completa el formulario, selecciona los portales y publica.

## Observaciones

- El backend usa `patchright`/`playwright` y abre una sesion persistente de Chrome para automatizar la publicacion.
- Si en tu maquina faltan los binarios del navegador para Playwright, puede hacer falta ejecutar:

```bash
cd multi-publisher/apps/server
npx playwright install
```

- El CORS del backend esta preparado para `http://localhost:5173`.
