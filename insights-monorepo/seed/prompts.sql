-- Seeds de prompts para el sistema de insights
-- Agente para ventas discovery

INSERT INTO prompt_agents (team, session_type, name, description) VALUES
('ventas', 'discovery', 'Ventas - Discovery v2', 'Agente especializado en análisis de llamadas de discovery de ventas B2B')
ON CONFLICT (team, session_type) DO NOTHING;

-- Versión del agente de ventas
WITH agent AS (
  SELECT id FROM prompt_agents WHERE team='ventas' AND session_type='discovery' LIMIT 1
)
INSERT INTO prompt_versions (agent_id, version, system_prompt, instruction_prompt, output_schema, guardrails, examples, active)
SELECT 
  agent.id, 
  2,
  'Eres un analista senior especializado en llamadas de ventas B2B. Tu expertise incluye metodologías MEDDIC, SPIN Selling y análisis de objeciones. Responde únicamente en formato JSON válido.',
  'Analiza la transcripción de la llamada de discovery y extrae:

1. **Resumen ejecutivo**: Sintetiza los puntos clave de la conversación
2. **Oportunidades**: Identifica oportunidades de negocio mencionadas
3. **Objeciones**: Extrae objeciones del prospecto con tipo y respuesta sugerida
4. **Próximos pasos**: Define acciones concretas con dueño, fecha y prioridad

Usa MEDDIC simplificado: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion.

No inventes información que no esté en la transcripción.',
  '{
    "type": "object",
    "required": ["summary", "opportunities", "objections", "next_steps"],
    "properties": {
      "summary": {"type": "string"},
      "key_topics": {"type": "array", "items": {"type": "string"}},
      "sentiment": {"type": "string"},
      "opportunities": {"type": "array", "items": {"type": "string"}},
      "objections": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["type", "text", "suggested_reply"],
          "properties": {
            "type": {"type": "string"},
            "text": {"type": "string"},
            "suggested_reply": {"type": "string"}
          }
        }
      },
      "next_steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "text": {"type": "string"},
            "owner_email": {"type": "string"},
            "due_date": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
            "priority": {"type": "string", "enum": ["alta", "media", "baja"]}
          }
        }
      },
      "items": {"type": "array", "items": {"type": "object"}}
    }
  }'::jsonb,
  'No incluyas información personal identificable (PII) que no esté explícitamente en la transcripción. No inventes cifras, nombres de personas o empresas que no se mencionen. Si falta información, deja el campo vacío o usa "N/A".',
  '[]'::jsonb,
  true
FROM agent;

-- Regla de routing para ventas discovery
INSERT INTO prompt_routing_rules (team, session_type, agent_id, version_pref, priority)
SELECT 
  'ventas',
  'discovery', 
  id, 
  2, 
  10 
FROM prompt_agents 
WHERE team='ventas' AND session_type='discovery' 
LIMIT 1;

-- Agente para research de usabilidad
INSERT INTO prompt_agents (team, session_type, name, description) VALUES
('research', 'prueba_usabilidad', 'Research - Usabilidad v1', 'Agente especializado en análisis de pruebas de usabilidad y UX research')
ON CONFLICT (team, session_type) DO NOTHING;

-- Versión del agente de research
WITH agent AS (
  SELECT id FROM prompt_agents WHERE team='research' AND session_type='prueba_usabilidad' LIMIT 1
)
INSERT INTO prompt_versions (agent_id, version, system_prompt, instruction_prompt, output_schema, guardrails, examples, active)
SELECT 
  agent.id, 
  1,
  'Eres un investigador UX senior especializado en análisis de pruebas de usabilidad. Conoces metodologías como Think Aloud, Task Analysis y Heuristic Evaluation. Responde únicamente en formato JSON válido.',
  'Analiza la transcripción de la prueba de usabilidad y extrae:

1. **Resumen**: Síntesis de la sesión y hallazgos principales
2. **Tareas**: Lista de tareas realizadas con estado de completitud y tiempo
3. **Fricciones**: Problemas de usabilidad identificados con severidad
4. **Recomendaciones**: Mejoras sugeridas con impacto y esfuerzo estimado

Usa principios de usabilidad de Nielsen y metodologías de UX research.',
  '{
    "type": "object",
    "required": ["summary", "tasks", "frictions", "recommendations"],
    "properties": {
      "summary": {"type": "string"},
      "tasks": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["name", "completed"],
          "properties": {
            "name": {"type": "string"},
            "completed": {"type": "boolean"},
            "time_seconds": {"type": "integer"}
          }
        }
      },
      "frictions": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["step", "symptom", "severity"],
          "properties": {
            "step": {"type": "string"},
            "symptom": {"type": "string"},
            "heuristic": {"type": "string"},
            "severity": {"type": "integer", "minimum": 0, "maximum": 3}
          }
        }
      },
      "recommendations": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["change", "impact"],
          "properties": {
            "change": {"type": "string"},
            "impact": {"type": "string", "enum": ["alto", "medio", "bajo"]},
            "effort": {"type": "string", "enum": ["alto", "medio", "bajo"]}
          }
        }
      },
      "items": {"type": "array", "items": {"type": "object"}}
    }
  }'::jsonb,
  'No inventes métricas de tiempo o datos cuantitativos que no estén en la transcripción. Si no se menciona el tiempo de una tarea, deja el campo vacío.',
  '[]'::jsonb,
  true
FROM agent;

-- Regla de routing para research
INSERT INTO prompt_routing_rules (team, session_type, agent_id, version_pref, priority)
SELECT 
  'research',
  'prueba_usabilidad', 
  id, 
  1, 
  10 
FROM prompt_agents 
WHERE team='research' AND session_type='prueba_usabilidad' 
LIMIT 1;
