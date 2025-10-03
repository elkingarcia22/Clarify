import { createClient } from '@supabase/supabase-js';
const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

export async function chooseAgentVersion({ team, session_type }: { team: string; session_type: string; meeting: any }) {
  // 1) experimento activo?
  const { data: exps } = await supa.from('prompt_experiments').select('*').eq('active', true).eq('team', team).eq('session_type', session_type).limit(1);
  if (exps && exps[0]) {
    const variants = exps[0].variants as Array<{ agent_id: string; version: number; pct: number }>;
    const r = Math.random() * 100; let acc = 0;
    for (const v of variants) { acc += v.pct; if (r <= acc) return { id: v.agent_id, team, session_type, version: v.version }; }
  }
  // 2) reglas de ruteo (prioridad)
  const { data: rules } = await supa.from('prompt_routing_rules').select('*').eq('active', true).eq('team', team).eq('session_type', session_type).order('priority', { ascending: true }).limit(1);
  if (rules && rules[0]) return { id: rules[0].agent_id, team, session_type, version: rules[0].version_pref || (await latestVersion(rules[0].agent_id)) };
  // 3) fallback: última versión activa del agente
  const { data: agents } = await supa.from('prompt_agents').select('id').eq('team', team).eq('session_type', session_type).limit(1);
  if (!agents || !agents[0]) throw new Error('No agent configured');
  return { id: agents[0].id, team, session_type, version: await latestVersion(agents[0].id) };
}

async function latestVersion(agent_id: string) {
  const { data } = await supa.from('prompt_versions').select('version').eq('agent_id', agent_id).eq('active', true).order('version', { ascending: false }).limit(1);
  if (!data || !data[0]) throw new Error('No active version');
  return data[0].version;
}
