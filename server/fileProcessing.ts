/**
 * Módulo de Procesamiento de Archivos
 * 
 * Extrae texto de archivos PDF y Excel para análisis de IA.
 * 
 * Dependencias requeridas:
 * - pdf-parse: Para extracción de texto de PDF
 * - xlsx: Para parsing de archivos Excel
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================
// Tipos
// ============================================================

export interface FileProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
}

// ============================================================
// Función Principal
// ============================================================

/**
 * Procesa un archivo (PDF o Excel) y extrae su contenido como texto.
 * 
 * @param filePath - Ruta absoluta al archivo
 * @param fileType - Tipo de archivo: "pdf" o "excel"
 * @returns FileProcessingResult con el texto extraído
 */
export async function processFile(
  filePath: string,
  fileType: "pdf" | "excel"
): Promise<FileProcessingResult> {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: "El archivo no existe",
      };
    }

    let text: string;

    if (fileType === "pdf") {
      text = await extractTextFromPDF(filePath);
    } else if (fileType === "excel") {
      text = await extractTextFromExcel(filePath);
    } else {
      return {
        success: false,
        error: `Tipo de archivo no soportado: ${fileType}`,
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error) {
    console.error("[File Processing] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// ============================================================
// Extracción de PDF
// ============================================================

async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Importación dinámica de pdf-parse
    const pdfParse = await import("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);
    const data = await (pdfParse as any)(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("[PDF Processing] Error:", error);
    throw new Error("Error al procesar PDF. Asegúrate de que pdf-parse esté instalado.");
  }
}

// ============================================================
// Extracción de Excel
// ============================================================

async function extractTextFromExcel(filePath: string): Promise<string> {
  try {
    // Importación dinámica de xlsx
    const XLSX = await import("xlsx");
    const workbook = XLSX.readFile(filePath);

    let allText = "";

    // Iterar sobre todas las hojas
    workbook.SheetNames.forEach((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      
      // Convertir la hoja a JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Agregar nombre de la hoja
      allText += `\n=== HOJA: ${sheetName} ===\n\n`;

      // Convertir filas a texto
      jsonData.forEach((row: any) => {
        if (Array.isArray(row) && row.length > 0) {
          const rowText = row
            .map((cell) => (cell !== null && cell !== undefined ? String(cell) : ""))
            .join(" | ");
          allText += rowText + "\n";
        }
      });
    });

    return allText;
  } catch (error) {
    console.error("[Excel Processing] Error:", error);
    throw new Error("Error al procesar Excel. Asegúrate de que xlsx esté instalado.");
  }
}

// ============================================================
// Función de Utilidad: Guardar archivo temporal
// ============================================================

/**
 * Guarda un buffer en un archivo temporal y devuelve la ruta.
 * 
 * @param buffer - Buffer del archivo
 * @param extension - Extensión del archivo (ej: "pdf", "xlsx")
 * @returns Ruta del archivo temporal
 */
export function saveTempFile(buffer: Buffer, extension: string): string {
  const tempDir = "/tmp";
  const fileName = `upload_${Date.now()}.${extension}`;
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Elimina un archivo temporal.
 * 
 * @param filePath - Ruta del archivo a eliminar
 */
export function deleteTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("[File Processing] Error al eliminar archivo temporal:", error);
  }
}

