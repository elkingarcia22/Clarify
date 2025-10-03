import { Router } from 'express';
import { supa } from '../lib/supa.js';

export const llmRouter = Router();

// POST /llm/extract { meeting_id }
llmRouter.post('/extract', async (req, res) => {
  try {
    const { meeting_id } = req.body as { meeting_id: string };
    
    // 1) fetch meeting + transcript
    const { data: m } = await supa.from('meetings').select('*').eq('id', meeting_id).single();
    const { data: t } = await supa.from('transcripts').select('*').eq('meeting_id', meeting_id).order('created_at', { ascending: true }).limit(1).single();
    
    if (!m || !t) {
      return res.status(404).json({ error: 'meeting/transcript not found' });
    }

    // 2) Simple prompt assembly
    const systemPrompt = `Eres un analista senior especializado en llamadas de ventas B2B. 
    Analiza la transcripción y extrae insights en formato JSON con: summary, opportunities, objections, next_steps.`;

    const userPrompt = `Analiza esta transcripción de ventas:
    
    Título: ${m.title || 'N/A'}
    Team: ${m.team || 'N/A'}
    Tipo: ${m.session_type || 'N/A'}
    
    Transcripción:
    ${t.text}
    
    Responde en formato JSON válido.`;

    // 3) Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          role: 'user', 
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }]
      })
    });

    const geminiData = await geminiResponse.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    let raw;
    try {
      raw = JSON.parse(rawText);
    } catch (e) {
      raw = { summary: rawText, opportunities: [], objections: [], next_steps: [] };
    }

    // 4) persist insights
    const { data: ins, error } = await supa.from('insights').insert({
      meeting_id,
      summary: raw.summary || 'Sin resumen',
      sentiment: raw.sentiment || 'neutral',
      key_topics: raw.key_topics || [],
      next_steps: raw.next_steps?.map?.((n: any) => n.text)?.join('\n') ?? null,
      risks: raw.risks ?? null,
      outcome: raw.outcome ?? null
    }).select().single();
    
    if (error) throw error;

    // 5) mark meeting status
    await supa.from('meetings').update({ status: 'extracted' }).eq('id', meeting_id);

    res.json({ 
      ok: true, 
      insight_id: ins.id,
      raw_response: raw
    });
  } catch (e: any) {
    console.error('Error in LLM extraction:', e);
    res.status(500).json({ error: e.message });
  }
});
