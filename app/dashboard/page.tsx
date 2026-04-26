'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ThumbsUp, ThumbsDown, Phone, User, Clock, CircleCheck as CheckCircle, Circle as XCircle, Star, ExternalLink, RefreshCw, Zap, Users, TrendingUp, Activity } from 'lucide-react';
import type { Customer, CustomerStatus, ChatMessage } from '@/lib/types';

const REVIEW_LINK = 'https://g.page/r/your-google-review-link';
const DEMO_USER = 'demo-user';

function StatusBadge({ status }: { status: CustomerStatus }) {
  const map = {
    pending: { label: 'Pending', cls: 'status-pending', icon: Clock },
    positive: { label: 'Positive', cls: 'status-positive', icon: CheckCircle },
    negative: { label: 'Negative', cls: 'status-negative', icon: XCircle },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      <s.icon size={11} />
      {s.label}
    </span>
  );
}

function ChatWindow({ customer, onRespond }: {
  customer: Customer;
  onRespond: (id: string, type: 'positive' | 'negative') => Promise<void>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [responded, setResponded] = useState(customer.status !== 'pending');
  const [simulating, setSimulating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResponded(customer.status !== 'pending');
    const initial: ChatMessage[] = [
      {
        id: '1',
        role: 'system',
        content: `Hi ${customer.name}! Thanks for visiting us today.\n\nHow was your experience?\n1️⃣  Excellent\n2️⃣  Good\n3️⃣  Not satisfied`,
        timestamp: new Date(),
      },
    ];

    if (customer.status === 'positive') {
      initial.push(
        { id: '2', role: 'customer', content: '1️⃣  Excellent', timestamp: new Date() },
        {
          id: '3',
          role: 'system',
          content: `Thank you! We're thrilled to hear that!\n\nWould you mind sharing your experience on Google? It takes just 30 seconds and helps us a lot.\n\n👉 Leave a Review`,
          timestamp: new Date(),
        }
      );
    } else if (customer.status === 'negative') {
      initial.push(
        { id: '2', role: 'customer', content: '3️⃣  Not satisfied', timestamp: new Date() },
        {
          id: '3',
          role: 'system',
          content: `We're sorry to hear that. Your feedback matters to us.\n\nCould you please tell us what went wrong so we can make it right? Our team will reach out to you shortly.`,
          timestamp: new Date(),
        }
      );
    }

    setMessages(initial);
  }, [customer.name, customer.status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulate = async (type: 'positive' | 'negative') => {
    if (simulating || responded) return;
    setSimulating(true);

    const customerMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'customer',
      content: type === 'positive' ? '1️⃣  Excellent' : '3️⃣  Not satisfied',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, customerMsg]);

    await new Promise((r) => setTimeout(r, 800));

    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'system',
      content: type === 'positive'
        ? `Thank you! We're thrilled to hear that!\n\nWould you mind sharing your experience on Google? It takes just 30 seconds.\n\n👉 Leave a Review`
        : `We're sorry to hear that. Your feedback matters to us.\n\nCould you please tell us what went wrong? Our team will reach out to you shortly.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, replyMsg]);

    await onRespond(customer.id, type);
    setResponded(true);
    setSimulating(false);
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Chat header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(57,255,135,0.04)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
          style={{ background: '#39ff87' }}
        >
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{customer.name}</div>
          <div className="text-xs text-white/40">{customer.phone}</div>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line
                ${msg.role === 'system' ? 'chat-bubble-system text-white/80' : 'chat-bubble-customer text-white/70'}`}
            >
              {msg.role === 'system' && (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(57,255,135,0.2)' }}>
                    <Zap size={9} className="text-[#39ff87]" />
                  </div>
                  <span className="text-xs font-semibold text-[#39ff87]">RevUchat AI</span>
                </div>
              )}
              {msg.content}
              {msg.role === 'system' && customer.status === 'positive' && msg.id !== '1' && (
                <a
                  href={REVIEW_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-black transition-all hover:opacity-90"
                  style={{ background: '#39ff87', display: 'inline-flex' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Star size={12} className="fill-black" />
                  Leave Google Review
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        ))}
        {simulating && (
          <div className="flex justify-start">
            <div className="chat-bubble-system px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#39ff87]/60 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Simulate buttons */}
      {!responded && (
        <div className="px-4 py-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs text-white/30 mb-2 text-center">Simulate customer response</div>
          <div className="flex gap-2">
            <button
              onClick={() => simulate('positive')}
              disabled={simulating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'rgba(57,255,135,0.1)',
                border: '1px solid rgba(57,255,135,0.3)',
                color: '#39ff87',
              }}
            >
              <ThumbsUp size={13} />
              Positive Response
            </button>
            <button
              onClick={() => simulate('negative')}
              disabled={simulating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'rgba(255,71,87,0.08)',
                border: '1px solid rgba(255,71,87,0.3)',
                color: '#ff4757',
              }}
            >
              <ThumbsDown size={13} />
              Negative Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?user_id=${DEMO_USER}`);
      const json = await res.json();
      if (json.data) {
        setCustomers(json.data);
        if (json.data.length > 0 && !selected) {
          setSelected(json.data[0]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), user_id: DEMO_USER }),
      });
      const json = await res.json();
      if (json.data) {
        const newCustomer = json.data as Customer;
        setCustomers((prev) => [newCustomer, ...prev]);
        setSelected(newCustomer);
        setName('');
        setPhone('');
        showToast(`Message sent to ${newCustomer.name} (simulated)`);
      } else {
        showToast('Failed to send request', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (id: string, type: 'positive' | 'negative') => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: type }),
      });
      const json = await res.json();
      if (json.data) {
        const updated = json.data as Customer;
        setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setSelected(updated);
        showToast(
          type === 'positive'
            ? 'Positive response! Google review link sent.'
            : 'Negative feedback captured privately.',
          type === 'positive' ? 'success' : 'error'
        );
      }
    } catch {
      // silent
    }
  };

  const stats = {
    total: customers.length,
    positive: customers.filter((c) => c.status === 'positive').length,
    negative: customers.filter((c) => c.status === 'negative').length,
    pending: customers.filter((c) => c.status === 'pending').length,
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in-up"
          style={{
            background: toast.type === 'success' ? 'rgba(57,255,135,0.12)' : 'rgba(255,71,87,0.12)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(57,255,135,0.4)' : 'rgba(255,71,87,0.4)'}`,
            color: toast.type === 'success' ? '#39ff87' : '#ff4757',
            backdropFilter: 'blur(16px)',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: Users, color: '#39d9ff' },
          { label: 'Positive', value: stats.positive, icon: ThumbsUp, color: '#39ff87' },
          { label: 'Negative', value: stats.negative, icon: ThumbsDown, color: '#ff4757' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#fbbf24' },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card p-5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-medium">{s.label}</span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
              >
                <s.icon size={13} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-black" style={{ color: s.color }}>
              {loading ? <div className="skeleton h-8 w-12 rounded" /> : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Form + Activity */}
        <div className="xl:col-span-1 space-y-6">
          {/* Send feedback form */}
          <div
            className="glass-card p-6"
            style={{ border: '1px solid rgba(57,255,135,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.3)' }}
              >
                <Send size={13} className="text-[#39ff87]" />
              </div>
              <h2 className="text-sm font-bold text-white">Send Feedback Request</h2>
            </div>

            <form onSubmit={sendRequest} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Customer Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-neon-solid w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    Send Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Activity list */}
          <div
            className="glass-card p-5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#39ff87]" />
                <h2 className="text-sm font-bold text-white">Activity</h2>
              </div>
              <button
                onClick={fetchCustomers}
                className="text-white/30 hover:text-white/60 transition-colors p-1 rounded"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={28} className="text-white/10 mx-auto mb-2" />
                <div className="text-sm text-white/30">No customers yet</div>
                <div className="text-xs text-white/20 mt-1">Send your first feedback request</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${
                      selected?.id === c.id ? '' : 'hover:bg-white/5'
                    }`}
                    style={selected?.id === c.id ? {
                      background: 'rgba(57,255,135,0.07)',
                      border: '1px solid rgba(57,255,135,0.2)',
                    } : { border: '1px solid transparent' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                      style={{ background: c.status === 'positive' ? '#39ff87' : c.status === 'negative' ? '#ff4757' : '#fbbf24' }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">{c.name}</div>
                      <div className="text-xs text-white/30 truncate">{c.phone}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat window */}
        <div
          className="xl:col-span-2"
          style={{ minHeight: '520px' }}
        >
          {selected ? (
            <div className="h-full" style={{ minHeight: '520px' }}>
              <ChatWindow
                key={selected.id}
                customer={selected}
                onRespond={handleRespond}
              />
            </div>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center glass-card"
              style={{ minHeight: '520px', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(57,255,135,0.08)', border: '1px solid rgba(57,255,135,0.2)' }}
              >
                <MessageSquare size={28} className="text-[#39ff87]" />
              </div>
              <div className="text-white font-semibold mb-2">No conversation selected</div>
              <div className="text-white/40 text-sm text-center max-w-xs">
                Send a feedback request or select a customer from the activity panel to view their chat.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
