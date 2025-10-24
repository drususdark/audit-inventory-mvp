# Audit Inventory MVP

**Sistema de Auditoría de Inventarios con IA** - Analiza informes de inventario, asigna puntuaciones automáticas y genera rankings de locales con evolución histórica.

---

## 📋 Descripción del Proyecto

Este MVP (Producto Mínimo Viable) es una aplicación web diseñada para auditar informes de inventario de múltiples locales. El sistema utiliza inteligencia artificial para analizar automáticamente los informes (texto, PDF o Excel) y asignar una puntuación de 0 a 100 basada en criterios predefinidos.

### Características Principales

- **Análisis Automático con IA**: Sube informes en texto, PDF o Excel y obtén una puntuación automática basada en 6 criterios de evaluación
- **Multi-Proveedor de IA**: Soporte configurable para Groq, Google Gemini y OpenAI
- **Ranking de Locales**: Visualiza un ranking de locales ordenado por puntuación promedio
- **Evolución Histórica**: Consulta gráficos de evolución de puntuaciones por local
- **Override Humano**: Permite modificar manualmente las puntuaciones con justificación y audit log
- **Procesamiento de Archivos**: Extracción automática de texto de PDF y Excel
- **Fallback Heurístico**: Si la IA falla, el sistema aplica una lógica heurística simple

---

## 🏗️ Arquitectura y Tecnologías

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS 4 |
| **Backend** | Express 4 + tRPC 11 |
| **Base de Datos** | MySQL / TiDB (compatible con Supabase) |
| **Autenticación** | Manus OAuth |
| **IA** | Groq API (recomendado) / Gemini / OpenAI |
| **Gráficos** | Recharts |
| **Procesamiento de Archivos** | pdf-parse, xlsx |
| **Despliegue** | Vercel (recomendado) |

### Estructura del Proyecto

```
audit-inventory-mvp/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Configuración de tRPC
│   │   └── App.tsx        # Rutas y layout
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Definición de routers tRPC
│   ├── db.ts              # Funciones de consulta a la DB
│   ├── aiScoring.ts       # Integración con IA
│   ├── fileProcessing.ts  # Procesamiento de PDF/Excel
│   └── _core/             # Infraestructura (OAuth, context, etc.)
├── drizzle/               # Esquema de base de datos
│   └── schema.ts          # Definición de tablas
├── scripts/               # Scripts de utilidad
│   └── backup_restore.sh  # Backup y restore de DB
├── db/                    # Datos de ejemplo
│   └── seed_data.sql      # SQL de ejemplo
└── docs/                  # Documentación
    ├── AI_options.md      # Comparación de proveedores de IA
    └── DEPLOYMENT_GUIDE.md # Guía de despliegue
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y pnpm
- Cuenta de Supabase (o MySQL/TiDB)
- API Key de Groq (gratuita): [https://console.groq.com/keys](https://console.groq.com/keys)

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/drususdark/audit-inventory-mvp.git
cd audit-inventory-mvp
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos
DATABASE_URL="mysql://user:password@host:port/database"

# Autenticación (configurar según tu proveedor OAuth)
JWT_SECRET="tu-secret-key-aleatorio-muy-largo"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"
VITE_APP_ID="tu-app-id"
OWNER_OPEN_ID="tu-open-id"
OWNER_NAME="Tu Nombre"

# Configuración de la Aplicación
VITE_APP_TITLE="Audit Inventory MVP"
VITE_APP_LOGO="/logo.svg"

# Proveedor de IA (groq, gemini, openai)
AI_PROVIDER="groq"
GROQ_API_KEY="gsk_..."
```

4. **Aplicar el esquema de base de datos**

```bash
pnpm db:push
```

5. **Iniciar el servidor de desarrollo**

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📊 Modelo de Puntuación

El sistema evalúa los informes de inventario basándose en 6 criterios con pesos específicos:

| Criterio | Peso | Descripción |
|----------|------|-------------|
| **Exactitud de Inventario** | 30 pts | Correspondencia entre el físico y el sistema |
| **Faltantes y Pérdidas** | 25 pts | Valor de productos faltantes |
| **Cumplimiento de Procedimientos** | 20 pts | Seguimiento de reglas operacionales |
| **Organización y Limpieza** | 10 pts | Eficiencia operativa e imagen del local |
| **Gestión de Vencidos/Dañados** | 10 pts | Prevención de pérdidas por productos no vendibles |
| **Claridad del Informe** | 5 pts | Calidad del documento analizado |

**Total**: 100 puntos

---

## 🔧 Configuración de Proveedores de IA

El sistema soporta múltiples proveedores de IA configurables mediante la variable `AI_PROVIDER`.

### Opción 1: Groq (Recomendado)

**Ventajas**: Gratuito, extremadamente rápido, límites generosos (30 req/min, 14,400 req/día)

```env
AI_PROVIDER="groq"
GROQ_API_KEY="gsk_..."
```

Obtén tu API key en: [https://console.groq.com/keys](https://console.groq.com/keys)

### Opción 2: Google Gemini

**Ventajas**: Gratuito, buen análisis de texto (15 req/min, 1500 req/día)

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIza..."
```

Obtén tu API key en: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Opción 3: OpenAI

**Ventajas**: Alta calidad, pero requiere pago

```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

Obtén tu API key en: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

Para más detalles, consulta [docs/AI_options.md](docs/AI_options.md)

---

## 📦 Despliegue

### Despliegue en Vercel

1. **Conectar el repositorio a Vercel**

   - Ve a [vercel.com](https://vercel.com) y crea una cuenta
   - Haz clic en "Add New Project" y selecciona el repositorio de GitHub
   - Vercel detectará automáticamente la configuración

2. **Configurar variables de entorno**

   En la configuración del proyecto en Vercel, agrega todas las variables de entorno necesarias (ver sección de Inicio Rápido)

3. **Desplegar**

   Vercel desplegará automáticamente en cada push a la rama `main`

Para instrucciones detalladas, consulta [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 📚 Documentación Adicional

- **[docs/AI_options.md](docs/AI_options.md)**: Comparación detallada de proveedores de IA
- **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)**: Guía completa de despliegue en Vercel y configuración de Supabase
- **[HANDOVER_PACK.md](HANDOVER_PACK.md)**: Paquete completo de transferencia del proyecto

---

## 🧪 Testing

El proyecto incluye tests básicos. Para ejecutarlos:

```bash
pnpm test
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerencias o mejoras.

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👤 Autor

**Manus AI**

---

## 📞 Soporte

Para preguntas o problemas, abre un issue en el repositorio de GitHub.

---

**¡Gracias por usar Audit Inventory MVP!** 🎉

