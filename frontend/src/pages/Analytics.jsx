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

const COLORS = ['#22c55e', '#ef4444'];

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const daily = analytics?.daily || [];
  const byGroup = analytics?.byGroup || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed performance metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" fill="#22c55e" name="Success" stackId="a" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Group</CardTitle>
          </CardHeader>
          <CardContent>
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
                    label
                  >
                    {byGroup.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Group Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Group</th>
                  <th className="pb-2 font-medium">Success</th>
                  <th className="pb-2 font-medium">Failed</th>
                  <th className="pb-2 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {byGroup.map((item) => {
                  const total = item.success + item.failed;
                  const rate = total > 0 ? Math.round((item.success / total) * 100) : 0;
                  return (
                    <tr key={item.group} className="border-b last:border-0">
                      <td className="py-2">{item.group}</td>
                      <td className="py-2 text-green-600">{item.success}</td>
                      <td className="py-2 text-red-600">{item.failed}</td>
                      <td className="py-2">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
