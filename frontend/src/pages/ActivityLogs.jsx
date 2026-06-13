import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatDate } from '../lib/utils';
import { CheckCircle, XCircle, SkipForward, Activity, Filter, Layers, Clock } from 'lucide-react';

const statusIcons = {
  success: CheckCircle,
  failed: XCircle,
  skipped: SkipForward,
};

const statusColors = {
  success: 'success',
  failed: 'destructive',
  skipped: 'warning',
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    api
      .get(`/logs${params}`)
      .then((res) => setLogs(res.data.logs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon/30 border-t-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">
            <span className="gradient-text">Activity Logs</span>
          </h1>
          <p className="section-subtitle mt-1">Real-time sharing history and status</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl glass border border-white/[0.06]">
          {[
            { value: '', label: 'All', icon: Filter },
            { value: 'success', label: 'Success', icon: CheckCircle },
            { value: 'failed', label: 'Failed', icon: XCircle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === s.value
                    ? 'bg-neon/10 text-neon border border-neon/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log, i) => {
          const Icon = statusIcons[log.status] || CheckCircle;
          return (
            <div
              key={log._id}
              className="glass-card-hover p-4 flex items-center gap-4"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`p-2.5 rounded-xl ${
                log.status === 'success'
                  ? 'bg-green-500/10'
                  : log.status === 'failed'
                  ? 'bg-red-500/10'
                  : 'bg-yellow-500/10'
              }`}>
                <Icon className={`h-5 w-5 ${
                  log.status === 'success'
                    ? 'text-green-400'
                    : log.status === 'failed'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{log.groupName || log.group?.groupName || 'Unknown'}</span>
                  <Badge variant={statusColors[log.status]}>{log.status}</Badge>
                </div>
                {log.message && (
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">{log.message}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {log.executionTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(log.executionTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(log.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {logs.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10">
            <Activity className="h-6 w-6 text-neon" />
          </div>
          <p className="text-muted-foreground">No activity logs yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Activity will appear once automation runs.</p>
        </div>
      )}
    </div>
  );
}
