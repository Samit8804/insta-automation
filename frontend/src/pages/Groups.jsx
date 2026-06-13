import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, Users, Target, Sparkles, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ groupName: '', alias: '', targetGroup: '' });

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', form);
      toast.success('Group created');
      setForm({ groupName: '', alias: '', targetGroup: '' });
      setShowForm(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/groups/${id}/toggle`);
      fetchGroups();
    } catch {
      toast.error('Failed to toggle group');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/groups/${id}`);
      toast.success('Group deleted');
      fetchGroups();
    } catch {
      toast.error('Failed to delete group');
    }
  };

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
            <span className="gradient-text">Groups</span>
          </h1>
          <p className="section-subtitle mt-1">Manage your Instagram sharing targets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-fade-in">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Group Name</label>
                <input
                  className="input-luxury"
                  placeholder="e.g., Study Friends"
                  value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alias</label>
                <input
                  className="input-luxury"
                  placeholder="Optional label"
                  value={form.alias}
                  onChange={(e) => setForm({ ...form, alias: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Group</label>
                <input
                  className="input-luxury"
                  placeholder="Instagram group name"
                  value={form.targetGroup}
                  onChange={(e) => setForm({ ...form, targetGroup: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group._id} className="glass-card-hover p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-neon/10">
                  <Target className="h-5 w-5 text-neon" />
                </div>
                <div>
                  <p className="font-semibold">{group.groupName}</p>
                  {group.alias && (
                    <p className="text-xs text-muted-foreground">{group.alias}</p>
                  )}
                </div>
              </div>
              <Badge variant={group.status === 'active' ? 'success' : 'secondary'}>
                {group.status}
              </Badge>
            </div>
            <div className="mb-4 rounded-lg bg-white/[0.02] px-3 py-2 border border-white/[0.06]">
              <span className="text-xs text-muted-foreground">Target: </span>
              <span className="text-sm font-medium">{group.targetGroup}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleToggle(group._id)}>
                {group.status === 'active' ? 'Disable' : 'Enable'}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(group._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10">
            <Layers className="h-6 w-6 text-neon" />
          </div>
          <p className="text-muted-foreground">No groups yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Click &quot;Add Group&quot; to get started.</p>
        </div>
      )}
    </div>
  );
}
