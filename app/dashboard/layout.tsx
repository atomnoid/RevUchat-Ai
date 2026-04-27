'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';
import { Bot, LayoutDashboard, ChartBar as BarChart3, LogOut, Menu, X, Bell, ChevronRight, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserData, logout } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check auth and load user data
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      
      // Load user data from users table
      const data = await getUserData(session.user.id);
      setUserData(data);
    };

    loadUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        getUserData(session.user.id).then(setUserData);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user || !userData) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <CyberBackground />
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

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
                {pathname === '/dashboard' ? 'Dashboard' : 'Analytics'}
              </div>
              <div className="text-xs text-white/30">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(57,255,135,0.08)', border: '1px solid rgba(57,255,135,0.2)', color: '#39ff87' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#39ff87] animate-pulse" />
              {userData.messages_used}/{userData.message_limit} Messages
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
