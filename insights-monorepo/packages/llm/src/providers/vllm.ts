export async function callVLLM({ system, prompt, schema }: { system: string; prompt: string; schema?: any }) {
  const base = process.env.VLLM_BASE_URL || 'http://localhost:8000/v1';
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: schema ? { type: 'json_object' } : undefined,
      max_tokens: 2048
    })
  });
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}
