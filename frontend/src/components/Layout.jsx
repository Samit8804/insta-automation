import { useState } from 'react';
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
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-6">
          <Instagram className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">InstaFlow</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="mb-2 text-sm text-muted-foreground">{user?.email}</div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-primary" />
            <span className="font-semibold">InstaFlow</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
