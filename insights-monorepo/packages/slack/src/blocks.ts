export function immediateInsightBlock({ title, summary, topics = [] as string[] }: { title: string; summary: string; topics?: string[] }) {
  return {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `🧠 ${title}` } },
      { type: 'section', text: { type: 'mrkdwn', text: summary } },
      topics.length ? { type: 'context', elements: topics.slice(0,5).map(t => ({ type: 'mrkdwn', text: `*#${t}*` })) } : undefined,
      { type: 'actions', elements: [
        { type: 'button', text: { type: 'plain_text', text: 'Asignar follow-up' }, value: 'assign' },
        { type: 'button', text: { type: 'plain_text', text: 'Crear tarea' }, value: 'create_task' }
      ] }
    ].filter(Boolean)
  };
}
