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
} from 'lucide-react';

const statCards = [
  { key: 'totalShares', label: 'Total Shared', icon: Share2, color: 'text-blue-600' },
  { key: 'todayShares', label: "Today's Shares", icon: TrendingUp, color: 'text-green-600' },
  { key: 'weeklyShares', label: 'This Week', icon: Clock, color: 'text-purple-600' },
  { key: 'monthlyShares', label: 'This Month', icon: Users, color: 'text-orange-600' },
  { key: 'successRate', label: 'Success Rate', icon: CheckCircle, color: 'text-green-600', suffix: '%' },
  { key: 'failedAttempts', label: 'Failed', icon: XCircle, color: 'text-red-600' },
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your automation activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => {
          const Icon = item.icon;
          const value = stats?.[item.key] ?? 0;
          return (
            <Card key={item.key}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-3xl font-bold">
                      {value}
                      {item.suffix}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${item.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats?.activeGroups ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats?.activeSchedules ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
