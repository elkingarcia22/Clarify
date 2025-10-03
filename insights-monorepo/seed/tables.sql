-- Tablas para el sistema de prompts y routing
-- Basado en el esquema de la central de creadores

-- Tabla de agentes de prompts
CREATE TABLE IF NOT EXISTS prompt_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT NOT NULL,
  session_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team, session_type)
);

-- Tabla de versiones de prompts
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES prompt_agents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  instruction_prompt TEXT NOT NULL,
  output_schema JSONB NOT NULL,
  guardrails TEXT,
  examples JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, version)
);

-- Tabla de reglas de routing
CREATE TABLE IF NOT EXISTS prompt_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT NOT NULL,
  session_type TEXT NOT NULL,
  agent_id UUID REFERENCES prompt_agents(id) ON DELETE CASCADE,
  version_pref INTEGER,
  priority INTEGER DEFAULT 10,
  conditions JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de experimentos A/B
CREATE TABLE IF NOT EXISTS prompt_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  session_type TEXT NOT NULL,
  variants JSONB NOT NULL, -- [{agent_id, version, pct}]
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ejecuciones de prompts (para métricas)
CREATE TABLE IF NOT EXISTS prompt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES prompt_agents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  meeting_id UUID,
  input_tokens INTEGER,
  output_tokens INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_prompt_agents_team_session ON prompt_agents(team, session_type);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_agent_active ON prompt_versions(agent_id, active);
CREATE INDEX IF NOT EXISTS idx_prompt_routing_team_session ON prompt_routing_rules(team, session_type, active);
CREATE INDEX IF NOT EXISTS idx_prompt_experiments_team_session ON prompt_experiments(team, session_type, active);
CREATE INDEX IF NOT EXISTS idx_prompt_runs_agent_version ON prompt_runs(agent_id, version);
