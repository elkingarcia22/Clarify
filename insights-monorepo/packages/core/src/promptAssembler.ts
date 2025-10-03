import { createClient } from '@supabase/supabase-js';
const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

export async function buildPrompt({ meeting, transcript, agent }: any) {
  const { data: v } = await supa.from('prompt_versions').select('*').eq('agent_id', agent.id).eq('version', agent.version).single();
  if (!v) throw new Error('prompt version not found');

  const system = `${v.system_prompt}\n\n[GUARDRAILS]\n${v.guardrails || ''}`;

  const context = [
    `Título: ${meeting.title || ''}`,
    `Team: ${meeting.team} | Tipo: ${meeting.session_type}`,
    `Duración (aprox): ${(meeting.ended_at && meeting.started_at) ? Math.ceil((new Date(meeting.ended_at).getTime()-new Date(meeting.started_at).getTime())/60000) + ' min' : 'N/D'}`,
  ].join('\n');

  const examples = Array.isArray(v.examples) && v.examples.length ? `\n\n[FEW-SHOTS]\n${JSON.stringify(v.examples)}` : '';

  const schema = v.output_schema;

  const user = [
    '[INSTRUCCIONES]', v.instruction_prompt,
    '\n[CONTEXTO]', context,
    '\n[TRANSCRIPCIÓN]', transcript.text,
    '\n[SCHEMA]', JSON.stringify(schema)
  ].join('\n\n');

  return { system, user, schema };
}
