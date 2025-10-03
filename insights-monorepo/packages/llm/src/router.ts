import { callVLLM } from './providers/vllm.js';
import { callGemini } from './providers/gemini.js';

export async function runExtraction({ prompt, schemaKey, system }: { prompt: { system: string; user: string; schema?: any }, schemaKey: string, system?: string }) {
  const sys = system || prompt.system;
  const schema = prompt.schema;
  // 1) intenta local (vLLM)
  try {
    return await callVLLM({ system: sys, prompt: prompt.user, schema });
  } catch (e) {
    console.warn('Local LLM failed, falling back to Gemini', e);
  }
  // 2) fallback nube (Gemini)
  return await callGemini({ system: sys, prompt: prompt.user, schema });
}
