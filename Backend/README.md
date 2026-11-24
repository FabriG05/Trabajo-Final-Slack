# Backend — Clon de Slack (API REST + Socket.IO)

API construida con **Node.js + Express 5**, **MongoDB (Mongoose)** y **Socket.IO**. Implementa autenticación, perfiles, workspaces, membresías, invitaciones, canales, mensajes de canal, mensajes directos, estado de lectura, mensajes destacados y actividad.

## Requisitos

- Node.js 20+
- MongoDB (local o Atlas)
- Cuenta SMTP/Gmail para emails de verificación, reset e invitaciones

## Ejecución

```bash
npm install
npm run dev      # desarrollo (node --watch src/main.js)
npm start        # producción
```

El servidor escucha en `PORT` (por defecto `8080`). Swagger UI está disponible en `http://localhost:8080/api-docs`.

## Variables de entorno (`.env`)

| Variable | Uso |
|---|---|
| `MONGO_URI` | Cadena de conexión a MongoDB |
| `MONGO_DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET_KEY` | Firma de tokens JWT (auth, verificación, reset) |
| `PORT` | Puerto del servidor (opcional, default `8080`) |
| `URL_BACKEND` | URL pública del backend |
| `URL_FRONTEND` | URL pública del frontend (links en emails) |
| `GMAIL_USER` / `GMAIL_PASSWORD` | Credenciales SMTP (usar App Password de Gmail) |
| `WHITELIST_ENABLED` | Habilita whitelist (`true`/`false`, default `false`) |
| `WHITELIST_IPS` | IPs permitidas (coma-separadas) |
| `WHITELIST_ORIGINS` | Origins permitidos (coma-separados) |
| `WHITELIST_IDENTIFIERS` | IDs/emails permitidos (coma-separados, post-auth) |
| `BLACKLIST_IPS` | IPs bloqueadas (403) |
| `BLACKLIST_IDENTIFIERS` | IDs/emails bloqueados (403) |
| `BLACKLIST_TOKENS` | JWTs revocados (401) |
| `RATE_LIMIT_WINDOW_MS` | Ventana rate limit general (ms, default `900000`) |
| `RATE_LIMIT_MAX` | Máximo requests/IP en ventana general (default `100`) |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Ventana rate limit auth (ms, default `900000`) |
| `AUTH_RATE_LIMIT_MAX` | Máximo requests/IP para auth sensible (default `10`) |

## Arquitectura

```text
src/
├── main.js                  # Express app, CORS, middlewares, rutas, Socket.IO
├── Config/                  # Mongo, Mailer, Environment
├── Routes/                  # Auth, User, Workspace, Channel
├── Controllers/             # Capa HTTP delgada
├── Services/                # Lógica de negocio
├── Repositories/            # Acceso a datos (Mongoose)
├── Models/                  # User, WorkSpace, Member, Channel, Message, etc.
├── Middlewares/             # Auth, workspace/roles, blacklist/whitelist, rate limit, errors, logger
├── Realtime/                # SocketServer (eventos realtime)
└── Utils/                   # ServerError, bcrypt, templates de email
```

Todos los endpoints responden con envelope JSON: `{ ok, message, data? }`. Errores controlados usan `ServerError(message, status)` y son manejados por el error middleware.

## Middlewares globales

- **CORS**: permite `*` por defecto; si hay whitelist de origins activa, solo refleja origins permitidos.
- **Blacklist/Whitelist**: bloqueo por IP/origin/token/identificador según configuración.
- **Rate limit**: general en `/api` y más estricto en rutas sensibles de auth.
- **Logger**: registra requests en MongoDB (sin body).
- **Auth (`Authorization: Bearer <token>`)**: valida JWT, token revocado e identificadores bloqueados/whitelist.
- **Workspace middleware**: valida workspace, membresía y rol requerido.

## Endpoints REST

Prefijo global: `/api`. Los endpoints protegidos requieren `Authorization: Bearer <token>`.

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | No | Registra usuario y envía email de verificación |
| POST | `/login` | No | Login, devuelve JWT y datos de usuario |
| GET | `/verify-email?verification_token=...` | No | Verifica email |
| GET | `/verify-email/:email/resend` | No | Reenvía verificación (respuesta genérica) |
| POST | `/forgot-password` | No | Envía email de reset (respuesta genérica) |
| POST | `/reset-password` | No | Resetea contraseña con token |

### Users (`/api/user`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/me` | Sí | Perfil del usuario autenticado |
| PUT | `/profile` | Sí | Actualiza `name` y/o `profile_photo` |
| PUT | `/status` | Sí | Actualiza presencia (`online`, `away`, `offline`, `do not disturb`) |

### Workspaces (`/api/workspace`)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/` | Auth | Lista workspaces del usuario |
| POST | `/` | Auth | Crea workspace (creador queda Owner) |
| GET | `/:workspace_id` | Miembro | Detalle de workspace |
| PUT | `/:workspace_id` | Owner/Admin | Actualiza workspace |
| DELETE | `/:workspace_id` | Owner | Elimina workspace |
| GET | `/:workspace_id/members` | Miembro | Lista miembros |
| DELETE | `/:workspace_id/members/:member_id` | Owner/Admin | Elimina miembro |
| PUT | `/:workspace_id/members/:member_id/role` | Owner/Admin | Cambia rol |
| POST | `/:workspace_id/join` | Auth | Une usuario con token de invitación/link |
| POST | `/:workspace_id/invitations` | Owner/Admin | Crea/envía invitaciones |
| GET | `/:workspace_id/unread` | Miembro | Contadores de no leídos |
| PUT | `/:workspace_id/reads/:conversation_key` | Miembro | Marca conversación como leída |
| GET | `/:workspace_id/starred` | Miembro | Mensajes destacados del usuario |
| POST | `/:workspace_id/starred/:message_id` | Miembro | Destaca mensaje |
| DELETE | `/:workspace_id/starred/:message_id` | Miembro | Quita destacado |
| GET | `/:workspace_id/activity` | Miembro | Actividad/menciones relevantes |
| GET | `/:workspace_id/direct-messages` | Miembro | Resúmenes de DMs |
| GET | `/:workspace_id/direct-messages/:user_id` | Miembro | Mensajes DM con usuario |
| POST | `/:workspace_id/direct-messages/:user_id` | Miembro | Envía DM |
| PUT | `/:workspace_id/messages/:message_id` | Miembro/autor-admin-owner | Edita mensaje |
| DELETE | `/:workspace_id/messages/:message_id` | Miembro/autor-admin-owner | Elimina mensaje |

### Channels (`/api/workspace/:workspace_id/channels`)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/` | Miembro | Lista canales |
| POST | `/` | Miembro | Crea canal |
| DELETE | `/:channel_id` | Owner/Admin | Elimina canal y sus mensajes |
| GET | `/:channel_id/messages` | Miembro | Lista mensajes del canal |
| POST | `/:channel_id/messages` | Miembro | Crea mensaje en canal |

## Realtime (Socket.IO)

Socket.IO comparte el mismo servidor HTTP. El cliente se autentica con el JWT y se une a rooms por workspace. Eventos principales: creación/eliminación de mensajes y canales, typing, cambios de miembros/perfil/status y refresh por reconexión. La API REST sigue siendo la fuente de verdad.

## Documentación

- Swagger UI: `/api-docs`
- Especificación OpenAPI: `Docs/openapi.js`
- Colección Postman local: `postman/collections/Slack Clone API`
- Reporte QA: `postman/REPORT.md`

## Estado

- ✅ Auth completa (registro, login, verificación, reset)
- ✅ Perfil y estado de usuario
- ✅ Workspaces, membresías, roles e invitaciones
- ✅ Canales y mensajes de canal
- ✅ Mensajes directos, unread/read, starred y activity
- ✅ Socket.IO para eventos realtime
- ✅ Swagger/OpenAPI y colección Postman
