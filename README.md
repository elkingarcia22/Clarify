# Clarify - AI-Powered Meeting Intelligence Platform

Clarify es una plataforma robusta y escalable que utiliza inteligencia artificial para procesar, categorizar y extraer insights valiosos de las reuniones de tu equipo.

## 🚀 Características Principales

### 🤖 Procesamiento Inteligente con IA
- **Google AI Studio Integration**: Procesamiento avanzado con Gemini Pro
- **Categorización Automática**: Clasifica reuniones por tipo (Ventas, Usabilidad, Implementación, etc.)
- **Extracción de Tareas**: Identifica automáticamente tareas y responsables
- **Generación de Insights**: Crea resúmenes ejecutivos y puntos clave

### 🔗 Integraciones
- **Slack**: Bot con comando `/subir-transcripcion` para carga rápida
- **Supabase**: Base de datos PostgreSQL con autenticación y Edge Functions
- **Jira**: Integración para creación automática de tareas
- **Plans.com**: Soporte para gestión de proyectos

### 🏗️ Arquitectura Robusta
- **Monorepo TypeScript**: Estructura modular y escalable
- **API RESTful**: Endpoints bien documentados y tipados
- **Manejo de Errores**: Sistema robusto de logging y recuperación
- **Docker Ready**: Configuración para despliegue en contenedores

## 📁 Estructura del Proyecto

```
insights-monorepo/
├── apps/
│   └── api/                    # API principal con Express.js
├── packages/
│   ├── core/                   # Lógica de negocio central
│   ├── llm/                    # Proveedores de IA (Gemini, vLLM)
│   ├── schemas/                # Validación de datos
│   └── slack/                  # Integración con Slack
├── scripts/                    # Scripts de configuración y testing
├── seed/                       # Datos iniciales de la base de datos
└── docs/                       # Documentación
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Token de Google AI Studio
- Configuración de Slack App

### 1. Clonar el Repositorio
```bash
git clone https://github.com/elkingarcia22/Clarify.git
cd Clarify/insights-monorepo
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia `env.example` a `.env` y configura:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key

# Google AI Studio
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your_signing_secret

# URLs
SELF_BASE_URL=http://localhost:4000
PUBLIC_BASE_URL=your_public_url

# Integraciones (Opcionales)
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=bot@yourcompany.com
JIRA_API_TOKEN=your_jira_token
JIRA_PROJECT_KEY=CLAR

PLANS_BASE_URL=https://plans.yourapp.com/api/tasks
PLANS_TOKEN=your_plans_token
```

### 4. Configurar Base de Datos
```bash
# Ejecutar scripts de configuración
npm run setup
```

### 5. Iniciar el Servidor
```bash
npm run dev
```

## 🔧 Uso

### API Endpoints

#### Procesamiento de Reuniones
```bash
# Procesamiento completo
POST /ai/process-meeting
{
  "meeting_id": "uuid",
  "notes": "transcripción de la reunión..."
}

# Categorización
POST /ai/categorize
{
  "notes": "transcripción..."
}

# Extracción de tareas
POST /ai/extract-tasks
{
  "notes": "transcripción..."
}

# Generación de insights
POST /ai/generate-insights
{
  "notes": "transcripción..."
}
```

#### Gestión de Tareas
```bash
# Crear tarea desde insight
POST /tasks/from-insight
{
  "insight_id": "uuid",
  "create_external": true,
  "provider": "jira"
}
```

#### Slack Integration
```bash
# Comando de Slack
POST /slack/commands
# Comando: /subir-transcripcion
```

### Slack Bot Setup

1. Crear una Slack App en [api.slack.com](https://api.slack.com)
2. Configurar OAuth & Permissions:
   - `commands`
   - `chat:write`
   - `users:read`
3. Crear Slash Command: `/subir-transcripcion`
4. Configurar Request URL: `https://your-domain.com/slack/commands`

## 🧪 Testing

```bash
# Verificar conexiones
npm run verify-connections

# Test de API
npm run test-api

# Test específico
curl -X POST http://localhost:4000/ai/categorize \
  -H "Content-Type: application/json" \
  -d '{"notes": "Reunión de ventas con cliente potencial..."}'
```

## 🚀 Despliegue

### Con Docker
```bash
docker-compose up -d
```

### Con ngrok (Desarrollo)
```bash
# Exponer API públicamente
./ngrok http 4000
```

## 📊 Monitoreo

- **Health Check**: `GET /health`
- **AI Status**: `GET /ai/health`
- **Logs**: Revisar consola para debugging

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Abre un [Issue](https://github.com/elkingarcia22/Clarify/issues)
- Revisa la [documentación](https://github.com/elkingarcia22/Clarify/wiki)

---

**Clarify** - Transformando reuniones en insights accionables con IA 🚀
