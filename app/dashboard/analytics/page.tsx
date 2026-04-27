'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  Users, ThumbsUp, ThumbsDown, TrendingUp, Star,
  Activity, Clock, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import type { Customer } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { getCustomers } from '@/services/messagingService';

const COLORS = {
  positive: '#39ff87',
  negative: '#ff4757',
  pending: '#fbbf24',
};

function StatCard({
  label, value, icon: Icon, color, sub, trend
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  trend?: { val: number; positive: boolean };
}) {
  return (
    <div
      className="glass-card p-6 card-hover"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full`}
            style={{
              color: trend.positive ? '#39ff87' : '#ff4757',
              background: trend.positive ? 'rgba(57,255,135,0.1)' : 'rgba(255,71,87,0.1)',
            }}
          >
            {trend.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend.val}%
          </div>
        )}
      </div>
      <div className="text-4xl font-black mb-1" style={{ color }}>{value}</div>
      <div className="text-sm text-white/50 font-medium">{label}</div>
      {sub && <div className="text-xs text-white/25 mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-xl text-sm"
        style={{
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(57,255,135,0.2)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="text-white/60 mb-2 font-medium">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-white/70">{p.name}:</span>
            <span className="font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (showRefresh = false) => {
    if (!userId) return;
    
    if (showRefresh) setRefreshing(true);
    try {
      console.log('Fetching analytics data for user:', userId);
      const data = await getCustomers(userId);
      console.log('Analytics data fetched:', data);
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        console.log('Fetching current user for analytics...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Current user found for analytics:', session.user.id);
          setUserId(session.user.id);
        } else {
          console.log('No current user found for analytics');
        }
      } catch (err) {
        console.error('Error getting current user for analytics:', err);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const total = customers.length;
  const positive = customers.filter((c) => c.status === 'positive').length;
  const negative = customers.filter((c) => c.status === 'negative').length;
  const pending = customers.filter((c) => c.status === 'pending').length;
  const conversionRate = total > 0 ? Math.round((positive / total) * 100) : 0;
  const responseRate = total > 0 ? Math.round(((positive + negative) / total) * 100) : 0;

  // Pie chart data
  const pieData = [
    { name: 'Positive', value: positive, color: COLORS.positive },
    { name: 'Negative', value: negative, color: COLORS.negative },
    { name: 'Pending', value: pending, color: COLORS.pending },
  ].filter((d) => d.value > 0);

  // Bar chart: by day (last 7 days)
  const barData = (() => {
    const days: Record<string, { day: string; positive: number; negative: number; pending: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      days[d.toDateString()] = { day: key, positive: 0, negative: 0, pending: 0 };
    }
    customers.forEach((c) => {
      const key = new Date(c.created_at).toDateString();
      if (days[key]) {
        days[key][c.status]++;
      }
    });
    return Object.values(days);
  })();

  // Line chart: cumulative
  const lineData = (() => {
    const sorted = [...customers].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let cum = 0;
    let pos = 0;
    return sorted.map((c, i) => {
      cum++;
      if (c.status === 'positive') pos++;
      return {
        idx: i + 1,
        total: cum,
        positive: pos,
        rate: Math.round((pos / cum) * 100),
      };
    });
  })();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={() => fetchData(true)}
            className="btn-neon-solid px-6 py-2 rounded-lg text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-1">Real-time performance overview</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={total}
          icon={Users}
          color="#39d9ff"
          sub="All time"
        />
        <StatCard
          label="Positive Responses"
          value={positive}
          icon={ThumbsUp}
          color="#39ff87"
          trend={{ val: conversionRate, positive: true }}
        />
        <StatCard
          label="Negative Responses"
          value={negative}
          icon={ThumbsDown}
          color="#ff4757"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          color="#a8ff78"
          sub="Positive / Total"
        />
      </div>

      {/* Secondary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: '#fbbf24' },
          { label: 'Response Rate', value: `${responseRate}%`, icon: Activity, color: '#c87bff' },
          {
            label: 'Est. New Reviews',
            value: positive,
            icon: Star,
            color: '#39ff87',
          },
          {
            label: 'Protected Issues',
            value: negative,
            icon: ThumbsDown,
            color: '#ff6b6b',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card px-5 py-4 flex items-center gap-4"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
            >
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div
          className="glass-card p-6"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Responses</h3>
              <p className="text-xs text-white/30 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#39ff87] inline-block" /> Positive</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff4757] inline-block" /> Negative</span>
            </div>
          </div>
          {barData.every((d) => d.positive === 0 && d.negative === 0) ? (
            <div className="flex items-center justify-center h-48 text-white/20 text-sm">
              No data to display yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(57,255,135,0.04)' }} />
                <Bar dataKey="positive" name="Positive" fill="#39ff87" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative" name="Negative" fill="#ff4757" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div
          className="glass-card p-6"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white">Response Distribution</h3>
            <p className="text-xs text-white/30 mt-0.5">All time breakdown</p>
          </div>
          {total === 0 ? (
            <div className="flex items-center justify-center h-48 text-white/20 text-sm">
              No data to display yet
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-white/60">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{d.value}</span>
                      <span className="text-xs text-white/30">{Math.round((d.value / total) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line chart */}
      {lineData.length > 1 && (
        <div
          className="glass-card p-6"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Conversion Rate Over Time</h3>
              <p className="text-xs text-white/30 mt-0.5">Positive responses as percentage of total</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="idx" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Customers', position: 'insideBottom', fill: 'rgba(255,255,255,0.2)', fontSize: 10, dy: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(57,255,135,0.2)', strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey="rate"
                name="Conversion Rate"
                stroke="#39ff87"
                strokeWidth={2}
                dot={{ fill: '#39ff87', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#39ff87', stroke: 'rgba(57,255,135,0.3)', strokeWidth: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent table */}
      <div
        className="glass-card overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm font-bold text-white">Recent Activity</h3>
        </div>
        {customers.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-white/20 text-sm">
            No activity yet. Send your first feedback request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Customer', 'Phone', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-white/30 font-medium uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 10).map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: i < customers.slice(0, 10).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                          style={{
                            background: c.status === 'positive' ? '#39ff87'
                              : c.status === 'negative' ? '#ff4757' : '#fbbf24',
                          }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white/80 font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-white/50">{c.phone}</td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          color: c.status === 'positive' ? '#39ff87'
                            : c.status === 'negative' ? '#ff4757' : '#fbbf24',
                          background: c.status === 'positive' ? 'rgba(57,255,135,0.1)'
                            : c.status === 'negative' ? 'rgba(255,71,87,0.1)' : 'rgba(251,191,36,0.1)',
                          border: `1px solid ${c.status === 'positive' ? 'rgba(57,255,135,0.3)'
                            : c.status === 'negative' ? 'rgba(255,71,87,0.3)' : 'rgba(251,191,36,0.3)'}`,
                        }}
                      >
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white/30 text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
