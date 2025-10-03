import { Router } from 'express';
import { buildPrompt, chooseAgentVersion } from 'insights-core';
import { runExtraction } from 'insights-llm';
import { validateOutput } from 'insights-schemas';
import { supa } from '../lib/supa.js';

export const llmRouter = Router();

// POST /llm/extract { meeting_id }
llmRouter.post('/extract', async (req, res) => {
  try {
    const { meeting_id } = req.body as { meeting_id: string };
    // 1) fetch meeting + transcript
    const { data: m } = await supa.from('meetings').select('*').eq('id', meeting_id).single();
    const { data: t } = await supa.from('transcripts').select('*').eq('meeting_id', meeting_id).order('created_at', { ascending: true }).limit(1).single();
    if (!m || !t) return res.status(404).json({ error: 'meeting/transcript not found' });

    // 2) pick agent/version via rules/experiments
    const agent = await chooseAgentVersion({ team: m.team, session_type: m.session_type, meeting: m });

    // 3) compose prompt (system + instructions + schema + examples + context)
    const prompt = await buildPrompt({ meeting: m, transcript: t, agent });

    // 4) call LLM with local→cloud policy
    const raw = await runExtraction({ prompt, schemaKey: `${agent.team}.${agent.session_type}` });

    // 5) validate JSON
    const { valid, errors } = validateOutput(agent.team, agent.session_type, raw);
    if (!valid) return res.status(422).json({ error: 'schema_invalid', details: errors, raw });

    // 6) persist insights + items
    const { data: ins, error } = await supa.from('insights').insert({
      meeting_id,
      summary: raw.summary,
      sentiment: raw.sentiment,
      key_topics: raw.key_topics,
      next_steps: raw.next_steps?.map?.((n: any) => n.text)?.join('\n') ?? null,
      risks: raw.risks ?? null,
      outcome: raw.outcome ?? null
    }).select().single();
    if (error) throw error;

    if (Array.isArray(raw.items) && raw.items.length) {
      await supa.from('insight_items').insert(
        raw.items.map((it: any) => ({ insight_id: ins.id, item_type: it.item_type, text: it.text, owner_email: it.owner_email, due_date: it.due_date, priority: it.priority, metadata: it.metadata || {} }))
      );
    }

    // 7) mark meeting status
    await supa.from('meetings').update({ status: 'extracted' }).eq('id', meeting_id);

    res.json({ ok: true, agent, insight_id: ins.id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
