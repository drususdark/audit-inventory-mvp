# Análisis de Audit Inventory MVP y Ruta de Trabajo

## 1. Análisis del Estado Actual

La aplicación es un MVP funcional pero con varias carencias críticas y bugs que impiden que sea "100% funcional".

### Funcionalidades Implementadas:
- **Dashboard**: Muestra un ranking de locales basado en puntuaciones promedio.
- **Subida de Informes**: Permite subir texto o archivos (aunque el procesamiento de archivos es limitado).
- **Configuración**: Permite crear locales (aunque hay fallos en la persistencia/UI).
- **Análisis Heurístico**: El servidor analiza el texto buscando palabras clave como "exactitud", "faltantes", etc.

### Problemas Detectados:
1.  **Fallo en Creación de Locales**: La UI no se actualiza correctamente o la mutación falla silenciosamente en producción.
2.  **Falta de Feedback**: La página de subida de informes no redirige ni muestra estados claros de carga.
3.  **Detalle de Local Incompleto**: La página `/local/:id` requiere autenticación pero no hay un flujo de login claro para el usuario final, y el gráfico de evolución no está implementado.
4.  **Procesamiento de Archivos**: El servidor recibe el archivo pero no extrae texto de PDFs o Excel, solo usa el campo `text` si se provee.
5.  **UI/UX Pobre**: Uso inconsistente de componentes de ShadcnUI, falta de skeletons de carga y manejo de errores global.

---

## 2. Lista de Tareas Pendientes (To-Do List)

### Prioridad Alta (Funcionalidad Core)
- [ ] **Tarea 1**: Corregir la creación de locales y asegurar que la lista se actualice inmediatamente.
- [ ] **Tarea 2**: Implementar la extracción de texto real para archivos PDF/Excel en el servidor (usando librerías o IA).
- [ ] **Tarea 3**: Completar la página de Detalle de Local (`LocalDetail.tsx`) con el historial real de informes.
- [ ] **Tarea 4**: Implementar el Gráfico de Evolución de Puntuaciones usando `recharts` o `chart.js`.

### Prioridad Media (UX/UI)
- [ ] **Tarea 5**: Mejorar la navegación y feedback visual (Toasts, Skeletons, Redirecciones).
- [ ] **Tarea 6**: Implementar un sistema de "Override" manual para las puntuaciones de la IA.
- [ ] **Tarea 7**: Añadir validaciones de formularios (Zod) tanto en cliente como en servidor.

### Prioridad Baja (Pulido)
- [ ] **Tarea 8**: Implementar exportación de reportes a PDF.
- [ ] **Tarea 9**: Mejorar el diseño visual del Dashboard con KPIs (Total locales, Promedio global, etc.).

---

## 3. Ruta de Trabajo Punto por Punto

Seguiremos este orden estrictamente, verificando cada cambio:

1.  **Corrección de Locales**: Arreglar `Settings.tsx` y `db.ts` para asegurar persistencia.
2.  **Historial de Informes**: Hacer que el Dashboard y el Detalle de Local muestren la información real y vinculada.
3.  **Gráfico de Evolución**: Implementar la visualización de datos históricos.
4.  **Procesamiento de Archivos**: Mejorar `routers.ts` para manejar el contenido de los archivos subidos.
5.  **Refactor de UI**: Aplicar componentes de ShadcnUI consistentemente en todas las páginas.

---

**Nota**: No se avanzará a la siguiente tarea sin verificar la anterior en el entorno local/simulado.
