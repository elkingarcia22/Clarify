import { Router } from 'express';
import { supa } from '../lib/supa.js';

export const aiRouter = Router();

// Configuración de Google AI Studio
const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;

// Función helper para llamar a Google AI Studio
async function callGoogleAI(prompt: string, model: string = 'gemini-1.5-flash') {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_STUDIO_API_KEY not configured');
  }

  const response = await fetch(`${GOOGLE_AI_BASE_URL}/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// POST /ai/categorize - Categorizar reunión
aiRouter.post('/categorize', async (req, res) => {
  try {
    const { meeting_text, meeting_title } = req.body;
    
    if (!meeting_text) {
      return res.status(400).json({ error: 'meeting_text is required' });
    }

    const prompt = `Eres un experto analista de reuniones. Categoriza las siguientes notas de reunión.

NOTAS DE REUNIÓN:
${meeting_title ? `Título: ${meeting_title}\n` : ''}
${meeting_text}

Responde ÚNICAMENTE con un JSON válido que contenga:
- "category_main": Una de estas categorías: "Ventas", "Usabilidad", "Implementacion", "Retencion", "Soporte", "Interna"
- "category_sub": Subcategoría específica o "General" si no aplica
- "confidence": Número entre 0 y 1 indicando la confianza en la categorización

Ejemplo de respuesta:
{"category_main": "Ventas", "category_sub": "Negociacion", "confidence": 0.85}`;

    const aiResponse = await callGoogleAI(prompt);
    
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (e) {
      // Si no es JSON válido, intentar extraer JSON del texto
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    console.log('[AI] Categorization result:', result);

    res.json({
      success: true,
      result,
      raw_response: aiResponse
    });

  } catch (e: any) {
    console.error('[AI] Categorization error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /ai/extract-tasks - Extraer tareas
aiRouter.post('/extract-tasks', async (req, res) => {
  try {
    const { meeting_text, meeting_title } = req.body;
    
    if (!meeting_text) {
      return res.status(400).json({ error: 'meeting_text is required' });
    }

    const prompt = `Eres un asistente experto de reuniones. Extrae tareas claras y accionables de las siguientes notas de reunión.

NOTAS DE REUNIÓN:
${meeting_title ? `Título: ${meeting_title}\n` : ''}
${meeting_text}

Responde ÚNICAMENTE con un JSON válido que contenga:
- "tasks": Array de objetos con:
  - "description": Descripción clara de la tarea
  - "responsible": Persona asignada (o "Unassigned" si no se menciona)
  - "due_date": Fecha específica o "TBD" si no se menciona
  - "priority": "high", "medium", o "low"

Si no hay tareas, devuelve un array vacío.

Ejemplo de respuesta:
{
  "tasks": [
    {
      "description": "Enviar cotización a Cliente X",
      "responsible": "Pedro",
      "due_date": "before Friday",
      "priority": "high"
    }
  ]
}`;

    const aiResponse = await callGoogleAI(prompt);
    
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (e) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    console.log('[AI] Task extraction result:', result);

    res.json({
      success: true,
      result,
      raw_response: aiResponse
    });

  } catch (e: any) {
    console.error('[AI] Task extraction error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /ai/generate-insights - Generar insights
aiRouter.post('/generate-insights', async (req, res) => {
  try {
    const { meeting_texts, meeting_titles, time_period } = req.body;
    
    if (!meeting_texts || !Array.isArray(meeting_texts)) {
      return res.status(400).json({ error: 'meeting_texts array is required' });
    }

    const consolidatedText = meeting_texts.map((text, index) => {
      const title = meeting_titles?.[index] || `Reunión ${index + 1}`;
      return `**${title}:**\n${text}`;
    }).join('\n\n');

    const prompt = `Eres un analista de negocios experto. Genera un resumen ejecutivo e insights clave de las siguientes reuniones.

REUNIONES CONSOLIDADAS (${time_period || 'período reciente'}):
${consolidatedText}

Responde ÚNICAMENTE con un JSON válido que contenga:
- "executive_summary": Resumen ejecutivo conciso
- "key_insights": Array con los 3 insights más importantes
- "critical_tasks": Array con hasta 5 tareas críticas
- "sentiment": "positive", "neutral", o "negative"
- "confidence": Número entre 0 y 1

Ejemplo de respuesta:
{
  "executive_summary": "La semana fue productiva con avances en ventas y planificación de proyectos.",
  "key_insights": [
    "Alta actividad en el pipeline de ventas",
    "Claridad en asignación de roles",
    "Necesidad de seguimiento post-demo"
  ],
  "critical_tasks": [
    "Enviar contrato a Cliente A",
    "Preparar kick-off del proyecto",
    "Agendar follow-up con Cliente B"
  ],
  "sentiment": "positive",
  "confidence": 0.90
}`;

    const aiResponse = await callGoogleAI(prompt);
    
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (e) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    console.log('[AI] Insights generation result:', result);

    res.json({
      success: true,
      result,
      raw_response: aiResponse
    });

  } catch (e: any) {
    console.error('[AI] Insights generation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /ai/process-meeting - Procesamiento completo
aiRouter.post('/process-meeting', async (req, res) => {
  try {
    const { meeting_text, meeting_title, user_id, team_id } = req.body;
    
    if (!meeting_text || !user_id) {
      return res.status(400).json({ error: 'meeting_text and user_id are required' });
    }

    console.log('[AI] Processing meeting:', { meeting_title, user_id, team_id });

    // 1. Categorizar la reunión
    const categorizeResponse = await fetch(`${req.protocol}://${req.get('host')}/ai/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meeting_text, meeting_title })
    });
    const categorizeResult = await categorizeResponse.json();

    // 2. Extraer tareas
    const tasksResponse = await fetch(`${req.protocol}://${req.get('host')}/ai/extract-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meeting_text, meeting_title })
    });
    const tasksResult = await tasksResponse.json();

    // 3. Guardar en la base de datos
    const { data: meeting, error: meetingError } = await supa
      .from('meetings')
      .insert({
        user_id,
        team_id,
        title: meeting_title || 'Reunión sin título',
        raw_notes: meeting_text,
        summary: categorizeResult.result?.category_main || 'Sin categorizar',
        category_main: categorizeResult.result?.category_main,
        category_sub: categorizeResult.result?.category_sub,
        status: 'processed'
      })
      .select()
      .single();

    if (meetingError) {
      throw new Error(`Failed to save meeting: ${meetingError.message}`);
    }

    // 4. Guardar tareas si existen
    const tasks = tasksResult.result?.tasks || [];
    if (tasks.length > 0) {
      const tasksToInsert = tasks.map((task: any) => ({
        meeting_id: meeting.id,
        description: task.description,
        responsible_name: task.responsible,
        due_date: task.due_date,
        priority: task.priority || 'medium',
        status: 'pending'
      }));

      const { error: tasksError } = await supa
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('[AI] Error saving tasks:', tasksError);
      }
    }

    console.log('[AI] Meeting processed successfully:', meeting.id);

    res.json({
      success: true,
      meeting_id: meeting.id,
      categorization: categorizeResult.result,
      tasks_extracted: tasks.length,
      tasks: tasks
    });

  } catch (e: any) {
    console.error('[AI] Meeting processing error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /ai/health - Verificar estado de la integración
aiRouter.get('/health', async (req, res) => {
  try {
    if (!GOOGLE_AI_API_KEY) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Google AI Studio API key not configured' 
      });
    }

    // Probar la conexión con una consulta simple
    const testPrompt = 'Responde con "OK" si puedes procesar este mensaje.';
    const response = await callGoogleAI(testPrompt);
    
    res.json({
      status: 'healthy',
      google_ai_connected: true,
      test_response: response.substring(0, 100)
    });

  } catch (e: any) {
    res.status(500).json({
      status: 'error',
      message: e.message,
      google_ai_connected: false
    });
  }
});
