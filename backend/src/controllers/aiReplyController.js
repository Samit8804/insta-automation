const supabase = require('../config/supabase');

exports.getSettings = async (req, res) => {
  const { data } = await supabase
    .from('users')
    .select('ai_reply_enabled, ai_model, ai_prompt, ai_target_groups')
    .eq('id', req.user.id)
    .single();
  res.json({
    enabled: data?.ai_reply_enabled || false,
    model: data?.ai_model || 'llama3.2',
    prompt: data?.ai_prompt || '',
    targetGroups: data?.ai_target_groups || [],
  });
};

exports.updateSettings = async (req, res) => {
  const { enabled, model, prompt, targetGroups } = req.body;
  const { error } = await supabase
    .from('users')
    .update({
      ai_reply_enabled: enabled ?? false,
      ai_model: model || 'llama3.2',
      ai_prompt: prompt || '',
      ai_target_groups: targetGroups || [],
    })
    .eq('id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
};

exports.getModels = async (req, res) => {
  try {
    const automationUrl = process.env.AUTOMATION_SERVICE_URL || 'http://localhost:8000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${automationUrl}/ai/models`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return res.json({ models: [] });
    const data = await response.json();
    res.json({ models: data.models });
  } catch {
    res.json({ models: [] });
  }
};

exports.triggerReply = async (req, res) => {
  try {
    const { groupId, groupName, targetGroup, message, model, prompt } = req.body;
    const automationUrl = process.env.AUTOMATION_SERVICE_URL || 'http://localhost:8000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const response = await fetch(`${automationUrl}/ai/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, groupName, targetGroup, message: message || '', model, prompt }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = response.ok ? await response.json() : { success: false, error: 'Automation service error' };
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: `Automation unreachable: ${err.message}. Make sure Tailscale tunnel is running.` });
  }
};
