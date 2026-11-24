# Trabajo Final — Clon de Slack

Aplicación full-stack tipo Slack con frontend en React/Vite y backend en Node.js/Express + MongoDB + Socket.IO.

## Estructura del repositorio

```text
.
├── Backend/             # API REST, Socket.IO, MongoDB, Swagger, Postman
├── Frontend/            # App React + Vite
└── DEPLOY-VERCEL.md     # Guía de deploy y notas sobre Socket.IO en Vercel
```

## Documentación

- [Backend README](./Backend/README.md) — setup, env vars, endpoints, realtime, Swagger.
- [Frontend README](./Frontend/README.md) — setup, env vars, rutas y funcionalidades.
- [Deploy en Vercel](./DEPLOY-VERCEL.md) — opciones de despliegue y limitaciones de WebSockets.

## Desarrollo local rápido

1. **Backend**
   ```bash
   cd Backend
   npm install
   npm run dev
   ```
2. **Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

Configurar variables de entorno según los READMEs de cada proyecto (`Backend/.env`, `Frontend/.env`).