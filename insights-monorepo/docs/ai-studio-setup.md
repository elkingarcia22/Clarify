# Configuración de Google AI Studio para Clarify

## Modelos de IA a Crear

### 1. MeetingCategorizer
**Propósito**: Categorizar reuniones automáticamente
**Input**: Texto de la reunión
**Output**: JSON con categoría principal, subcategoría y confianza

```json
{
  "category_main": "Ventas|Usabilidad|Implementacion|Retencion|Soporte|Interna",
  "category_sub": "Primera Reunion|Cierre|Negociacion|Seguimiento|Kick-off|Configuracion|Pruebas|Go-Live|General",
  "confidence": 0.85
}
```

### 2. TaskExtractor
**Propósito**: Extraer tareas accionables de las reuniones
**Input**: Texto de la reunión
**Output**: JSON con lista de tareas

```json
{
  "tasks": [
    {
      "description": "Enviar cotización a Cliente X",
      "responsible": "Pedro",
      "due_date": "before Friday",
      "priority": "high|medium|low"
    }
  ]
}
```

### 3. InsightGenerator
**Propósito**: Generar insights y resúmenes ejecutivos
**Input**: Múltiples reuniones o texto consolidado
**Output**: JSON con resumen ejecutivo e insights

```json
{
  "executive_summary": "Resumen ejecutivo de la semana",
  "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "critical_tasks": ["Tarea crítica 1", "Tarea crítica 2"],
  "sentiment": "positive|neutral|negative",
  "confidence": 0.90
}
```

## Integración con el Sistema Existente

### Variables de Entorno Necesarias
```bash
GOOGLE_AI_STUDIO_API_KEY=tu_api_key_aqui
GOOGLE_AI_STUDIO_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

### Endpoints a Crear
- `POST /ai/categorize` - Categorizar reunión
- `POST /ai/extract-tasks` - Extraer tareas
- `POST /ai/generate-insights` - Generar insights
- `POST /ai/process-meeting` - Procesamiento completo
