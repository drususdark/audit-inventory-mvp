/**
 * Módulo de Scoring con IA (Multi-Proveedor)
 * 
 * Soporta múltiples proveedores de IA configurables mediante variables de entorno:
 * - DeepSeek (recomendado, gratuito)
 * - Groq (gratuito y rápido)
 * - Google Gemini
 * - OpenAI
 * 
 * Configuración mediante variables de entorno:
 * - AI_PROVIDER: "deepseek" | "groq" | "gemini" | "openai" (default: "deepseek")
 * - DEEPSEEK_API_KEY: API key de DeepSeek
 * - GROQ_API_KEY: API key de Groq
 * - GEMINI_API_KEY: API key de Google Gemini
 * - OPENAI_API_KEY: API key de OpenAI
 */

// ============================================================
// Tipos y Esquemas
// ============================================================

export interface CriterionScore {
  criterion: string;
  weight: number;
  score: number;
  justification: string;
}

export interface ScoringResult {
  local_name: string;
  total_score: number;
  criteria_scores: CriterionScore[];
}

export interface ScoringResponse {
  success: boolean;
  result?: ScoringResult;
  source: "AI" | "HEURISTIC_FALLBACK";
  provider?: string;
  error?: string;
}

// ============================================================
// Configuración de Criterios
// ============================================================

const SCORING_CRITERIA = [
  {
    criterion: "Exactitud de Inventario",
    weight: 30,
    description: "Mide la correspondencia entre el físico y el sistema",
  },
  {
    criterion: "Faltantes y Pérdidas",
    weight: 25,
    description: "Evalúa las pérdidas directas (valor de faltantes)",
  },
  {
    criterion: "Cumplimiento de Procedimientos",
    weight: 20,
    description: "Evalúa el seguimiento de reglas operacionales",
  },
  {
    criterion: "Organización y Limpieza",
    weight: 10,
    description: "Impacta la eficiencia operativa y la imagen del local",
  },
  {
    criterion: "Gestión de Vencidos/Dañados",
    weight: 10,
    description: "Mide la prevención de pérdidas por productos no vendibles",
  },
  {
    criterion: "Claridad y Estructura del Informe",
    weight: 5,
    description: "Evalúa la calidad del documento que se analiza",
  },
];

// ============================================================
// Configuración de Proveedores
// ============================================================

type AIProvider = "deepseek" | "groq" | "gemini" | "openai";

const AI_PROVIDER = (process.env.AI_PROVIDER || "deepseek") as AIProvider;

// ============================================================
// Función Principal de Scoring
// ============================================================

/**
 * Analiza un informe de inventario y genera una puntuación automática usando IA.
 * 
 * @param reportText - Texto completo del informe de inventario
 * @returns ScoringResponse con el resultado del análisis
 */
export async function scoreReportWithAI(
  reportText: string
): Promise<ScoringResponse> {
  try {
    console.log(`[AI Scoring] Usando proveedor: ${AI_PROVIDER}`);

    let result: ScoringResult;

    switch (AI_PROVIDER) {
      case "deepseek":
        result = await scoreWithDeepSeek(reportText);
        break;
      case "groq":
        result = await scoreWithGroq(reportText);
        break;
      case "gemini":
        result = await scoreWithGemini(reportText);
        break;
      case "openai":
        result = await scoreWithOpenAI(reportText);
        break;
      default:
        throw new Error(`Proveedor de IA no soportado: ${AI_PROVIDER}`);
    }

    return {
      success: true,
      result,
      source: "AI",
      provider: AI_PROVIDER,
    };
  } catch (error) {
    console.error("[AI Scoring] Error al procesar con IA:", error);

    // Fallback a lógica heurística
    return scoreReportWithHeuristic(reportText);
  }
}

// ============================================================
// Implementación: DeepSeek
// ============================================================

async function scoreWithDeepSeek(reportText: string): Promise<ScoringResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY no está configurada");
  }

  const prompt = buildScoringPrompt(reportText);

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de riesgos de inventario. Debes devolver la respuesta únicamente en formato JSON válido, sin texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No se recibió respuesta de DeepSeek");
  }

  return JSON.parse(content);
}

// ============================================================
// Implementación: Groq
// ============================================================

async function scoreWithGroq(reportText: string): Promise<ScoringResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY no está configurada");
  }

  const prompt = buildScoringPrompt(reportText);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de riesgos de inventario. Debes devolver la respuesta únicamente en formato JSON válido, sin texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No se recibió respuesta de Groq");
  }

  return JSON.parse(content);
}

// ============================================================
// Implementación: Google Gemini
// ============================================================

async function scoreWithGemini(reportText: string): Promise<ScoringResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada");
  }

  const prompt = buildScoringPrompt(reportText);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Eres un analista de riesgos de inventario. Debes devolver la respuesta únicamente en formato JSON válido.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text;

  if (!content) {
    throw new Error("No se recibió respuesta de Gemini");
  }

  return JSON.parse(content);
}

// ============================================================
// Implementación: OpenAI
// ============================================================

async function scoreWithOpenAI(reportText: string): Promise<ScoringResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está configurada");
  }

  const prompt = buildScoringPrompt(reportText);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de riesgos de inventario. Debes devolver la respuesta únicamente en formato JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No se recibió respuesta de OpenAI");
  }

  return JSON.parse(content);
}

// ============================================================
// Construcción del Prompt
// ============================================================

function buildScoringPrompt(reportText: string): string {
  return `Analiza el siguiente informe de inventario y genera la puntuación total y por criterio. El puntaje debe basarse en los pesos indicados.

### CRITERIOS DE PUNTUACIÓN:
${SCORING_CRITERIA.map(
  (c, i) => `${i + 1}. ${c.criterion} (Peso: ${c.weight} puntos) - ${c.description}`
).join("\n")}

### TEXTO DEL INFORME A ANALIZAR:

${reportText}

### ESQUEMA DE SALIDA (JSON REQUERIDO):
{
  "local_name": "[Nombre del local extraído del informe]",
  "total_score": [Puntuación total de 0 a 100],
  "criteria_scores": [
    {
      "criterion": "Exactitud de Inventario",
      "weight": 30,
      "score": [Puntuación asignada, de 0 a 30],
      "justification": "[Breve justificación de la puntuación asignada]"
    },
    {
      "criterion": "Faltantes y Pérdidas",
      "weight": 25,
      "score": [Puntuación asignada, de 0 a 25],
      "justification": "[Breve justificación de la puntuación asignada]"
    },
    {
      "criterion": "Cumplimiento de Procedimientos",
      "weight": 20,
      "score": [Puntuación asignada, de 0 a 20],
      "justification": "[Breve justificación de la puntuación asignada]"
    },
    {
      "criterion": "Organización y Limpieza",
      "weight": 10,
      "score": [Puntuación asignada, de 0 a 10],
      "justification": "[Breve justificación de la puntuación asignada]"
    },
    {
      "criterion": "Gestión de Vencidos/Dañados",
      "weight": 10,
      "score": [Puntuación asignada, de 0 a 10],
      "justification": "[Breve justificación de la puntuación asignada]"
    },
    {
      "criterion": "Claridad y Estructura del Informe",
      "weight": 5,
      "score": [Puntuación asignada, de 0 a 5],
      "justification": "[Breve justificación de la puntuación asignada]"
    }
  ]
}

Devuelve SOLO el JSON, sin texto adicional antes o después.`;
}

// ============================================================
// Función de Fallback (Heurística)
// ============================================================

/**
 * Función de fallback que aplica una lógica heurística simple cuando la IA falla.
 * 
 * @param reportText - Texto completo del informe de inventario
 * @returns ScoringResponse con puntuación heurística
 */
function scoreReportWithHeuristic(reportText: string): ScoringResponse {
  console.log("[AI Scoring] Usando fallback heurístico");

  const lowerText = reportText.toLowerCase();

  // Palabras clave negativas que indican problemas
  const negativeKeywords = [
    "faltantes",
    "aumentó",
    "vencidos",
    "errores",
    "problemas",
    "crítico",
    "desordenada",
    "suciedad",
    "pérdidas",
  ];

  // Contar ocurrencias de palabras clave negativas
  const negativeCount = negativeKeywords.reduce((count, keyword) => {
    const matches = lowerText.match(new RegExp(keyword, "g"));
    return count + (matches ? matches.length : 0);
  }, 0);

  // Calcular puntuación base (penalizar por cada palabra negativa)
  const baseScore = Math.max(40, 100 - negativeCount * 10);

  // Generar puntuaciones por criterio (distribución proporcional)
  const criteriaScores: CriterionScore[] = SCORING_CRITERIA.map((criterion) => ({
    criterion: criterion.criterion,
    weight: criterion.weight,
    score: Math.round((baseScore / 100) * criterion.weight),
    justification: "Puntuación calculada mediante análisis heurístico (fallback)",
  }));

  return {
    success: true,
    result: {
      local_name: "Desconocido",
      total_score: baseScore,
      criteria_scores: criteriaScores,
    },
    source: "HEURISTIC_FALLBACK",
  };
}

