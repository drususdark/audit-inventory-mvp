# Guía de Despliegue - Audit Inventory MVP

Esta guía proporciona instrucciones detalladas para desplegar el proyecto en **Vercel** y configurar **Supabase** como base de datos.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Configuración de Groq API](#configuración-de-groq-api)
4. [Despliegue en Vercel](#despliegue-en-vercel)
5. [Verificación del Despliegue](#verificación-del-despliegue)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Prerrequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Cuenta de GitHub con el repositorio clonado
- ✅ Cuenta de Vercel ([vercel.com](https://vercel.com))
- ✅ Cuenta de Supabase ([supabase.com](https://supabase.com))
- ✅ Cuenta de Groq ([console.groq.com](https://console.groq.com))

---

## 🗄️ Configuración de Supabase

### Paso 1: Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión
2. Haz clic en **"New Project"**
3. Completa los siguientes campos:
   - **Name**: `audit-inventory-mvp` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y guárdala
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Pricing Plan**: Selecciona el plan gratuito (Free)
4. Haz clic en **"Create new project"**

Espera unos minutos mientras Supabase configura tu proyecto.

### Paso 2: Obtener la URL de Conexión a la Base de Datos

1. En el panel de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **Database**
3. En la sección **Connection string**, selecciona la pestaña **URI**
4. Copia la cadena de conexión que tiene el formato:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

5. **Importante**: Reemplaza `[password]` con la contraseña que generaste en el Paso 1

6. **Convertir a formato MySQL**: Supabase usa PostgreSQL, pero este proyecto está configurado para MySQL/TiDB. Para compatibilidad, necesitarás usar un adaptador o migrar el esquema. **Recomendación**: Usa TiDB Cloud (gratuito) en lugar de Supabase para evitar problemas de compatibilidad.

### Alternativa: Usar TiDB Cloud (Recomendado)

TiDB Cloud es compatible con MySQL y ofrece un plan gratuito generoso.

1. Ve a [https://tidbcloud.com](https://tidbcloud.com) y crea una cuenta
2. Crea un nuevo cluster (selecciona el plan gratuito)
3. Obtén la cadena de conexión en formato MySQL:

```
mysql://user:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/database
```

4. Usa esta URL como `DATABASE_URL` en Vercel

---

## 🤖 Configuración de Groq API

### Paso 1: Crear una Cuenta en Groq

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Haz clic en **"Sign Up"** y crea una cuenta (puedes usar Google o GitHub)

### Paso 2: Obtener la API Key

1. Una vez dentro del dashboard, ve a **API Keys** en el menú lateral
2. Haz clic en **"Create API Key"**
3. Dale un nombre descriptivo (ej: `audit-inventory-mvp`)
4. Copia la API key generada (comienza con `gsk_...`)
5. **Importante**: Guarda esta key de forma segura, no podrás verla nuevamente

---

## 🚀 Despliegue en Vercel

### Paso 1: Conectar el Repositorio

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona el repositorio `audit-inventory-mvp` de la lista
4. Haz clic en **"Import"**

### Paso 2: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Node.js. Asegúrate de que la configuración sea:

- **Framework Preset**: Vite
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `pnpm build` (o déjalo en automático)
- **Output Directory**: `dist` (o déjalo en automático)
- **Install Command**: `pnpm install` (o déjalo en automático)

### Paso 3: Configurar Variables de Entorno

En la sección **Environment Variables**, agrega las siguientes variables:

#### Variables de Base de Datos

```
DATABASE_URL=mysql://user:password@host:port/database
```

(Usa la URL que obtuviste de TiDB Cloud o Supabase)

#### Variables de Autenticación

Para simplificar, puedes usar valores de prueba inicialmente:

```
JWT_SECRET=tu-secret-key-aleatorio-muy-largo-y-seguro-123456789
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=audit-inventory-mvp
OWNER_OPEN_ID=admin
OWNER_NAME=Admin
```

**Nota**: Para producción, deberás configurar un sistema de autenticación real (OAuth, Auth0, etc.)

#### Variables de Configuración de la Aplicación

```
VITE_APP_TITLE=Audit Inventory MVP
VITE_APP_LOGO=/logo.svg
```

#### Variables de IA

```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_tu_api_key_aqui
```

(Usa la API key que obtuviste de Groq)

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel comenzará a construir y desplegar tu aplicación
3. Espera unos minutos hasta que el despliegue se complete

Una vez completado, verás un mensaje de éxito con la URL de tu aplicación (ej: `https://audit-inventory-mvp.vercel.app`)

---

## ✅ Verificación del Despliegue

### Paso 1: Aplicar el Esquema de Base de Datos

Después del primer despliegue, necesitas aplicar el esquema de base de datos:

1. En tu terminal local, asegúrate de tener las variables de entorno configuradas en un archivo `.env`
2. Ejecuta:

```bash
pnpm db:push
```

Esto creará todas las tablas necesarias en tu base de datos.

### Paso 2: Probar la Aplicación

1. Abre la URL de tu aplicación en Vercel
2. Deberías ver la página de inicio del MVP
3. Prueba las siguientes funcionalidades:
   - Navegar al Dashboard
   - Ver la página de Settings
   - Verificar que no haya errores en la consola del navegador

---

## 🔍 Solución de Problemas

### Error: "Database connection failed"

**Causa**: La variable `DATABASE_URL` no está configurada correctamente.

**Solución**:
1. Verifica que la URL de conexión sea correcta
2. Asegúrate de que la base de datos esté accesible públicamente
3. Verifica que el usuario y la contraseña sean correctos

### Error: "AI Provider error"

**Causa**: La API key de Groq no está configurada o es inválida.

**Solución**:
1. Verifica que `GROQ_API_KEY` esté configurada en Vercel
2. Asegúrate de que la key sea válida y no haya expirado
3. Verifica que `AI_PROVIDER` esté configurado como `groq`

### Error: "Module not found"

**Causa**: Falta alguna dependencia o el build falló.

**Solución**:
1. En Vercel, ve a la pestaña **Deployments**
2. Haz clic en el deployment fallido y revisa los logs
3. Busca errores específicos de módulos faltantes
4. Asegúrate de que todas las dependencias estén en `package.json`

### La aplicación se despliega pero no carga

**Causa**: Puede haber un error de runtime en el servidor.

**Solución**:
1. En Vercel, ve a **Monitoring** → **Runtime Logs**
2. Busca errores en los logs del servidor
3. Verifica que todas las variables de entorno estén configuradas

---

## 🔄 Actualizaciones Automáticas

Vercel está configurado para desplegar automáticamente cada vez que hagas push a la rama `main` en GitHub.

Para desplegar una actualización:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

Vercel detectará el cambio y desplegará automáticamente.

---

## 📚 Recursos Adicionales

- **Documentación de Vercel**: [https://vercel.com/docs](https://vercel.com/docs)
- **Documentación de Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **Documentación de TiDB Cloud**: [https://docs.pingcap.com/tidbcloud](https://docs.pingcap.com/tidbcloud)
- **Documentación de Groq**: [https://console.groq.com/docs](https://console.groq.com/docs)

---

## 🎉 ¡Listo!

Tu aplicación Audit Inventory MVP ahora está desplegada y lista para usar. Si tienes algún problema, consulta la sección de Solución de Problemas o abre un issue en el repositorio de GitHub.

**¡Felicidades!** 🚀

