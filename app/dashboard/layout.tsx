'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';
import { Bot, LayoutDashboard, ChartBar as BarChart3, LogOut, Menu, X, Bell, ChevronRight, Settings, AlertCircle } from 'lucide-react';
import { logout } from '@/lib/auth';
import { useUser } from '@/hooks/useUser';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  console.log('[DASHBOARD] DashboardLayout component mounted');

  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userData, loading, error, usagePercentage, isLimitReached } = useUser();

  console.log('[DASHBOARD] useUser hook result:', {
    user: !!user,
    userId: user?.id,
    loading,
    error: !!error,
    pathname
  });

  // Add a timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    if (loading) {
      console.log('DashboardLayout: Starting loading timeout (5s)');
      const timer = setTimeout(() => {
        console.log('Dashboard: Loading timeout reached, forcing redirect check');
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading && !loadingTimeout) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <CyberBackground />
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#39ff87]/30 border-t-[#39ff87] rounded-full animate-spin" />
          <div className="text-white/50 text-sm">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || loadingTimeout || !user) {
    console.log('Dashboard: No user or error, showing login redirect page', { error, loadingTimeout, hasUser: !!user });
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <CyberBackground />
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">
            {error || (loadingTimeout ? 'Loading timeout - please try logging in again' : 'Authentication required')}
          </div>
          <div className="text-white/60 text-sm mb-4">
            Debug info: user={!!user}, loading={loading}, error={!!error}, timeout={loadingTimeout}
          </div>
          <button
            onClick={() => {
              console.log('Dashboard: Manual redirect to login clicked');
              window.location.href = '/login';
            }}
            className="btn-neon-solid px-6 py-2 rounded-lg text-sm font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  console.log('DashboardLayout: User authenticated, rendering dashboard for:', user?.id);

  const userInitials = user.email?.slice(0, 2).toUpperCase() || 'DU';

  return (
    <div className="relative min-h-screen flex">
      <CyberBackground />

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:z-10`}
        style={{
          width: '240px',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.4)' }}
          >
            <Bot size={16} className="text-[#39ff87]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              RevU<span className="neon-text">chat</span>
            </div>
            <div className="text-xs text-white/30">AI Platform</div>
          </div>
          <button
            className="md:hidden ml-auto text-white/40 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
              style={{ background: '#39ff87' }}
            >
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.email}</div>
              <div className="text-xs text-[#39ff87] capitalize">{userData.plan} Plan</div>
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">Message Usage</span>
            <span className={`text-xs font-semibold ${isLimitReached ? 'text-red-400' : 'text-[#39ff87]'}`}>
              {userData.messages_used}/{userData.message_limit}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(usagePercentage, 100)}%`,
                background: isLimitReached ? '#ff4757' : '#39ff87',
              }}
            />
          </div>
          {isLimitReached && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
              <AlertCircle size={12} />
              <span>Limit reached</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="text-xs text-white/20 px-3 mb-3 uppercase tracking-widest font-semibold">Menu</div>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${active
                    ? 'text-[#39ff87]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                style={active ? {
                  background: 'rgba(57,255,135,0.1)',
                  border: '1px solid rgba(57,255,135,0.2)',
                } : {}}
              >
                <item.icon size={17} className={active ? 'text-[#39ff87]' : 'text-white/40 group-hover:text-white/70'} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto text-[#39ff87]/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white/50 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="text-sm font-semibold text-white">
                {pathname === '/dashboard' ? 'Dashboard' : pathname === '/dashboard/analytics' ? 'Analytics' : 'Settings'}
              </div>
              <div className="text-xs text-white/30">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                isLimitReached 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-[#39ff87]/8 border-[#39ff87]/20 text-[#39ff87]'
              }`}
              style={{ border: isLimitReached ? '1px solid rgba(255,71,87,0.3)' : '1px solid rgba(57,255,135,0.2)' }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isLimitReached ? 'bg-red-400' : 'bg-[#39ff87] animate-pulse'}`} />
              {userData.messages_used}/{userData.message_limit}
            </div>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Bell size={15} />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
              style={{ background: '#39ff87' }}
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative z-10 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
