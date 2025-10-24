# Handover Pack - Audit Inventory MVP

**Paquete de Transferencia Completo del Proyecto**

Este documento contiene toda la información necesaria para comprender, mantener y extender el proyecto Audit Inventory MVP.

---

## 📋 Información General del Proyecto

### Descripción

Sistema web de auditoría de inventarios que utiliza inteligencia artificial para analizar informes de múltiples locales, asignar puntuaciones automáticas (0-100) basadas en criterios predefinidos, y generar rankings con evolución histórica.

### Objetivo del MVP

Proporcionar una herramienta automatizada para evaluar la calidad de los inventarios de múltiples locales, reduciendo el tiempo de análisis manual y proporcionando métricas objetivas y comparables.

### Estado Actual

✅ **Completado** - El MVP está funcional y listo para despliegue. Incluye todas las funcionalidades core solicitadas.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| **Frontend** | React | 19 | Framework moderno con excelente ecosistema |
| **Estilos** | Tailwind CSS | 4 | Desarrollo rápido y consistente |
| **Backend** | Express + tRPC | 4 + 11 | Type-safe API sin boilerplate |
| **Base de Datos** | MySQL/TiDB | - | Compatible con Supabase y TiDB Cloud (gratuito) |
| **ORM** | Drizzle ORM | - | Type-safe queries con excelente DX |
| **IA** | Groq/Gemini/OpenAI | - | Multi-proveedor configurable |
| **Gráficos** | Recharts | - | Visualizaciones responsivas |
| **Procesamiento** | pdf-parse, xlsx | - | Extracción de texto de archivos |

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  React 19 + TypeScript + Tailwind CSS + tRPC Client        │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐    │
│  │  Home   │  │Dashboard │  │ Upload  │  │ Settings │    │
│  └─────────┘  └──────────┘  └─────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      tRPC API LAYER                         │
│  ┌────────┐  ┌─────────┐  ┌────────┐  ┌─────────┐        │
│  │ Locals │  │ Reports │  │ Scores │  │ Ranking │        │
│  └────────┘  └─────────┘  └────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                           │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────┐    │
│  │ AI Scoring   │  │ File Processing  │  │ Database │    │
│  │ (Multi-prov) │  │ (PDF/Excel)      │  │ Queries  │    │
│  └──────────────┘  └──────────────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                         │
│  MySQL/TiDB (Drizzle ORM)                                   │
│  ┌────────┐  ┌─────────┐  ┌────────┐  ┌──────────┐       │
│  │ locals │  │ reports │  │ scores │  │ auditLog │       │
│  └────────┘  └─────────┘  └────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Modelo de Datos

### Esquema de Base de Datos

#### Tabla: `locals`

Almacena la información de los locales a auditar.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `name` | VARCHAR(255) | Nombre del local |
| `address` | TEXT | Dirección física |
| `createdAt` | DATETIME | Fecha de creación |
| `updatedAt` | DATETIME | Fecha de última actualización |

#### Tabla: `reports`

Almacena los informes de inventario subidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `localId` | INT (FK → locals.id) | Local asociado |
| `reportDate` | DATETIME | Fecha del informe |
| `reportType` | ENUM('text', 'pdf', 'excel') | Tipo de archivo |
| `fileUrl` | TEXT | URL del archivo en S3 |
| `extractedText` | TEXT | Texto extraído del archivo |
| `createdAt` | DATETIME | Fecha de creación |
| `updatedAt` | DATETIME | Fecha de última actualización |

#### Tabla: `scores`

Almacena las puntuaciones de los informes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `reportId` | INT (FK → reports.id) | Informe asociado |
| `aiScore` | INT | Puntuación generada por IA |
| `finalScore` | INT | Puntuación final (puede ser modificada) |
| `criteriaScores` | JSON | Desglose por criterio |
| `isOverridden` | BOOLEAN | Si fue modificada manualmente |
| `overrideReason` | TEXT | Justificación del override |
| `aiProvider` | VARCHAR(50) | Proveedor de IA usado |
| `createdAt` | DATETIME | Fecha de creación |
| `updatedAt` | DATETIME | Fecha de última actualización |

#### Tabla: `auditLog`

Registra todas las acciones importantes del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `reportId` | INT (FK → reports.id) | Informe asociado (opcional) |
| `userId` | INT | Usuario que realizó la acción |
| `action` | VARCHAR(255) | Tipo de acción |
| `details` | TEXT | Detalles adicionales |
| `createdAt` | DATETIME | Fecha de creación |

---

## 🤖 Sistema de Puntuación con IA

### Criterios de Evaluación

El sistema evalúa los informes basándose en 6 criterios con pesos específicos:

| # | Criterio | Peso | Descripción |
|---|----------|------|-------------|
| 1 | Exactitud de Inventario | 30 pts | Correspondencia entre físico y sistema |
| 2 | Faltantes y Pérdidas | 25 pts | Valor de productos faltantes |
| 3 | Cumplimiento de Procedimientos | 20 pts | Seguimiento de reglas operacionales |
| 4 | Organización y Limpieza | 10 pts | Eficiencia operativa e imagen |
| 5 | Gestión de Vencidos/Dañados | 10 pts | Prevención de pérdidas |
| 6 | Claridad del Informe | 5 pts | Calidad del documento |

**Total**: 100 puntos

### Proveedores de IA Soportados

El sistema soporta múltiples proveedores configurables mediante la variable `AI_PROVIDER`:

1. **Groq** (Recomendado)
   - **Ventajas**: Gratuito, extremadamente rápido (LPU), límites generosos
   - **Límites**: 30 req/min, 14,400 req/día, 1.4M tokens/día
   - **Modelo**: Llama 3.1 70B Versatile
   - **API Key**: Obtener en [console.groq.com/keys](https://console.groq.com/keys)

2. **Google Gemini**
   - **Ventajas**: Gratuito, buen análisis de texto
   - **Límites**: 15 req/min, 1500 req/día
   - **Modelo**: Gemini 2.0 Flash Exp
   - **API Key**: Obtener en [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

3. **OpenAI**
   - **Ventajas**: Alta calidad
   - **Desventajas**: Requiere pago
   - **Modelo**: GPT-4o Mini
   - **API Key**: Obtener en [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Fallback Heurístico

Si la IA falla, el sistema aplica una lógica heurística simple:

- Busca palabras clave negativas en el texto (faltantes, errores, problemas, etc.)
- Penaliza la puntuación base (100) por cada ocurrencia
- Distribuye la puntuación proporcionalmente entre los criterios

---

## 🔧 Configuración y Variables de Entorno

### Variables Requeridas

```env
# Base de Datos
DATABASE_URL="mysql://user:password@host:port/database"

# Autenticación
JWT_SECRET="secret-key-aleatorio-muy-largo"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"
VITE_APP_ID="tu-app-id"
OWNER_OPEN_ID="tu-open-id"
OWNER_NAME="Tu Nombre"

# Configuración de la Aplicación
VITE_APP_TITLE="Audit Inventory MVP"
VITE_APP_LOGO="/logo.svg"

# Proveedor de IA
AI_PROVIDER="groq"  # groq, gemini, openai
GROQ_API_KEY="gsk_..."
```

### Configuración de Proveedores de IA

Para cambiar de proveedor, simplemente modifica las variables:

```env
# Para usar Groq (recomendado)
AI_PROVIDER="groq"
GROQ_API_KEY="gsk_..."

# Para usar Gemini
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIza..."

# Para usar OpenAI
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

---

## 📁 Estructura de Archivos Clave

### Backend (server/)

```
server/
├── routers.ts              # Definición de routers tRPC (locals, reports, scores, ranking)
├── db.ts                   # Funciones de consulta a la base de datos
├── aiScoring.ts            # Integración con IA multi-proveedor
├── fileProcessing.ts       # Procesamiento de PDF y Excel
└── _core/                  # Infraestructura (no modificar)
    ├── context.ts          # Context de tRPC (auth)
    ├── trpc.ts             # Configuración de tRPC
    ├── index.ts            # Servidor Express
    └── ...
```

### Frontend (client/src/)

```
client/src/
├── pages/                  # Páginas de la aplicación
│   ├── Home.tsx            # Landing page
│   ├── Dashboard.tsx       # Ranking de locales
│   ├── Upload.tsx          # Subir informes
│   ├── LocalDetail.tsx     # Detalle de local con gráfico
│   └── Settings.tsx        # Configuración
├── components/             # Componentes reutilizables
│   ├── ScoreEvolutionChart.tsx  # Gráfico de evolución
│   └── ui/                 # Componentes de shadcn/ui
├── lib/
│   └── trpc.ts             # Cliente tRPC
├── App.tsx                 # Rutas y layout
└── main.tsx                # Entry point
```

### Base de Datos (drizzle/)

```
drizzle/
└── schema.ts               # Definición de tablas (locals, reports, scores, auditLog)
```

---

## 🚀 Comandos Útiles

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Aplicar esquema de base de datos
pnpm db:push

# Generar tipos de Drizzle
pnpm db:generate
```

### Producción

```bash
# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

### Base de Datos

```bash
# Backup de la base de datos
./scripts/backup_restore.sh backup

# Restore de la base de datos
./scripts/backup_restore.sh restore backup_YYYYMMDD_HHMMSS.sql
```

---

## 🔄 Flujo de Trabajo Típico

### 1. Subir un Informe

```
Usuario → Upload Page → Selecciona archivo (PDF/Excel/Texto)
                      ↓
              File Processing (extractTextFromPDF/Excel)
                      ↓
              AI Scoring (scoreReportWithAI)
                      ↓
              Guardar en DB (reports + scores)
                      ↓
              Mostrar resultado al usuario
```

### 2. Ver Ranking

```
Usuario → Dashboard → trpc.ranking.getAll.useQuery()
                    ↓
              getAllLocalsWithScores() en server/db.ts
                    ↓
              Calcular promedios por local
                    ↓
              Ordenar por avgScore descendente
                    ↓
              Mostrar tabla de ranking
```

### 3. Ver Detalle de Local

```
Usuario → LocalDetail → trpc.ranking.getByLocal.useQuery({ localId })
                      ↓
              getLocalWithScores(localId) en server/db.ts
                      ↓
              Obtener local + reports + scores
                      ↓
              Mostrar historial + gráfico de evolución
```

### 4. Override Manual

```
Usuario → LocalDetail → Modificar puntuación manualmente
                      ↓
              trpc.scores.override.useMutation()
                      ↓
              updateScore() en server/db.ts
                      ↓
              createAuditLog() para registrar la acción
                      ↓
              Actualizar UI
```

---

## 🧪 Testing

### Tests Unitarios

El proyecto incluye tests básicos para las funciones críticas:

```bash
pnpm test
```

### Tests E2E (Pendiente)

Se recomienda implementar tests end-to-end con Playwright o Cypress para validar:

- Flujo completo de subida de informe
- Cálculo correcto de puntuaciones
- Visualización de ranking
- Override manual de puntuaciones

---

## 🔒 Seguridad

### Consideraciones Implementadas

- ✅ Autenticación mediante OAuth
- ✅ Validación de inputs en tRPC
- ✅ Sanitización de datos antes de guardar en DB
- ✅ API keys almacenadas en variables de entorno (nunca en código)
- ✅ Audit log de todas las acciones críticas

### Recomendaciones Adicionales

- 🔹 Implementar rate limiting en las rutas de API
- 🔹 Agregar CORS restrictivo en producción
- 🔹 Implementar CSP (Content Security Policy)
- 🔹 Auditoría de dependencias con `pnpm audit`

---

## 📈 Escalabilidad

### Límites Actuales

- **Proveedores de IA**: Límites de free tier (ver sección de IA)
- **Base de Datos**: Depende del plan de TiDB Cloud o Supabase
- **Almacenamiento**: Archivos en S3 (o Supabase Storage)

### Recomendaciones para Escalar

1. **IA**: Migrar a plan de pago si se superan los límites gratuitos
2. **Base de Datos**: Implementar índices en columnas frecuentemente consultadas
3. **Cache**: Agregar Redis para cachear rankings y estadísticas
4. **CDN**: Usar Vercel Edge Network para servir assets estáticos
5. **Queue**: Implementar cola de procesamiento (Bull, BullMQ) para análisis de informes pesados

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Error de conexión a la base de datos

**Síntoma**: `Database connection failed`

**Solución**:
- Verificar que `DATABASE_URL` esté correctamente configurada
- Asegurarse de que la base de datos esté accesible públicamente
- Verificar que el usuario y la contraseña sean correctos

### 2. IA no responde o devuelve errores

**Síntoma**: `AI Provider error` o puntuaciones heurísticas constantes

**Solución**:
- Verificar que la API key esté configurada correctamente
- Verificar que no se hayan superado los límites de rate limiting
- Revisar los logs del servidor para ver el error específico
- El sistema automáticamente usará el fallback heurístico si la IA falla

### 3. Archivos PDF no se procesan correctamente

**Síntoma**: Texto extraído vacío o incompleto

**Solución**:
- Verificar que el PDF no esté protegido o encriptado
- Algunos PDFs escaneados (imágenes) no contienen texto extraíble
- Considerar implementar OCR (Tesseract.js) para PDFs escaneados

---

## 📚 Recursos y Referencias

### Documentación de Tecnologías

- **React**: [https://react.dev](https://react.dev)
- **tRPC**: [https://trpc.io](https://trpc.io)
- **Drizzle ORM**: [https://orm.drizzle.team](https://orm.drizzle.team)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **Recharts**: [https://recharts.org](https://recharts.org)

### Documentación de Proveedores

- **Vercel**: [https://vercel.com/docs](https://vercel.com/docs)
- **TiDB Cloud**: [https://docs.pingcap.com/tidbcloud](https://docs.pingcap.com/tidbcloud)
- **Groq**: [https://console.groq.com/docs](https://console.groq.com/docs)
- **Gemini**: [https://ai.google.dev/docs](https://ai.google.dev/docs)

---

## 🤝 Soporte y Mantenimiento

### Contacto

Para preguntas o problemas, abre un issue en el repositorio de GitHub:

**Repositorio**: [https://github.com/drususdark/audit-inventory-mvp](https://github.com/drususdark/audit-inventory-mvp)

### Mantenimiento Recomendado

- **Semanal**: Revisar logs de errores y métricas de uso
- **Mensual**: Actualizar dependencias (`pnpm update`)
- **Trimestral**: Auditoría de seguridad (`pnpm audit`)
- **Anual**: Revisión completa de arquitectura y optimizaciones

---

## 📝 Changelog

### v1.0.0 (2025-01-24)

- ✅ Implementación completa del MVP
- ✅ Integración multi-proveedor de IA (Groq, Gemini, OpenAI)
- ✅ Procesamiento de archivos PDF y Excel
- ✅ Ranking de locales con cálculo de promedios
- ✅ Gráficos de evolución con Recharts
- ✅ Override humano de puntuaciones con audit log
- ✅ Documentación completa (README, Handover Pack, guías)

---

## 🎉 Conclusión

Este proyecto está listo para ser desplegado y usado en producción. Toda la funcionalidad core solicitada ha sido implementada y documentada.

**Próximos pasos sugeridos:**

1. Desplegar en Vercel siguiendo la [Guía de Despliegue](docs/DEPLOYMENT_GUIDE.md)
2. Configurar la base de datos en TiDB Cloud o Supabase
3. Obtener una API key de Groq y configurarla
4. Probar el flujo completo con informes reales
5. Iterar y mejorar basándose en feedback de usuarios

**¡Éxito con el proyecto!** 🚀

