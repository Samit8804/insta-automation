const supabase = require('../config/supabase');

const mapLog = (l) => ({
  _id: l.id,
  user: l.user_id,
  group: l.group_id,
  groupName: l.group_name,
  reelId: l.reel_id,
  status: l.status,
  message: l.message,
  executionTime: l.execution_time,
  createdAt: l.created_at,
});

exports.getLogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status: filterStatus } = req.query;
    let query = supabase
      .from('logs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({ logs: (data || []).map(mapLog), total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLogsByGroup = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('group_id', req.params.groupId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ logs: (data || []).map(mapLog) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const { group, groupName, reelId, status, message, executionTime } = req.body;

    const { data, error } = await supabase
      .from('logs')
      .insert({
        user_id: req.user.id,
        group_id: group,
        group_name: groupName,
        reel_id: reelId,
        status,
        message,
        execution_time: executionTime,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ log: mapLog(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
