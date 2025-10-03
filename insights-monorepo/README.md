# Motor de Insights de Reuniones

Un backend ligero que expone endpoints para extracción de insights de reuniones usando LLMs locales y en la nube.

## 🚀 Características

- **API REST** con endpoints `/llm/extract` y `/intake/manual`
- **LLM local** con vLLM + Qwen2.5-7B-Instruct (fallback a Gemini)
- **Validación JSON** con schemas versionados
- **Sistema de prompts** con agentes, versiones y experimentos A/B
- **Integración Supabase** para persistencia
- **Slack Block Kit** para notificaciones
- **Monorepo** con workspaces organizados

## 📁 Estructura

```
insights-monorepo/
├─ apps/api/              # API Express
├─ packages/
│  ├─ core/              # Ensamblador de prompts + routing
│  ├─ llm/               # Proveedores LLM (vLLM, Gemini)
│  ├─ schemas/           # Validación JSON con AJV
│  └─ slack/             # Plantillas Block Kit
├─ seed/                 # SQL seeds para Supabase
└─ docker-compose.yml    # vLLM local
```

## 🛠️ Instalación

### 1. Dependencias

```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias de cada workspace
cd apps/api && npm install && cd ../../
cd packages/schemas && npm install && cd ../../
cd packages/llm && npm install && cd ../../
cd packages/core && npm install && cd ../../
cd packages/slack && npm install && cd ../../
```

### 2. Variables de entorno

```bash
cp env.example .env
# Editar .env con tus credenciales
```

### 3. vLLM local (opcional)

```bash
docker compose up -d
# Expone API OpenAI-compatible en http://localhost:8000/v1
```

### 4. Base de datos

```bash
# Ejecutar seeds en Supabase
psql "$SUPABASE_DB_URL" -f seed/tables.sql
psql "$SUPABASE_DB_URL" -f seed/prompts.sql
```

## 🚀 Uso

### Desarrollo

```bash
npm run dev
# API disponible en http://localhost:4000
```

### Endpoints

#### Ingesta manual
```bash
curl -X POST http://localhost:4000/intake/manual \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Demo con ACME",
    "raw_text": "[TRANSCRIPCIÓN DE PRUEBA]",
    "team": "ventas",
    "session_type": "discovery",
    "created_by_email": "investigador@empresa.com"
  }'
```

#### Extracción de insights
```bash
curl -X POST http://localhost:4000/llm/extract \
  -H 'Content-Type: application/json' \
  -d '{"meeting_id": "<ID_DEVUELTO_ARRIBA>"}'
```

## 🔧 Configuración

### Agentes de prompts

El sistema usa agentes versionados almacenados en Supabase:

- **prompt_agents**: Definición de agentes por team/session_type
- **prompt_versions**: Versiones de prompts con system/instruction/schema
- **prompt_routing_rules**: Reglas de routing por prioridad
- **prompt_experiments**: Experimentos A/B para testing

### Schemas JSON

Los schemas están en `packages/schemas/src/`:
- `ventas.discovery.schema.json`
- `research.usabilidad.schema.json`

### LLM Providers

- **vLLM local**: Qwen2.5-7B-Instruct (puerto 8000)
- **Gemini**: Fallback a Google Gemini 1.5 Flash

## 🔗 Integración con n8n

La API se integra con n8n como orquestador:

1. **Ingesta**: n8n → `/intake/manual`
2. **Procesamiento**: n8n → `/llm/extract`
3. **Notificaciones**: n8n → Slack Block Kit

## 📊 Métricas

El sistema registra métricas en `prompt_runs`:
- Tokens de entrada/salida
- Tiempo de ejecución
- Tasa de éxito
- Errores

## 🧪 Testing

```bash
# Health check
curl http://localhost:4000/health

# Test completo
npm run test
```

## 📈 Próximos pasos

- [ ] Slack modals para interacción
- [ ] Experimentos A/B automáticos
- [ ] Retrieval con embeddings
- [ ] Schemas adicionales (soporte, validación)
- [ ] Digest semanal automatizado
