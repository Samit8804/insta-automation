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
    const http = require('axios');
    const automationUrl = process.env.AUTOMATION_SERVICE_URL || 'http://localhost:8000';
    const result = await http.get(`${automationUrl}/ai/models`, { timeout: 5000 });
    res.json({ models: result.data.models });
  } catch {
    res.json({ models: [] });
  }
};

exports.triggerReply = async (req, res) => {
  try {
    const { groupId, groupName, targetGroup, message, model, prompt } = req.body;
    const http = require('axios');
    const automationUrl = process.env.AUTOMATION_SERVICE_URL || 'http://localhost:8000';
    const result = await http.post(`${automationUrl}/ai/reply`, {
      groupId, groupName, targetGroup, message: message || '', model, prompt,
    }, { timeout: 120000 });
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
