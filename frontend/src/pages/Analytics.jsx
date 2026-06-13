import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#A6FF4D', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-xs">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/details?days=14')
      .then((res) => setAnalytics(res.data.analytics))
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

  const daily = analytics?.daily || [];
  const byGroup = analytics?.byGroup || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="section-subtitle mt-1">Deep dive into performance metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-neon/10">
              <svg className="h-5 w-5 text-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium">Daily Shares</p>
              <p className="text-xs text-muted-foreground">Success vs Failed over time</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="success" fill="#A6FF4D" name="Success" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gold/10">
              <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium">By Group</p>
              <p className="text-xs text-muted-foreground">Distribution across targets</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byGroup}
                  dataKey="success"
                  nameKey="group"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ group, percent }) => `${group} ${(percent * 100).toFixed(0)}%`}
                >
                  {byGroup.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium">Group Performance</p>
            <p className="text-xs text-muted-foreground">Detailed success rates by group</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Group</th>
                <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Success</th>
                <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Failed</th>
                <th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Rate</th>
              </tr>
            </thead>
            <tbody>
              {byGroup.map((item) => {
                const total = item.success + item.failed;
                const rate = total > 0 ? Math.round((item.success / total) * 100) : 0;
                return (
                  <tr key={item.group} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3 font-medium">{item.group}</td>
                    <td className="py-3 text-neon">{item.success}</td>
                    <td className="py-3 text-red-400">{item.failed}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-neon/10 text-neon text-xs font-semibold">
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
