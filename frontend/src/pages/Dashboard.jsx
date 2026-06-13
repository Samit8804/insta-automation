import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Share2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Zap,
  Target,
  Award,
  Sparkles,
} from 'lucide-react';

const statCards = [
  { key: 'totalShares', label: 'Total Shared', icon: Share2, color: 'text-neon', suffix: '' },
  { key: 'todayShares', label: "Today's Shares", icon: TrendingUp, color: 'text-green-400', suffix: '' },
  { key: 'successRate', label: 'Success Rate', icon: Target, color: 'text-neon', suffix: '%' },
  { key: 'weeklyShares', label: 'This Week', icon: Activity, color: 'text-blue-400', suffix: '' },
  { key: 'monthlyShares', label: 'This Month', icon: Zap, color: 'text-purple-400', suffix: '' },
  { key: 'failedAttempts', label: 'Failed', icon: XCircle, color: 'text-red-400', suffix: '' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/dashboard')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon/30 border-t-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="section-subtitle mt-1">Your automation hub — real-time performance at a glance</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/[0.06]">
          <Sparkles className="h-4 w-4 text-neon" />
          <span className="text-xs font-medium text-muted-foreground">
            {stats?.activeGroups || 0} Active Groups
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-xs font-medium text-muted-foreground">
            {stats?.activeSchedules || 0} Schedules
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;
          const value = stats?.[item.key] ?? 0;
          return (
            <div key={item.key} className="glass-card-hover p-6 group">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="stat-value text-foreground group-hover:text-neon transition-colors duration-300">
                    {value}{item.suffix}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-neon/50 to-neon/30" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card-hover p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-neon/10">
              <Users className="h-5 w-5 text-neon" />
            </div>
            <div>
              <p className="text-sm font-medium">Active Groups</p>
              <p className="text-xs text-muted-foreground">Groups currently being targeted</p>
            </div>
          </div>
          <p className="stat-value">{stats?.activeGroups ?? 0}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="glow-dot-green" />
            {stats?.activeGroups > 0 ? 'All groups operational' : 'No active groups'}
          </div>
        </div>

        <div className="glass-card-hover p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gold/10">
              <Clock className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium">Active Schedules</p>
              <p className="text-xs text-muted-foreground">Automation schedules running</p>
            </div>
          </div>
          <p className="stat-value">{stats?.activeSchedules ?? 0}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="glow-dot-gold" />
            {stats?.activeSchedules > 0 ? 'Schedules active' : 'No schedules configured'}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 gradient-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon/10">
              <Award className="h-5 w-5 text-neon" />
            </div>
            <div>
              <p className="text-sm font-medium">System Status</p>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </div>
          </div>
          <Badge variant="success">Live</Badge>
        </div>
      </div>
    </div>
  );
}
