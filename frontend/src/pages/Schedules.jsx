import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Play, Pause, Trash2, Clock, Sparkles, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const intervals = [
  { value: '15sec', label: '15 Sec' },
  { value: '30min', label: '30 Min' },
  { value: '1hour', label: '1 Hour' },
  { value: '2hours', label: '2 Hours' },
  { value: '6hours', label: '6 Hours' },
  { value: 'custom', label: 'Custom' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const modes = [
  { value: 'random', label: 'Random' },
  { value: 'trending', label: 'Trending' },
  { value: 'smart', label: 'Smart' },
];

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    interval: '1hour',
    customInterval: 1,
    activeDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    selectionMode: 'random',
  });

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data.schedules);
    } catch {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      activeDays: prev.activeDays.includes(day)
        ? prev.activeDays.filter((d) => d !== day)
        : [...prev.activeDays, day],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', form);
      toast.success('Schedule created');
      setShowForm(false);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create schedule');
    }
  };

  const handlePause = async (id) => {
    try {
      await api.patch(`/schedules/${id}/pause`);
      fetchSchedules();
    } catch {
      toast.error('Failed to toggle schedule');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  const intervalLabel = (val) => intervals.find((i) => i.value === val)?.label || val;

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
            <span className="gradient-text">Schedules</span>
          </h1>
          <p className="section-subtitle mt-1">Configure when and how often reels are shared</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Schedule
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-fade-in">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Share Interval</label>
              <div className="flex flex-wrap gap-2">
                {intervals.map((int) => (
                  <Button
                    key={int.value}
                    type="button"
                    variant={form.interval === int.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm({ ...form, interval: int.value })}
                  >
                    {int.label}
                  </Button>
                ))}
              </div>
            </div>

            {form.interval === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Interval (hours)</label>
                <input
                  type="number"
                  min={1}
                  className="input-luxury w-32"
                  value={form.customInterval}
                  onChange={(e) => setForm({ ...form, customInterval: Number(e.target.value) })}
                />
              </div>
            )}

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Selection Mode</label>
              <div className="flex flex-wrap gap-2">
                {modes.map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    variant={form.selectionMode === mode.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm({ ...form, selectionMode: mode.value })}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Days</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={form.activeDays.includes(day) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Create Schedule</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule._id} className="glass-card-hover p-6 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon/10">
                  <Clock className="h-4 w-4 text-neon" />
                </div>
                <span className="font-semibold">{intervalLabel(schedule.interval)}</span>
                <Badge variant={schedule.status === 'active' ? 'success' : 'secondary'}>
                  {schedule.status}
                </Badge>
                <Badge variant="outline">{schedule.selectionMode}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Active: {schedule.activeDays?.map((d) => d.slice(0, 3)).join(', ') || 'None'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePause(schedule._id)}
              >
                {schedule.status === 'active' ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(schedule._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10">
            <Layers className="h-6 w-6 text-neon" />
          </div>
          <p className="text-muted-foreground">No schedules yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Click &quot;Add Schedule&quot; to create one.</p>
        </div>
      )}
    </div>
  );
}
