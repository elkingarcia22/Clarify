import { Router } from 'express';
import { WebClient } from '@slack/web-api';

export const slackRouter = Router();

// Inicializar cliente de Slack
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Función para construir el modal de subida
function buildUploadModal() {
  return {
    type: 'modal',
    title: { type: 'plain_text', text: 'Subir Transcripción' },
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'Modal funcionando correctamente' }
      }
    ]
  };
}

// /slack/commands — ACK-first + logs
slackRouter.post('/commands', async (req, res) => {
  try {
    console.log('[SLACK /commands] body:', req.body);
    const { command, trigger_id, user_id, channel_id, team_id } = req.body || {};

    // 1) ACK inmediato (<3s) SIEMPRE
    res.status(200).json({
      response_type: 'ephemeral',
      text: '✅ Recibido. Abriendo modal…'
    });

    // 2) Trabajo en background
    if (command === '/subir-transcripcion') {
      console.log(`[SLACK /commands] Abriendo modal para: ${command} trigger_id: ${trigger_id} user: ${user_id} channel: ${channel_id}`);
      
      slack.views.open({ 
        trigger_id, 
        view: buildUploadModal() 
      })
        .then(result => {
          console.log('[Slack views.open] success:', result);
        })
        .catch(err => {
          console.error('[Slack views.open] error:', err);
        });
    } else {
      console.warn('[SLACK /commands] comando no reconocido:', command);
    }
  } catch (e: any) {
    console.error('[SLACK /commands] fatal:', e);
    // ya enviamos 200 arriba, no respondas de nuevo
  }
});

// Debug: prueba de form-encoded
slackRouter.post('/ping', (req, res) => {
  console.log('[SLACK /ping] body:', req.body);
  console.log('[SLACK /ping] headers:', req.headers);
  res.status(200).json({ 
    status: 'ok', 
    message: 'pong',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});
