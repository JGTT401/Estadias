# Manual de instalación — K'empanadas (aplicación web)

Este documento explica cómo instalar y ejecutar el proyecto en un ordenador de forma correcta. Está pensado para quien reciba el código o el paquete del proyecto y deba ponerlo en marcha (desarrollo local o preparación para publicarlo en internet).

---

## 1. Qué necesitas antes de empezar

| Requisito | Detalle |
|-----------|---------|
| **Node.js** | Versión **20 LTS** o superior (recomendado: instalar desde [nodejs.org](https://nodejs.org/)). Incluye **npm**. |
| **Cuenta en Supabase** | El backend (usuarios, base de datos) está en [Supabase](https://supabase.com/). Puede ser un proyecto nuevo o uno ya existente. |
| **Editor de texto** (opcional) | Visual Studio Code u otro editor, para revisar archivos si hace falta. |

---

## 2. Obtener el proyecto en tu ordenador

- Si te lo pasan **en un ZIP**: descomprímelo y recuerda la ruta de la carpeta (por ejemplo `final` o `Nuevo/final`).
- Si está en **GitHub/GitLab**: clona el repositorio y entra en la carpeta raíz de la aplicación (donde está el archivo `package.json`).

Todas las órdenes de terminal de este manual deben ejecutarse **dentro de esa carpeta** (la que contiene `package.json`).

---

## 3. Instalar dependencias del proyecto

Abre una terminal (en Windows: PowerShell o CMD) y ejecuta:

```bash
cd RUTA\A\TU\PROYECTO
npm install
```

Espera a que termine sin errores. Esto crea la carpeta `node_modules` con las librerías necesarias.

- Si aparece un error de permisos o de versión de Node, actualiza Node.js a la última LTS y vuelve a intentar.

---

## 4. Base de datos y Supabase

La aplicación no funciona sin un proyecto de Supabase configurado y con las tablas creadas.

### 4.1 Crear (o elegir) un proyecto en Supabase

1. Entra en [app.supabase.com](https://app.supabase.com/).
2. Crea un proyecto nuevo o usa uno existente.
3. Anota la **URL del proyecto** y la clave **anon public** (Settings → API).

### 4.2 Aplicar el esquema de la base de datos (migraciones)

En el código del proyecto, la definición de tablas está en:

`supabase/migrations/`

**Opción A — Editor SQL de Supabase (la más simple para el cliente)**

1. En Supabase: **SQL Editor** → **New query**.
2. Abre en tu PC el archivo `.sql` dentro de `supabase/migrations/` 
3. Copia **todo** el contenido y pégalo en el editor.
4. Ejecuta la consulta (**Run**).

Ejecuta **todos** los archivos `.sql` de esa carpeta, **en orden** (por fecha en el nombre del archivo). Por ejemplo: primero el esquema inicial y después `20260407120000_messages_admin_update_delete.sql` (permisos extra para que el admin edite y borre mensajes).

**Opción B — Supabase CLI** (avanzado, requiere Docker para entorno local)

Solo si tu equipo ya usa la CLI: `supabase link` y `supabase db push` contra el proyecto remoto. No es obligatorio si usas la opción A.

### 4.3 Autenticación (Auth)

En Supabase: **Authentication** → **URL Configuration**:

- **Site URL**: para pruebas en tu PC suele ser `http://localhost:5173` (puerto por defecto de Vite).
- **Redirect URLs**: añade `http://localhost:5173/**` y, cuando publiques la web, la URL real (por ejemplo `https://tu-dominio.vercel.app/**`).

Sin esto, el registro o el inicio de sesión pueden fallar.

### 4.4 Primer usuario administrador

Los usuarios nuevos se registran con rol **user**. Para tener un **admin**:

1. Regístrate en la app con un correo (quedará como usuario normal).
2. En Supabase: **Table Editor** → tabla **`profiles`** → localiza tu fila (por `email`).
3. Cambia el campo **`role`** de `user` a **`admin`** (exactamente en minúsculas).
4. Vuelve a iniciar sesión en la aplicación; deberías acceder al panel de administración.

---

## 5. Variables de entorno (archivo `.env`)

En la **misma carpeta** que `package.json`, crea un archivo llamado **`.env`** (sin nombre delante, solo `.env`).

Contenido mínimo:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_publica_aqui
```

- **`VITE_SUPABASE_URL`**: Project URL (Settings → API en Supabase).
- **`VITE_SUPABASE_ANON_KEY`**: clave **anon** / **public** (la que puede ir en el navegador).

**Importante**

- **No** uses la clave **`service_role`** en este archivo si la aplicación solo es frontend: esa clave es **secreta** y da acceso total; no debe exponerse en el navegador.
- **No** subas `.env` a Git ni lo compartas públicamente; ya está ignorado en `.gitignore` del proyecto.

---

## 6. Ejecutar la aplicación en modo desarrollo

Con `.env` creado y dependencias instaladas:

```bash
npm run dev
```

La terminal mostrará una URL local (normalmente `http://localhost:5173`). Ábrela en el navegador.

- Para parar el servidor: en la terminal, `Ctrl + C`.

---

## 7. Comprobar que el build de producción funciona

Antes de subir la web a un hosting, conviene generar la versión optimizada:

```bash
npm run build
```

Se crea la carpeta **`dist`** con los archivos listos para publicar.

Para probarlos en local:

```bash
npm run preview
```

---

## 8. Publicar en internet (resumen)

Una forma habitual es usar **Vercel** (u otro hosting estático):

1. Subir el código a un repositorio Git (por ejemplo GitHub).
2. Conectar el repositorio en [vercel.com](https://vercel.com/).
3. Configurar las mismas variables `VITE_SUPABASE_*` en el panel de Vercel (Environment Variables).
4. **Build command:** `npm run build` — **Output directory:** `dist`.
5. Si el repositorio no está en la raíz del monorepo, indicar la **carpeta raíz** del proyecto (donde está `package.json`).
6. Actualizar en Supabase la **Site URL** y **Redirect URLs** con la URL que te dé Vercel.

El proyecto incluye `vercel.json` para que las rutas de la aplicación (como `/login`) funcionen al recargar la página.

---

## 9. Problemas frecuentes

| Síntoma | Qué revisar |
|---------|-------------|
| Error sobre variables de entorno al abrir la app | Que exista `.env` en la carpeta correcta y que los nombres sean exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Reinicia `npm run dev` tras crear o cambiar `.env`. |
| No carga datos / errores de permisos en tablas | Que hayas ejecutado el SQL de migraciones y que las políticas RLS en Supabase coincidan con el proyecto. |
| No puedo iniciar sesión o confirmar correo | URLs de Auth en Supabase (Site URL y Redirect URLs) y políticas del proveedor de correo. |
| `npm install` falla | Versión de Node actualizada; borrar `node_modules` y `package-lock.json` y volver a `npm install` solo si te lo indica soporte técnico. |
| Página en blanco en producción | Variables de entorno configuradas en el hosting; build correcto (`npm run build`). |

---

## 10. Comandos útiles (resumen)

| Comando | Uso |
|---------|-----|
| `npm install` | Instalar dependencias (primera vez o tras cambios en `package.json`). |
| `npm run dev` | Servidor de desarrollo con recarga automática. |
| `npm run build` | Generar la carpeta `dist` para producción. |
| `npm run preview` | Probar localmente el contenido de `dist`. |
| `npm run lint` | Revisar estilo de código con ESLint (opcional). |

---

## Contacto y soporte

Para dudas de negocio o entregables, contacta con quien te entregó el proyecto. Para incidencias de Supabase o del hosting, consulta la documentación oficial de cada servicio.

*Documento generado para acompañar la entrega del proyecto K'empanadas.*
