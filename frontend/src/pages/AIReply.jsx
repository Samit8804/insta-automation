import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bot, MessageCircle, Send, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AUTOMATION_URL = import.meta.env.VITE_AUTOMATION_URL || 'https://desktop-nmaudlh.tail81756e.ts.net';

export default function AIReply() {
  const [settings, setSettings] = useState({ enabled: false, model: 'llama3.2', prompt: '', targetGroups: [] });
  const [groups, setGroups] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testMsg, setTestMsg] = useState('');
  const [replying, setReplying] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/ai/settings'),
      api.get('/groups'),
      api.get('/ai/models'),
    ]).then(([s, g, m]) => {
      setSettings(s.data);
      setGroups(g.data.groups || []);
      setModels(m.data.models || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleGroup = (gid) => {
    setSettings(prev => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(gid)
        ? prev.targetGroups.filter(id => id !== gid)
        : [...prev.targetGroups, gid],
    }));
  };

  const saveSettings = async () => {
    try {
      await api.put('/ai/settings', settings);
      toast.success('AI settings saved');
    } catch { toast.error('Failed to save'); }
  };

  const testReply = async () => {
    const target = groups.find(g => settings.targetGroups.includes(g._id));
    if (!target) { toast.error('Select a target group first'); return; }
    setReplying(true);
    setResult(null);
    try {
      const res = await fetch(`${AUTOMATION_URL}/ai/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: target._id,
          groupName: target.groupName,
          targetGroup: target.targetGroup,
          message: testMsg,
          model: settings.model || 'llama3.2',
          prompt: settings.prompt,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) toast.success('Reply sent!');
      else toast.error(data.error || 'AI reply failed');
    } catch { toast.error('Cannot reach automation server'); }
    finally { setReplying(false); }
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
          <h1 className="section-title"><span className="gradient-text">AI Reply</span></h1>
          <p className="section-subtitle mt-1">Let AI read and reply to group messages automatically</p>
        </div>
        <Button onClick={saveSettings} className="gap-2">
          <Sparkles className="h-4 w-4" /> Save Settings
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon/10">
              <Bot className="h-5 w-5 text-neon" />
            </div>
            <div>
              <p className="font-semibold">AI Configuration</p>
              <p className="text-xs text-muted-foreground">Choose model and behavior</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm">Enable AI Reply</span>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${settings.enabled ? 'bg-neon' : 'bg-white/[0.1]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</label>
            <select
              value={settings.model}
              onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
              className="input-luxury"
            >
              {models.length > 0 ? models.map(m => (
                <option key={m} value={m} className="bg-luxury-900">{m}</option>
              )) : (
                <option value="llama3.2" className="bg-luxury-900">llama3.2 (default)</option>
              )}
            </select>
            {models.length === 0 && (
              <p className="text-xs text-yellow-400">Install Ollama and pull a model (e.g., ollama pull llama3.2)</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Prompt</label>
            <textarea
              value={settings.prompt}
              onChange={e => setSettings(s => ({ ...s, prompt: e.target.value }))}
              placeholder="Leave empty for default prompt. Use {message} as placeholder."
              className="input-luxury h-24 resize-none"
            />
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold/10">
              <MessageCircle className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="font-semibold">Target Groups</p>
              <p className="text-xs text-muted-foreground">Select which groups to auto-reply in</p>
            </div>
          </div>

          <div className="space-y-2">
            {groups.map(g => (
              <div
                key={g._id}
                onClick={() => toggleGroup(g._id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  settings.targetGroups.includes(g._id)
                    ? 'bg-neon/10 border-neon/20'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{g.groupName}</p>
                  <p className="text-xs text-muted-foreground">{g.targetGroup}</p>
                </div>
                <Badge variant={settings.targetGroups.includes(g._id) ? 'success' : 'secondary'}>
                  {settings.targetGroups.includes(g._id) ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="text-sm text-muted-foreground">Create groups first in the Groups page</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <Send className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold">Test AI Reply</p>
            <p className="text-xs text-muted-foreground">Send a test AI-generated reply to the selected group</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            value={testMsg}
            onChange={e => setTestMsg(e.target.value)}
            placeholder="Optional: simulate a message for AI to reply to..."
            className="input-luxury flex-1"
          />
          <Button onClick={testReply} disabled={replying} className="gap-2">
            {replying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {replying ? 'Replying...' : 'Test Reply'}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? 'success' : 'destructive'}>
                {result.success ? 'Sent' : 'Failed'}
              </Badge>
              <span className="text-xs text-muted-foreground">{(result.executionTime / 1000).toFixed(1)}s</span>
            </div>
            <p className="text-sm"><span className="text-muted-foreground">Original:</span> {result.original}</p>
            <p className="text-sm"><span className="text-muted-foreground">AI Reply:</span> {result.reply}</p>
            {result.error && <p className="text-sm text-red-400">Error: {result.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
