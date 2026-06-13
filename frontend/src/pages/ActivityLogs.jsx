import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatDate } from '../lib/utils';
import { CheckCircle, XCircle, SkipForward } from 'lucide-react';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">Track all sharing activity</p>
        </div>
        <div className="flex gap-2">
          {['', 'success', 'failed', 'skipped'].map((s) => (
            <Badge
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter(s)}
            >
              {s || 'All'}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const Icon = statusIcons[log.status] || CheckCircle;
          return (
            <Card key={log._id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Icon
                  className={`h-5 w-5 ${
                    log.status === 'success'
                      ? 'text-green-600'
                      : log.status === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.groupName || log.group?.groupName || 'Unknown'}</span>
                    <Badge variant={statusColors[log.status]}>{log.status}</Badge>
                  </div>
                  {log.message && (
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                  )}
                  {log.executionTime && (
                    <p className="text-xs text-muted-foreground">
                      Execution time: {log.executionTime}ms
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {formatDate(log.createdAt)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {logs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No activity logs yet. Activity will appear once automation runs.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
