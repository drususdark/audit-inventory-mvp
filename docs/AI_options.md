# Opciones de Modelos de Inteligencia Artificial (IA) Gratuitos para Scoring de Auditorías

Este documento presenta un análisis comparativo de tres opciones de Modelos de Lenguaje Grande (LLM) con planes de uso gratuito o *free-tier* que son viables para implementar el motor de puntuación automática del MVP de auditoría de inventarios.

El requisito fundamental es que el motor de IA sea **gratuito** y capaz de procesar texto de un informe, aplicar una lista de criterios y devolver una puntuación estructurada en formato JSON.

## 1. Opciones de IA Analizadas

Las opciones seleccionadas son **DeepSeek**, **Gemini API (Google)** y **Groq**, ya que ofrecen APIs accesibles para desarrolladores con planes iniciales sin costo.

| Característica | DeepSeek (vía OpenRouter) | Gemini API (Google) | Groq |
| :--- | :--- | :--- | :--- |
| **Modelo Recomendado** | `deepseek-r1:free` (vía OpenRouter) | `gemini-2.5-flash` | Llama 3 8B (vía GroqCloud) |
| **Costo Base** | Gratuito | Gratuito | Gratuito |
| **Límites de Uso (Free Tier)** | Aprox. **50 solicitudes/día** (sujeto a cambios por OpenRouter) | **5-15 solicitudes/min** y hasta **500 solicitudes/día** (sujeto a modelo y región) | **30 solicitudes/min** y **1.4 millones de tokens/día** (muy alto, pero enfocado en velocidad) |
| **Latencia Esperada** | Moderada | Baja | **Extremadamente Baja** (LPU - Latency Processing Unit) |
| **Soporte JSON** | Sí (vía OpenRouter o API directa) | Sí (Modo de respuesta JSON nativo) | Sí (vía `response_format` en la API) |
| **Soporte para *Prompting* Complejo** | Alto | Alto | Alto |
| **Viabilidad para MVP** | **Alta** (Excelente modelo, pero límite diario bajo) | **Muy Alta** (Límites generosos, ideal para un MVP) | **Alta** (Velocidad impresionante, ideal para UX, pero límites diarios menos claros para el *free tier* a largo plazo) |

## 2. Recomendación para el MVP

Se recomienda utilizar **Gemini API (Google) con el modelo `gemini-2.5-flash`** como la opción por defecto.

**Ventajas de Gemini:**
1.  **Límites Generosos:** El *free tier* de Gemini es más robusto y permite un mayor volumen de pruebas y uso inicial (hasta 500 solicitudes por día) en comparación con el límite de 50 de DeepSeek a través de OpenRouter.
2.  **Soporte Nativo:** Ofrece un modo de respuesta JSON nativo y bien documentado, lo que simplifica la integración y el *parsing* en el código de la aplicación.
3.  **Plan de Contingencia (Escalabilidad):** Si el MVP escala, la transición al plan de pago de Gemini es directa, con costos por token muy competitivos.

## 3. Plan de Contingencia (Fallback)

El requisito exige un plan de contingencia si la IA gratuita falla por límite de uso.

| Escenario | Solución Propuesta | Detalle de Implementación |
| :--- | :--- | :--- |
| **Fallo por Límite de Tasa (Rate Limit)** | **Fallback a Lógica Heurística Local** | Si la llamada a la API de IA devuelve un error de `429 Too Many Requests`, el *backend* (o la función de Supabase/Vercel) debe ejecutar una **función heurística simple** en JavaScript/TypeScript. |
| **Función Heurística** | Análisis de Palabras Clave | La función buscará palabras clave de alto impacto en el informe (ej. "faltantes", "aumentó", "vencidos", "errores") y asignará una puntuación baja predefinida (ej. 40/100) o aplicará una penalización simple. |
| **Registro y UI** | Marcar como "Puntuación Heurística" | El campo `audit_log` en la base de datos registrará `source: 'HEURISTIC_FALLBACK'`. La UI mostrará una etiqueta clara indicando que la puntuación fue calculada localmente y no por la IA. |

## 4. Diseño del Modelo de Puntuación (Criterios y Pesos)

El modelo de puntuación se basa en el análisis del informe de ejemplo y los requisitos de una auditoría de inventario, con un enfoque en la **gestión de riesgos** y el **cumplimiento de procedimientos**.

### Criterios de Evaluación

Se proponen 6 criterios que suman un total de **100 puntos**.

| Criterio | Peso (Puntos) | Justificación |
| :--- | :--- | :--- |
| **1. Exactitud de Inventario** | **30** | Mide la correspondencia entre el físico y el sistema. Es el indicador principal de control de stock. |
| **2. Faltantes y Pérdidas** | **25** | Evalúa las pérdidas directas (valor de faltantes). Es un impacto económico directo. |
| **3. Cumplimiento de Procedimientos** | **20** | Evalúa el seguimiento de reglas operacionales (ej. facturas, vales, préstamos). Es clave para la prevención de errores futuros. |
| **4. Organización y Limpieza** | **10** | Impacta la eficiencia operativa y la imagen del local. |
| **5. Gestión de Vencidos/Dañados** | **10** | Mide la prevención de pérdidas por productos no vendibles. |
| **6. Claridad y Estructura del Informe** | **5** | Evalúa la calidad del documento que se analiza. |
| **TOTAL** | **100** | |

## 5. Ejemplo de Informe de Prueba (Caso 1: "Alerce")

Utilizaremos el informe proporcionado por el usuario (`INFORMEINVENTARIOALERCEOCTUBRE2025.docx`) para demostrar cómo se aplicaría la puntuación.

**Informe Analizado:** Inventario Minimarket "Alerce" (Octubre 2025).

| Criterio | Puntuación (Máx.) | Puntuación Asignada | Justificación (Explicación para la IA) |
| :--- | :--- | :--- | :--- |
| **1. Exactitud (30)** | 30 | **28** | La exactitud del 95.66% supera la meta del 95%. Se asigna una puntuación alta. |
| **2. Faltantes (25)** | 25 | **10** | Faltantes del 4.34%, muy superior a la meta del 1%. El valor de faltantes aumentó ($125,171). **Penalización severa.** |
| **3. Cumplimiento (20)** | 20 | **12** | Alto porcentaje de facturas con errores (6.91% vs meta <2%). Recomendaciones sobre préstamos y vales no seguidas. |
| **4. Organización (10)** | 10 | **7** | Bodega con buen orden, pero se observan fallos de limpieza en zonas altas y estanterías. |
| **5. Vencidos/Dañados (10)** | 10 | **9** | Nivel muy bajo (0.01%), dentro de lo aceptable. Se recomienda reforzar el control, pero el resultado actual es bueno. |
| **6. Claridad (5)** | 5 | **5** | El informe es claro, estructurado, incluye datos clave y una tabla comparativa. |
| **PUNTUACIÓN TOTAL** | **100** | **71** | |

## 6. Prompt Final para la IA (Template JSON)

El *prompt* instruye a la IA para que actúe como un analista de riesgos, evalúe el texto del informe basándose en los criterios y devuelva el resultado en un formato JSON estricto.

```json
{
  "role": "system",
  "content": "Eres un analista de riesgos de inventario. Tu tarea es evaluar el texto de un informe de auditoría basándote en los 6 criterios proporcionados y asignar una puntuación de 0 a 100. Debes devolver la respuesta **únicamente** en formato JSON, siguiendo el esquema de salida. No incluyas texto explicativo fuera del JSON."
}
{
  "role": "user",
  "content": "Analiza el siguiente informe de inventario y genera la puntuación total y por criterio. El puntaje debe basarse en los pesos indicados.\n\n### CRITERIOS DE PUNTUACIÓN:\n1. Exactitud de Inventario (Peso: 30 puntos)\n2. Faltantes y Pérdidas (Peso: 25 puntos)\n3. Cumplimiento de Procedimientos (Peso: 20 puntos)\n4. Organización y Limpieza (Peso: 10 puntos)\n5. Gestión de Vencidos/Dañados (Peso: 10 puntos)\n6. Claridad y Estructura del Informe (Peso: 5 puntos)\n\n### TEXTO DEL INFORME A ANALIZAR:\n\n[TEXTO COMPLETO DEL INFORME DE INVENTARIO]\n\n### ESQUEMA DE SALIDA (JSON REQUERIDO):\n{\n  \"local_name\": \"[Nombre del local]\",\n  \"total_score\": [Puntuación total de 0 a 100],\n  \"criteria_scores\": [\n    {\n      \"criterion\": \"Exactitud de Inventario\",\n      \"weight\": 30,\n      \"score\": [Puntuación asignada, de 0 a 30],\n      \"justification\": \"[Breve justificación de la puntuación asignada]\"\n    },\n    {\n      \"criterion\": \"Faltantes y Pérdidas\",\n      \"weight\": 25,\n      \"score\": [Puntuación asignada, de 0 a 25],\n      \"justification\": \"[Breve justificación de la puntuación asignada]\"\n    },\n    {\n      \"criterion\": \"Cumplimiento de Procedimientos\",\n      \"weight\": 20,\n      \"score\": [Puntuación asignada, de 0 a 20],\n      \"justification\": \"[Breve justificación de la puntuación asignada]\"\n    },\n    {\n      \"criterion\": \"Organización y Limpieza\",\n      \"weight\": 10,\n      \"score\": [Puntuación asignada, de 0 a 10],\n      \"justification\": \"[Breve justificación de la puntuación asignada]\"\n    },\n    {\n      \"criterion\": \"Gestión de Vencidos/Dañados\",\n      \"weight\": 10,\n      \"score\": [Puntuación asignada, de 0 a 10],\n      \"justification\": \"[Breve justificación de la puntuación asignada]\"\n    },\n    {\n      \"criterion\": \"Claridad y Estructura del Informe\",\n      \"weight\": 5,\n      \"score\": [Puntuación asignada, de 0 a 5],\n      \"justification\": \"[Breve justificación de la puntuación asignada]\"\n    }\n  ]\n}"
}
```

## 7. Ejemplos de Prueba Adicionales

Para asegurar la robustez del modelo, se proponen dos escenarios adicionales:

### Caso 2: "Tienda Modelo" (Puntuación Esperada: 95/100)

**Resumen del Informe:**
*   Exactitud del inventario: 99.8% (Meta 95%).
*   Faltantes: 0.2% (Meta 1%).
*   Cumplimiento de registro de facturas: 0% errores.
*   Organización: Excelente, sin observaciones de limpieza o desorden.
*   Vencidos/Dañados: 0.05% (Aceptable).
*   Observaciones: Solo una nota menor sobre la necesidad de actualizar el cartel de horario.

**Puntuación Esperada por Criterio:**
*   Exactitud: 30/30
*   Faltantes: 25/25
*   Cumplimiento: 20/20
*   Organización: 9/10
*   Vencidos/Dañados: 10/10
*   Claridad: 1/5 (si el informe es muy breve y sin datos)
*   **Total Esperado: 95/100**

### Caso 3: "Local con Problemas Críticos" (Puntuación Esperada: 35/100)

**Resumen del Informe:**
*   Exactitud del inventario: 85% (Fallo crítico).
*   Faltantes: 15% (Fallo crítico).
*   Cumplimiento de registro de facturas: 30% errores.
*   Organización: Bodega desordenada, pasillos obstruidos.
*   Vencidos/Dañados: 5% (Muy alto).
*   Observaciones: El informe es confuso y carece de datos numéricos clave.

**Puntuación Esperada por Criterio:**
*   Exactitud: 5/30 (Muy bajo)
*   Faltantes: 0/25 (Pérdida inaceptable)
*   Cumplimiento: 5/20 (Fallo de control)
*   Organización: 2/10 (Riesgo operativo)
*   Vencidos/Dañados: 0/10 (Pérdida alta)
*   Claridad: 3/5 (Si el informe es confuso)
*   **Total Esperado: 35/100**

---

**Próximo Paso:** Con el modelo de IA y el *prompt* definidos, se procederá a la inicialización del proyecto web y la estructura de la base de datos.

**Nota:** El texto del informe de prueba (`INFORMEINVENTARIOALERCEOCTUBRE2025.docx`) se ha extraído y se usará como el primer ejemplo de prueba. Los Casos 2 y 3 serán simulados para las pruebas unitarias.
