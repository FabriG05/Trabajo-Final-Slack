# Deploy en Vercel — qué cambiar

Guía práctica para desplegar el clon de Slack cuando pases de `localhost` a producción.

---

## 1. Cómo funciona hoy

| Parte | Tecnología | Qué hace |
|---|---|---|
| Frontend | React + Vite | Corre en el navegador, habla con la API por HTTP y con Socket.IO por WebSocket |
| Backend | Express + Socket.IO | Expone la API REST y el servidor de tiempo real en el mismo puerto (`8080` local) |
| Base de datos | MongoDB (Mongoose) | Guarda usuarios, workspaces, canales y mensajes |

Flujo de un mensaje:

1. El frontend hace `POST` a la API.
2. El backend guarda el mensaje en MongoDB.
3. El backend emite `message:created` por Socket.IO.
4. Los demás navegadores conectados lo reciben y lo agregan sin recargar.

**La API REST es la fuente de verdad.** Socket.IO solo notifica.

---

## 2. Lo que Vercel puede y no puede hacer

| Componente | ¿Funciona en Vercel? | Detalle |
|---|---|---|
| Frontend (Vite) | ✅ Sí | Deploy estático normal |
| API REST (Express) | ✅ Sí | Como función serverless |
| MongoDB | ✅ Sí | Vía MongoDB Atlas |
| **Socket.IO** | ❌ **No tal cual** | Necesita una conexión TCP/WebSocket persistente y sesiones pegajosas (*sticky sessions*). Las funciones serverless de Vercel son efímeras: la conexión se corta y cada evento puede caer en una instancia distinta. |

Por eso hay dos caminos:

- **Opción A (recomendada):** frontend en Vercel + backend en un host con proceso persistente.
- **Opción B:** todo en Vercel, reemplazando Socket.IO por polling o por un servicio externo de tiempo real.

---

## 3. Opción A — Frontend en Vercel + backend persistente (recomendada)

Es la que menos cambios requiere: el código de Socket.IO que ya está funciona sin tocar nada.

### 3.1 Backend en Render / Railway / Fly.io / Koyeb

Cualquiera de esos servicios sirve. Pasos genéricos:

1. Crear un **Web Service** apuntando al repositorio.
2. Configurar:
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node:** 20 o superior
3. Cargar las variables de entorno (sección 5).
4. Deploy.

> El puerto ya quedó preparado: `src/main.js` usa `process.env.PORT || 8080`, así que el host puede inyectar el suyo sin cambios.

### 3.2 MongoDB Atlas

1. Crear el cluster (si todavía no existe).
2. **Network Access → Add IP Address → Allow access from anywhere** (`0.0.0.0/0`). Los hosts cloud no tienen una IP fija.
3. Copiar la cadena de conexión en `MONGO_URI`.

### 3.3 Frontend en Vercel

1. Importar el repositorio en Vercel.
2. Configurar:
   - **Root Directory:** `Frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Variable de entorno (sección 5):
   - `VITE_APP_URL_BACKEND = https://tu-backend.onrender.com`
4. Deploy.

> ⚠️ Las variables que empiezan con `VITE_` se **inyectan en el build**. Si las cambiás, hay que volver a desplegar el frontend (un simple restart no alcanza).

### 3.4 Ruteo del frontend (React Router)

El frontend usa rutas del navegador. Para que `https://tu-app.vercel.app/workspace/123` no dé 404 al recargar, agregá **`Frontend/vercel.json`**:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3.5 Orden de deploy y URLs

1. Desplegar el backend y copiar su URL pública.
2. Cargar en el backend:
   - `URL_BACKEND = https://tu-backend.onrender.com`
   - `URL_FRONTEND = https://tu-app.vercel.app` (se usa en los links de los emails)
3. Reiniciar el backend para que tome las variables.
4. Desplegar el frontend con `VITE_APP_URL_BACKEND` apuntando al backend.

Sin barra final en ninguna URL.

---

## 4. Opción B — Todo en Vercel (sin Socket.IO)

Si querés mantener backend y frontend en Vercel, la API REST funciona igual, pero el tiempo real hay que reemplazarlo. Hay dos alternativas.

### 4.1 Polling (sin servicios externos)

Es la más simple. La app sigue andando; los mensajes aparecen con 2–3 segundos de demora.

**Cambios necesarios:**

1. **Backend:** ninguno obligatorio. Opcional: agregar `?since=<fecha>` a los `GET` de mensajes para traer solo lo nuevo. Si no, se vuelve a pedir la conversación completa (aceptable para este proyecto).
2. **Frontend — `src/Context/WorkspaceContext.jsx`:** reemplazar el `useEffect` de Socket.IO por intervalos que incrementen `realtimeRefreshToken`:
   - La conversación activa cada **3 segundos**.
   - La lista de canales cada **10 segundos**.
   - Pausar cuando la pestaña está oculta:

```js
useEffect(() => {
    if (!workspaceId) return

    const messagesTimer = setInterval(() => {
        if (document.visibilityState !== 'visible') return
        setRealtimeRefreshToken((token) => token + 1)
    }, 3000)

    return () => clearInterval(messagesTimer)
}, [workspaceId])
```

   El estado y la deduplicación por `_id` ya existen (`mergeMessages` / `upsertMessage`), así que no hay que tocarlos.
3. **Typing ("escribiendo…"):** no es viable solo con polling. Opciones:
   - Quitarlo en modo Vercel (la UI lo oculta si `typingUsers` está vacío), o
   - Implementar un endpoint efímero (`POST /typing`) que guarde el último tecleo en MongoDB y consultarlo en el polling.
4. **Badges de no leídos:** con polling de la conversación activa no se detectan mensajes de otros canales. Para conservarlos hace falta:
   - guardar un `last_read_at` por usuario/canal, y
   - un endpoint que devuelva contadores de no leídos.

> Recomendación: si necesitás badges y typing sí o sí, usá la Opción A o la 4.2.

### 4.2 Servicio externo de tiempo real (Pusher / Ably / Supabase Realtime)

Mantiene la fluidez real y funciona con Vercel serverless. Los cambios están aislados en dos archivos:

| Archivo | Cambio |
|---|---|
| `Backend/src/Realtime/SocketServer.js` | Reemplazar `io.emit(...)` por el `trigger(...)` del proveedor en `publishMessage` y `publishChannel` |
| `Frontend/src/Services/SocketService.js` | Reemplazar `io(...)` por la suscripción del proveedor |
| `Frontend/src/Context/WorkspaceContext.jsx` | Los nombres de eventos (`message:created`, `channel:created`, `typing:*`) pueden quedar iguales |

Variables de entorno nuevas (ejemplo Pusher):

```
PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
VITE_PUSHER_KEY, VITE_PUSHER_CLUSTER
```

Recomendaciones:

- Canales **privados** por workspace (`private-workspace-<id>`) y por usuario (`private-user-<id>`), con un endpoint de autorización que valide el JWT.
- Nada de canales públicos: los mensajes no deben ser legibles por terceros.

### 4.3 Si igual desplegás el backend actual en Vercel

El `Backend/vercel.json` ya enruta todo a `src/main.js` y la API REST seguirá funcionando. Socket.IO **no** va a aceptar conexiones. Para evitar intentos inútiles, podés saltear su inicialización:

```js
import { initSocketServer } from "./Realtime/SocketServer.js";

if (!process.env.VERCEL) {
    initSocketServer(httpServer)
}
```

Y en el frontend, implementar el polling de la sección 4.1.

---

## 5. Variables de entorno

### Backend

| Variable | Ejemplo | Obligatoria |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net` | Sí |
| `MONGO_DB_NAME` | `PROJECT-SLACK` | Sí |
| `JWT_SECRET_KEY` | cadena larga y privada | Sí |
| `GMAIL_USER` | `tu@gmail.com` | Sí (emails) |
| `GMAIL_PASSWORD` | app password de Gmail (no la contraseña normal) | Sí (emails) |
| `URL_BACKEND` | `https://tu-backend.onrender.com` | Sí |
| `URL_FRONTEND` | `https://tu-app.vercel.app` | Sí |
| `PORT` | lo inyecta el host | No (fallback `8080`) |

### Frontend (Vercel)

| Variable | Ejemplo |
|---|---|
| `VITE_APP_URL_BACKEND` | `https://tu-backend.onrender.com` |

> Todo lo que sea secreto va solo en el backend. `VITE_*` queda visible en el bundle del navegador: nunca pongas ahí `JWT_SECRET_KEY`, credenciales de Mongo ni de Gmail.

---

## 6. Checklist después del deploy

- [ ] Registro y login funcionan.
- [ ] El link de verificación del email abre el frontend correcto (`URL_FRONTEND`).
- [ ] Al recargar, canales y mensajes siguen ahí (MongoDB conectada).
- [ ] Con dos navegadores/usuarios distintos:
  - [ ] Un mensaje de canal aparece al instante en el otro.
  - [ ] Un DM aparece al instante en el otro.
  - [ ] Un canal nuevo aparece sin recargar.
  - [ ] El badge de no leídos incrementa en la conversación que no está abierta y se limpia al entrar.
  - [ ] "X is typing…" aparece y desaparece solo.
- [ ] Cortar y reiniciar el backend: los clientes reconectan y los mensajes perdidos se recuperan (el código re-une al workspace y refresca por REST al reconectar).

**Cómo saber si Socket.IO está conectado:** DevTools → Network → filtro `WS`. Tiene que aparecer `socket.io/?EIO=4&transport=websocket` en estado `101 Switching Protocols`. Si no aparece, el backend no está aceptando WebSockets (típico de Vercel serverless).

---

## 7. Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| El frontend pega a `localhost:8080` en producción | `VITE_APP_URL_BACKEND` mal o el deploy no se rehizo | Corregir la variable y **redeploy** |
| `401` al cargar canales | Token viejo de otro dominio/origen | Volver a iniciar sesión |
| Error de conexión a Mongo | IP no permitida en Atlas | Network Access → `0.0.0.0/0` |
| 404 al recargar una ruta del frontend | Falta el rewrite SPA | Agregar `Frontend/vercel.json` |
| Los mensajes aparecen recién al recargar | Socket.IO no conecta (backend serverless) | Opción A, o implementar polling / proveedor externo |
| WebSocket conecta y corta cada pocos segundos | Host sin sticky sessions o con timeout agresivo | Usar un host con proceso persistente; revisar el timeout del proxy |
| Los emails no llegan | Gmail con contraseña normal | Usar un **App Password** de Gmail |

---

## 8. Resumen de cambios a hacer

1. Backend en un host persistente (Render/Railway/Fly) **o** asumir polling en Vercel.
2. Cargar las variables de entorno de la sección 5.
3. Permitir la IP de Vercel en MongoDB Atlas.
4. Configurar el frontend en Vercel con `VITE_APP_URL_BACKEND`.
5. Agregar `Frontend/vercel.json` con el rewrite SPA.
6. Redeploy del frontend cada vez que cambie una variable `VITE_*`.
7. Verificar el checklist de la sección 6.
