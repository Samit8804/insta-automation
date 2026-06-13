const cron = require('node-cron');
const supabase = require('../config/supabase');

const AUTOMATION_URL = process.env.AUTOMATION_SERVICE_URL || 'http://localhost:8000';

function getIntervalMs(interval, customInterval) {
  const map = {
    '15sec': 15 * 1000,
    '30min': 30 * 60 * 1000,
    '1hour': 60 * 60 * 1000,
    '2hours': 2 * 60 * 60 * 1000,
    '6hours': 6 * 60 * 60 * 1000,
  };
  if (interval === 'custom' && customInterval) {
    return customInterval * 60 * 60 * 1000;
  }
  return map[interval] || 60 * 60 * 1000;
}

function isDayActive(activeDays) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return activeDays.includes(days[new Date().getDay()]);
}

async function processSchedules() {
  try {
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*, users!inner(id, name, email)')
      .eq('status', 'active');

    if (error) throw error;

    for (const schedule of schedules || []) {
      if (!isDayActive(schedule.active_days || [])) continue;

      const intervalMs = getIntervalMs(schedule.interval, schedule.custom_interval);
      if (schedule.last_run && Date.now() - new Date(schedule.last_run).getTime() < intervalMs) continue;

      const { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', schedule.user_id)
        .eq('status', 'active');

      if (groupError) continue;

      for (const group of groups || []) {
        try {
          const payload = {
            userId: schedule.user_id,
            groupId: group.id,
            groupName: group.group_name,
            targetGroup: group.target_group,
            mode: schedule.selection_mode || 'random',
          };

          const fetch = (await import('node-fetch')).default || require('node-fetch');
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 120000);
          const response = await fetch(`${AUTOMATION_URL}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const result = response.ok ? await response.json() : { success: false, message: 'Automation service error' };

          await supabase.from('logs').insert({
            user_id: schedule.user_id,
            group_id: group.id,
            group_name: group.group_name,
            status: result.success ? 'success' : 'failed',
            message: result.message || 'Shared via scheduler',
            execution_time: result.executionTime || 0,
          });

          console.log(`[Scheduler] Shared ${group.group_name}: ${result.success ? 'OK' : 'FAIL'}`);
        } catch (err) {
          console.error(`[Scheduler] Share failed for ${group.group_name}: ${err.message}`);
        }
      }

      await supabase
        .from('schedules')
        .update({ last_run: new Date().toISOString() })
        .eq('id', schedule.id);
    }
  } catch (error) {
    console.error('[Scheduler] Error:', error.message);
  }
}

function startScheduler() {
  cron.schedule('* * * * *', () => {
    processSchedules();
  });
  console.log('[Scheduler] Started — checking every minute');
}

module.exports = { startScheduler };
