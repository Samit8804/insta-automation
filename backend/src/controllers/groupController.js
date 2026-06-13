const supabase = require('../config/supabase');

const mapGroup = (g) => ({
  _id: g.id,
  user: g.user_id,
  groupName: g.group_name,
  alias: g.alias,
  targetGroup: g.target_group,
  status: g.status,
  createdAt: g.created_at,
  updatedAt: g.updated_at,
});

const fromDb = (group) => ({
  group_name: group.groupName,
  alias: group.alias,
  target_group: group.targetGroup,
  status: group.status,
});

exports.getGroups = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ groups: (data || []).map(mapGroup) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { groupName, alias, targetGroup, status } = req.body;

    const { data, error } = await supabase
      .from('groups')
      .insert({
        user_id: req.user.id,
        group_name: groupName,
        alias,
        target_group: targetGroup,
        status: status || 'active',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ group: mapGroup(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const updates = {};
    if (req.body.groupName) updates.group_name = req.body.groupName;
    if (req.body.alias !== undefined) updates.alias = req.body.alias;
    if (req.body.targetGroup) updates.target_group = req.body.targetGroup;
    if (req.body.status) updates.status = req.body.status;

    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group: mapGroup(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleGroup = async (req, res) => {
  try {
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('status')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const newStatus = group.status === 'active' ? 'inactive' : 'active';

    const { data, error } = await supabase
      .from('groups')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ group: mapGroup(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
