# Patentes API (Vercel + Hono + MySQL)

## Endpoints
- GET    /api/plate/
- POST   /api/plate/
- GET    /api/plate/search?id=&plate=&partial=&limit=&offset=
- GET    /api/plate/:id
- GET    /api/report/
- POST   /api/report/

## Env Variables (Vercel → Settings → Environment Variables)
- DB_HOST
- DB_PORT (default 3306)
- DB_USER
- DB_PASS
- DB_NAME
- SSL_CA (contenido del CA en texto plano, opcional)

## Local
- npm install
- vercel dev
