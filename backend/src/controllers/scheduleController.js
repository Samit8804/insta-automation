const supabase = require('../config/supabase');

const mapSchedule = (s) => ({
  _id: s.id,
  user: s.user_id,
  interval: s.interval,
  customInterval: s.custom_interval,
  activeDays: s.active_days || [],
  activeHours: {
    start: s.active_hours_start,
    end: s.active_hours_end,
  },
  selectionMode: s.selection_mode,
  status: s.status,
  lastRun: s.last_run,
  nextRun: s.next_run,
  createdAt: s.created_at,
  updatedAt: s.updated_at,
});

exports.getSchedules = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ schedules: (data || []).map(mapSchedule) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { interval, customInterval, activeDays, activeHours, selectionMode, status } = req.body;

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        user_id: req.user.id,
        interval,
        custom_interval: interval === 'custom' ? customInterval : null,
        active_days: activeDays || [],
        active_hours_start: activeHours?.start || '00:00',
        active_hours_end: activeHours?.end || '23:59',
        selection_mode: selectionMode || 'random',
        status: status || 'active',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ schedule: mapSchedule(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const updates = {};
    if (req.body.interval) updates.interval = req.body.interval;
    if (req.body.customInterval !== undefined) updates.custom_interval = req.body.customInterval;
    if (req.body.activeDays) updates.active_days = req.body.activeDays;
    if (req.body.activeHours) {
      updates.active_hours_start = req.body.activeHours.start;
      updates.active_hours_end = req.body.activeHours.end;
    }
    if (req.body.selectionMode) updates.selection_mode = req.body.selectionMode;
    if (req.body.status) updates.status = req.body.status;

    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ schedule: mapSchedule(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.pauseSchedule = async (req, res) => {
  try {
    const { data: schedule, error: fetchError } = await supabase
      .from('schedules')
      .select('status')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const newStatus = schedule.status === 'active' ? 'paused' : 'active';

    const { data, error } = await supabase
      .from('schedules')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ schedule: mapSchedule(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
