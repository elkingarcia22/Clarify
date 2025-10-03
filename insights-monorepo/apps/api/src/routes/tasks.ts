import { Router } from 'express';
import { supa } from '../lib/supa.js';

export const tasksRouter = Router();

// POST /tasks/from-insight { insight_id, create_external, provider }
tasksRouter.post('/from-insight', async (req, res) => {
  try {
    const { insight_id, create_external = false, provider = 'jira' } = req.body;
    
    if (!insight_id) {
      return res.status(400).json({ error: 'insight_id is required' });
    }

    console.log(`[TASKS] Creating tasks from insight: ${insight_id}, external: ${create_external}, provider: ${provider}`);

    // 1) Fetch insight and related items
    const { data: insight, error: insightError } = await supa
      .from('insights')
      .select('*')
      .eq('id', insight_id)
      .single();

    if (insightError || !insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const { data: items, error: itemsError } = await supa
      .from('insight_items')
      .select('*')
      .eq('insight_id', insight_id);

    if (itemsError) {
      console.error('[TASKS] Error fetching insight items:', itemsError);
      return res.status(500).json({ error: 'Failed to fetch insight items' });
    }

    console.log(`[TASKS] Found ${items?.length || 0} items for insight ${insight_id}`);

    // 2) Create tasks from insight items
    const tasks = [];
    
    if (items && items.length > 0) {
      for (const item of items) {
        const taskData = {
          source_insight_id: insight_id,
          title: item.text || `Task from ${item.item_type}`,
          description: `Generated from insight: ${insight.summary}`,
          status: 'open',
          priority: item.priority || 'media',
          owner_email: item.owner_email,
          due_date: item.due_date,
          labels: [item.item_type, provider]
        };

        const { data: task, error: taskError } = await supa
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (taskError) {
          console.error('[TASKS] Error creating task:', taskError);
          continue;
        }

        tasks.push(task);

        // 3) Create external task if requested
        if (create_external && provider === 'jira') {
          try {
            console.log(`[TASKS] Creating external task for: ${task.id}`);
            
            const linkData = {
              task_id: task.id,
              provider: 'jira',
              external_id: `JIRA-${Date.now()}`, // Placeholder
              external_url: `https://example.atlassian.net/browse/JIRA-${Date.now()}`
            };
            
            console.log(`[TASKS] Link data:`, linkData);
            
            const { data: link, error: linkError } = await supa
              .from('task_links')
              .insert(linkData)
              .select()
              .single();

            if (linkError) {
              console.error('[TASKS] Error creating task link:', linkError);
            } else {
              console.log(`[TASKS] Created task link:`, link);
            }
          } catch (e) {
            console.error('[TASKS] Error in external task creation:', e);
          }
        }
      }
    } else {
      // Create a general task from the insight itself
      const taskData = {
        source_insight_id: insight_id,
        title: `Follow up: ${insight.summary?.substring(0, 100)}...`,
        description: insight.summary,
        status: 'open',
        priority: 'media',
        labels: [provider, 'general']
      };

      const { data: task, error: taskError } = await supa
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {
        console.error('[TASKS] Error creating general task:', taskError);
        return res.status(500).json({ error: 'Failed to create task' });
      }

      tasks.push(task);
    }

    console.log(`[TASKS] Created ${tasks.length} tasks from insight ${insight_id}`);

    res.json({
      success: true,
      insight_id,
      tasks_created: tasks.length,
      tasks: tasks,
      create_external,
      provider
    });

  } catch (e: any) {
    console.error('[TASKS] Fatal error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /tasks - List tasks
tasksRouter.get('/', async (req, res) => {
  try {
    const { data: tasks, error } = await supa
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[TASKS] Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    res.json({ tasks });
  } catch (e: any) {
    console.error('[TASKS] Fatal error:', e);
    res.status(500).json({ error: e.message });
  }
});
