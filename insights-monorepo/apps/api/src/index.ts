import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { slackRouter } from './routes/slack.js';
import { llmRouter } from './routes/llm-simple.js';
import { intakeRouter } from './routes/intake.js';
import { tasksRouter } from './routes/tasks.js';
import { aiRouter } from './routes/ai.js';

const app = express();

app.use(cors({ origin: true }));

// Slack: form-encoded en estas rutas
app.use('/slack/interactivity', express.urlencoded({ extended: true }));
app.use('/slack/commands', express.urlencoded({ extended: true }));

// El resto JSON
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/slack', slackRouter);
app.use('/llm', llmRouter);
app.use('/intake', intakeRouter);
app.use('/tasks', tasksRouter);
app.use('/ai', aiRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
