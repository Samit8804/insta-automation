import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  BarChart3,
  Activity,
  Menu,
  X,
  LogOut,
  Instagram,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/groups', label: 'Groups', icon: Users },
  { path: '/schedules', label: 'Schedules', icon: Clock },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/activity', label: 'Activity Logs', icon: Activity },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-luxury-900">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(166,255,77,0.03)_0%,transparent_60%)] pointer-events-none" />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] transition-all duration-300 lg:static lg:translate-x-0',
          'bg-luxury-900/80 backdrop-blur-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon/10">
            <Instagram className="h-5 w-5 text-neon" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">InstaFlow</span>
            <div className="flex items-center gap-1.5">
              <span className="glow-dot-green" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Premium</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 pt-6">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300',
                  'opacity-0 animate-fade-in-up',
                  isActive
                    ? 'bg-neon/10 text-neon border border-neon/20 shadow-neon-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-neon')} />
                {item.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/10">
              <Sparkles className="h-4 w-4 text-neon" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-red-400" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-white/[0.06] bg-luxury-900/80 backdrop-blur-xl px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon/10">
              <Instagram className="h-4 w-4 text-neon" />
            </div>
            <span className="font-semibold">InstaFlow</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
