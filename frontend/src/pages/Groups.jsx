import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Manage your sharing target groups</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    placeholder="e.g., Study Friends"
                    value={form.groupName}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alias (optional)</label>
                  <Input
                    placeholder="e.g., Study Group"
                    value={form.alias}
                    onChange={(e) => setForm({ ...form, alias: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Group</label>
                  <Input
                    placeholder="Group chat name"
                    value={form.targetGroup}
                    onChange={(e) => setForm({ ...form, targetGroup: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group._id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{group.groupName}</CardTitle>
                  {group.alias && (
                    <p className="text-sm text-muted-foreground">{group.alias}</p>
                  )}
                </div>
                <Badge variant={group.status === 'active' ? 'success' : 'secondary'}>
                  {group.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Target: <span className="font-medium">{group.targetGroup}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggle(group._id)}
                >
                  {group.status === 'active' ? (
                    <ToggleRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ToggleLeft className="mr-1 h-4 w-4" />
                  )}
                  {group.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(group._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No groups yet. Click &quot;Add Group&quot; to get started.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
