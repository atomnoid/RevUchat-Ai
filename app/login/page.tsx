'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';
import { Bot, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@revuchat.ai');
  const [password, setPassword] = useState('demo1234');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1000));

    if (email && password.length >= 6) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Use any email with 6+ character password.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.4)' }}
            >
              <Bot size={20} className="text-[#39ff87]" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">RevU</span>
              <span className="neon-text">chat</span>
              <span className="text-white/50 text-sm ml-1">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-white/40 text-sm mt-2">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div
          className="glass-card p-8"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2 font-medium">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/30 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon-solid w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-center text-xs text-white/30 mb-4">Demo credentials pre-filled</div>
            <div
              className="rounded-xl p-4 text-xs"
              style={{ background: 'rgba(57,255,135,0.05)', border: '1px solid rgba(57,255,135,0.15)' }}
            >
              <div className="text-[#39ff87] font-semibold mb-1">Demo Access</div>
              <div className="text-white/40">Email: demo@revuchat.ai</div>
              <div className="text-white/40">Password: demo1234</div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Don't have an account?{' '}
          <Link href="/" className="text-[#39ff87] hover:underline">Start free trial</Link>
        </p>
      </div>
    </div>
  );
}
