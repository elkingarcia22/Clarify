import { Router } from 'express';
import { supa } from '../lib/supa.js';

export const intakeRouter = Router();

// POST /intake/manual { title?, raw_text, team?, session_type?, created_by_email?, frequency?, reminders? }
intakeRouter.post('/manual', async (req, res) => {
  try {
    const { title, raw_text, team, session_type, created_by_email, frequency, reminders } = req.body;
    if (!raw_text) return res.status(400).json({ error: 'raw_text required' });

    // 1) create meeting
    const { data: meeting, error: mErr } = await supa.from('meetings').insert({
      source: 'manual', title, team, session_type, organizer_email: created_by_email, status: 'ingested'
    }).select().single();
    if (mErr) throw mErr;

    // 2) save transcript
    const { error: tErr } = await supa.from('transcripts').insert({ meeting_id: meeting.id, text: raw_text, lang: 'es' });
    if (tErr) throw tErr;

    // 3) (opcional) program reminders en Supabase
    if (Array.isArray(reminders)) {
      for (const d of reminders) {
        await supa.from('reminders').insert({ meeting_id: meeting.id, user_email: created_by_email, schedule_type: 'one_off', run_at: new Date(Date.now() + Number(d)*24*60*60*1000).toISOString() });
      }
    }

    res.json({ ok: true, meeting_id: meeting.id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
