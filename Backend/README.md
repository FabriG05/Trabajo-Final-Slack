# Backend — Clon de Slack (API REST)

API REST construida con **Node.js + Express 5** y **MongoDB (Mongoose)** que implementa el núcleo de una aplicación tipo Slack: autenticación de usuarios con verificación por email, perfiles, workspaces con membresías y roles, sistema de invitaciones y (en progreso) canales.

## 🚀 Cómo ejecutar

```bash
npm install
npm run dev      # modo desarrollo (node --watch src/main.js)
npm start        # modo producción
```

El servidor escucha en el puerto **8080** (`src/main.js`).

### Variables de entorno (`.env`)

| Variable | Uso |
|---|---|
| `MONGO_URI` | Cadena de conexión a MongoDB |
| `MONGO_DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET_KEY` | Firma de los tokens JWT (auth y verificación) |
| `GMAIL_USER` / `GMAIL_PASSWORD` | Credenciales SMTP para el envío de emails (Nodemailer) |
| `URL_BACKEND` | URL base para armar links de verificación/reset |
| `URL_FRONTEND` | URL del frontend incluida en los emails |

> El proyecto incluye `vercel.json`, por lo que también puede desplegarse en Vercel como función serverless (`src/main.js`).

## 🏗️ Alcance y arquitectura

El código sigue una arquitectura en capas:

```
src/
├── main.js                  # Entry point: app Express, CORS, rutas y error middleware global
├── Routes/                  # Definición de rutas y middlewares por endpoint
│   ├── AuthRouter.js
│   ├── UserRouter.js
│   ├── WorkspaceRouter.js
│   └── ChannelRouter.js
├── Controllers/             # Capa HTTP "delgada": leen el request y delegan al service
├── Services/                # Lógica de negocio (Auth, User, Workspace)
├── Repositories/            # Acceso a datos (Mongoose)
├── Models/                  # Esquemas Mongoose: User, WorkSpace, Member, Channel, Message
├── Middlewares/             # Auth (JWT), autorización por roles, manejo de errores
├── Config/                  # Mongo, Mailer (Nodemailer), variables de entorno
└── Utils/                   # ServerError, bcrypt, plantillas de email
```

**Modelos de datos principales:**
- **User**: usuarios con `verified` (verificación por email) y tokens de verificación/reset.
- **WorkSpace**: workspaces con `name` y `description`.
- **Member**: membresía usuario↔workspace con `role` (`User` | `Admin` | `Owner`), token de invitación, estado y expiración. Índice único por (usuario, workspace).
- **Channel** / **Message**: definidos, con endpoints aún en construcción.

Todos los endpoints responden con un envelope JSON consistente: `{ ok, message, data? }`. Los errores lanzados con `ServerError(message, status)` son convertidos a respuestas HTTP por el error middleware.

## 🔐 Middlewares

| Middleware | Dónde aplica | Qué hace |
|---|---|---|
| **CORS** (inline en `main.js`) | Todos los endpoints | Permite cualquier origen, métodos GET/POST/PUT/DELETE y headers estándar + `Authorization`. Responde `OPTIONS` con 200. |
| **`express.json()`** | Todos los endpoints | Parsea el body JSON de las peticiones. |
| **`authMiddleware`** (`AuthMiddleware.js`) | Endpoints protegidos | Lee el header `Authorization: Bearer <token>`, verifica la firma y expiración del JWT y expone `request.user = { id, name, email }`. Devuelve **400** si falta el header/token, **401** si el token es inválido o expiró. |
| **`workspaceMiddleware(validRoles)`** (`WorkspaceMiddelware.js`) | Endpoints de workspace con `:workspace_id` | Valida que el workspace exista (**404**), que el usuario autenticado sea miembro (**403**) y que su rol esté dentro de `validRoles` (**403**). Expone `request.workspace` y `request.membership`. |
| **`errorMiddleware`** (`ErrorMiddleware.js`) | Global (al final de `main.js`) | Captura errores: usa `error.status` si es un error controlado, mapea `ValidationError` de Mongoose a **400**, y cualquier otro error a **500** genérico. |

## 📡 Rutas y Endpoints

Prefijo global: `/api`

### `/api/auth` — Autenticación (público, sin token)

| Método | Ruta | Middlewares | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | CORS, JSON | Registra un nuevo usuario (`username`, `email`, `password`). Hashea la contraseña con bcrypt, genera un token de verificación y envía el email de verificación. Responde **201**. |
| `POST` | `/api/auth/login` | CORS, JSON | Autentica con `email` + `password`. Si el usuario está verificado, devuelve un **JWT** y los datos del usuario. |
| `GET` | `/api/auth/verify-email?verification_token=...` | CORS, JSON | Activa la cuenta validando el token que llega por querystring desde el link del email. |
| `GET` | `/api/auth/verify-email/:email/resend` | CORS, JSON | Re-genera el token de verificación y reenvía el email. Responde siempre el mismo mensaje para no revelar si la cuenta existe. |
| `POST` | `/api/auth/forgot-password` | CORS, JSON | Envía un email con el link de recuperación si la cuenta existe (respuesta idéntica en ambos casos). |
| `POST` | `/api/auth/reset-password` | CORS, JSON | Restablece la contraseña usando `reset_password_token` + nueva `password` en el body. |

### `/api/user` — Usuarios

| Método | Ruta | Middlewares | Descripción |
|---|---|---|---|
| `GET` | `/api/user` | CORS, JSON | Devuelve la lista de usuarios registrados. |
| `GET` | `/api/user/:user_id` | CORS, JSON | Devuelve los datos públicos de un usuario por su id. |
| `PUT` | `/api/user/profile` | CORS, JSON, **authMiddleware** | Actualiza el perfil del usuario autenticado (`name`, `profile_photo`). El id se toma del JWT, nunca del body. |

### `/api/workspace` — Workspaces

| Método | Ruta | Middlewares | Roles requeridos | Descripción |
|---|---|---|---|---|
| `GET` | `/api/workspace` | auth | — | Devuelve todos los workspaces a los que pertenece el usuario autenticado. |
| `POST` | `/api/workspace` | auth | — | Crea un workspace (`name`, `description`) y genera automáticamente la membresía **Owner** para el creador. Responde **201**. |
| `GET` | `/api/workspace/:workspace_id` | auth + workspace | `Owner`, `Admin`, `User` | Devuelve el detalle de un workspace si el usuario es miembro. |
| `PUT` | `/api/workspace/:workspace_id` | auth + workspace | `Owner`, `Admin` | Actualiza `name` y/o `description` del workspace. |
| `DELETE` | `/api/workspace/:workspace_id` | auth + workspace | `Owner` | Elimina el workspace. Solo el dueño puede hacerlo. |
| `GET` | `/api/workspace/:workspace_id/members` | auth + workspace | `Owner`, `Admin`, `User` | Lista los miembros del workspace con su rol y estado de invitación. |
| `DELETE` | `/api/workspace/:workspace_id/members/:member_id` | auth + workspace | `Owner`, `Admin` | Expulsa a un miembro del workspace. |
| `POST` | `/api/workspace/:workspace_id/invitations` | auth + workspace | `Owner`, `Admin` | Crea invitaciones para una lista de `emails` (token + expiración por membreía) y envía los emails correspondientes. Responde **201** con un resumen del proceso. |
| `GET` | `/api/workspace/:workspace_id/members/accept-invite/:invitation_token` | CORS, JSON (público) | — | Acepta una invitación: valida el token y su expiración y marca la membresía como aceptada. No requiere login porque el token actúa como credencial. |

### `/api/workspace/:workspace_id/channels` — Canales (en construcción)

| Método | Ruta | Middlewares | Descripción |
|---|---|---|---|
| `GET` | `/api/workspace/:workspace_id/channels` | CORS, JSON | Placeholder: responde `{ ok: true, message: 'Channel' }`. El router se monta con `mergeParams: true` y será el punto de extensión para los canales y mensajes. |

## 🧭 Ejemplos rápidos

```bash
# Registro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"fabri","email":"fabri@test.com","password":"secreto123"}'

# Login (devuelve el JWT)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fabri@test.com","password":"secreto123"}'

# Listar mis workspaces (usando el token del login)
curl http://localhost:8080/api/workspace \
  -H "Authorization: Bearer <JWT>"
```

## 🗺️ Estado del proyecto

- ✅ Autenticación completa (registro, login, verificación y reset por email)
- ✅ Gestión de perfiles de usuario
- ✅ Workspaces con membresías, roles e invitaciones
- 🚧 Canales y mensajes (modelos definidos, endpoints pendientes)
