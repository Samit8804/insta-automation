import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Play, Pause, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const intervals = [
  { value: '15sec', label: 'Every 15 Seconds' },
  { value: '30min', label: 'Every 30 Minutes' },
  { value: '1hour', label: 'Every 1 Hour' },
  { value: '2hours', label: 'Every 2 Hours' },
  { value: '6hours', label: 'Every 6 Hours' },
  { value: 'custom', label: 'Custom Interval' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const modes = [
  { value: 'random', label: 'Random Mode' },
  { value: 'trending', label: 'Trending Mode' },
  { value: 'smart', label: 'Smart Mode' },
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">Configure your automation timing</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Schedule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Share Interval</label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
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
                  <label className="text-sm font-medium">Custom Interval (hours)</label>
                  <input
                    type="number"
                    min={1}
                    className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.customInterval}
                    onChange={(e) => setForm({ ...form, customInterval: Number(e.target.value) })}
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Selection Mode</label>
                <div className="flex gap-2">
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
                <label className="mb-2 block text-sm font-medium">Active Days</label>
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

              <div className="flex gap-2">
                <Button type="submit">Create Schedule</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule._id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{intervalLabel(schedule.interval)}</span>
                  <Badge variant={schedule.status === 'active' ? 'success' : 'secondary'}>
                    {schedule.status}
                  </Badge>
                  <Badge variant="outline">{schedule.selectionMode}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Active days:{' '}
                  {schedule.activeDays?.map((d) => d.slice(0, 3)).join(', ') || 'None'}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No schedules yet. Click &quot;Add Schedule&quot; to create one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
