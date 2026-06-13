const supabase = require('../config/supabase');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const toISO = (d) => d.toISOString();

    const [
      { count: totalShares },
      { count: todayShares },
      { count: weeklyShares },
      { count: monthlyShares },
      { count: failedCount },
      { count: groupCount },
      { count: scheduleCount },
    ] = await Promise.all([
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'success'),
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'success').gte('created_at', toISO(startOfDay)),
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'success').gte('created_at', toISO(startOfWeek)),
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'success').gte('created_at', toISO(startOfMonth)),
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'failed'),
      supabase.from('groups').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
      supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
    ]);

    const totalAttempts = (totalShares || 0) + (failedCount || 0);
    const successRate = totalAttempts > 0 ? Math.round(((totalShares || 0) / totalAttempts) * 100) : 100;

    res.json({
      stats: {
        totalShares: totalShares || 0,
        todayShares: todayShares || 0,
        weeklyShares: weeklyShares || 0,
        monthlyShares: monthlyShares || 0,
        failedAttempts: failedCount || 0,
        successRate,
        activeGroups: groupCount || 0,
        activeSchedules: scheduleCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const dailyStats = {};
    const groupStats = {};

    (logs || []).forEach((log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { date, success: 0, failed: 0 };
      }
      dailyStats[date][log.status === 'success' ? 'success' : 'failed']++;

      const gName = log.group_name || 'Unknown';
      if (!groupStats[gName]) {
        groupStats[gName] = { group: gName, success: 0, failed: 0 };
      }
      groupStats[gName][log.status === 'success' ? 'success' : 'failed']++;
    });

    res.json({
      analytics: {
        daily: Object.values(dailyStats),
        byGroup: Object.values(groupStats),
        totalLogs: (logs || []).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalShares },
      { count: activeSchedules },
      { count: totalGroups },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('logs').select('*', { count: 'exact', head: true }).eq('status', 'success'),
      supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
    ]);

    res.json({
      adminStats: {
        totalUsers: totalUsers || 0,
        totalShares: totalShares || 0,
        activeSchedules: activeSchedules || 0,
        totalGroups: totalGroups || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
