# Frontend — Clon de Slack

Frontend de un clon de Slack construido con **React 19 + Vite**. Consume la API REST del backend y usa **Socket.IO Client** para actualizaciones en tiempo real.

## Requisitos

- Node.js 20+
- Backend corriendo (por defecto `http://localhost:8080`)

## Ejecución

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run preview  # previsualizar build
npm run lint     # ESLint
```

## Variables de entorno (`.env`)

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_APP_URL_BACKEND` | `http://localhost:8080` | URL base del backend (sin barra final) |

> Las variables `VITE_*` se inyectan en build. Si cambiás una, rehacé el deploy/build.

## Estructura

```text
src/
├── App.jsx                 # Rutas principales
├── main.jsx                # Entry point React
├── Components/             # UI (Auth, Home, Workspace, Common)
├── Screens/                # Pantallas/rutas
├── Context/                # SessionContext, WorkspaceContext
├── Hooks/                  # Hooks de datos y formularios
├── Services/               # AuthService, WorkSpaceService, ProfileService, SocketService
├── Middlewares/            # Guards de rutas (Auth/Guest)
├── Utils/                  # Helpers (fechas, archivos, slug, compresión)
└── assets/                 # Imágenes e íconos
```

## Rutas principales

- `/` — Landing
- `/login`, `/register` — Auth (guest)
- `/verify-email`, `/resend-email-verification`, `/forgot-password`, `/reset-password`
- `/home` — Lista/selección de workspaces (auth)
- `/create-workspace` — Crear workspace (auth)
- `/workspace/:workspaceId` — Vista de workspace (auth)
- `/workspace/:workspaceId/channels/:channelId` — Canal activo
- `/workspace/:workspaceId/join?token=...` — Unirse por invitación

## Funcionalidades

- Registro, login, verificación de email y reset de contraseña.
- Perfil de usuario, foto y estado de presencia.
- Crear/listar workspaces, invitar miembros, unirse por link/token.
- Canales: listar, crear, eliminar, enviar mensajes.
- Mensajes directos entre miembros del workspace.
- Edición/eliminación de mensajes, destacados, unread/read, actividad/menciones.
- Realtime con Socket.IO; fallback/consistencia vía REST.

## Deploy

Para Vercel y consideraciones de Socket.IO, ver `../DEPLOY-VERCEL.md`.
