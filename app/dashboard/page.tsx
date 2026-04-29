'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, MessageSquare, ThumbsUp, ThumbsDown, Phone, User, Clock, CircleCheck as CheckCircle, Circle as XCircle, Star, ExternalLink, RefreshCw, Zap, Users, TrendingUp, Activity, AlertTriangle, RotateCcw, Upload, FileSpreadsheet, MessageCircle, Shield } from 'lucide-react';
import type { Customer, CustomerStatus, ChatMessage } from '@/lib/types';
import { useUser } from '@/hooks/useUser';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/lib/supabase';

const REVIEW_LINK = 'https://g.page/r/your-google-review-link';

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

function ChatWindow({ customer, onRespond, onResend, resending }: { customer: Customer; onRespond: (id: string, type: 'positive' | 'negative') => Promise<void>; onResend?: (id: string) => void; resending?: boolean }) {
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
              Happy
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
              Not Happy
            </button>
          </div>
        </div>
      )}

      {/* Resend/Follow-up button for pending customers */}
      {customer.status === 'pending' && responded && onResend && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => onResend(customer.id)}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(57,255,135,0.1)',
              border: '1px solid rgba(57,255,135,0.3)',
              color: '#39ff87',
            }}
          >
            {resending ? (
              <div className="w-4 h-4 border-2 border-[#39ff87]/30 border-t-[#39ff87] rounded-full animate-spin" />
            ) : (
              <RotateCcw size={13} />
            )}
            Resend / Follow-up
          </button>
          <div className="text-xs text-white/30 mt-2 text-center">
            This will allow you to resend the message to customers who haven't responded
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, userData, whatsappConnection, isLimitReached, refresh } = useUser();
  const { customers, loading, stats, refresh: refreshCustomers } = useCustomers(user?.id || null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp connection state
  const [whatsappBusinessName, setWhatsappBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Sync WhatsApp connection data to form
  useEffect(() => {
    if (whatsappConnection) {
      setWhatsappBusinessName(whatsappConnection.business_name || '');
      setWhatsappNumber(whatsappConnection.phone_number || '');
    } else {
      setWhatsappBusinessName('');
      setWhatsappNumber('');
    }
  }, [whatsappConnection]);

  // Realtime subscription for WhatsApp connection changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('whatsapp_connection_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_connections',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('WhatsApp connection changed:', payload);
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (value.trim().length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    // Basic phone validation - allows +, digits, spaces, dashes, parentheses
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value.trim())) {
      setPhoneError('Invalid phone number format');
      return false;
    }
    if (value.trim().length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) validateName(value);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.trim()) validatePhone(value);
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (customers.length > 0 && !selected) {
      setSelected(customers[0]);
    }
  }, [customers, selected]);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }
    
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    
    if (!isNameValid || !isPhoneValid || !user) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerName: name.trim(), 
          customerPhone: phone.trim(),
          message: `Hi ${name.trim()}! Thanks for visiting us today.\n\nHow was your experience?\n1️⃣  Excellent\n2️⃣  Good\n3️⃣  Not satisfied`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Message sent to ${name.trim()} (simulated)`);
        setName('');
        setPhone('');
        setNameError('');
        setPhoneError('');
        await refresh();
      } else {
        showToast(json.error || 'Failed to send request', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (id: string, type: 'positive' | 'negative') => {
    try {
      const res = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: id, response: type }),
      });
      const json = await res.json();
      if (json.success) {
        await refresh();
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

  const handleResend = async (customerId: string) => {
    if (!user) return;
    setResending(true);
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerName: customer.name,
          customerPhone: customer.phone,
          message: `Hi ${customer.name}! Just following up on your feedback request.\n\nHow was your experience?\n1️⃣  Excellent\n2️⃣  Good\n3️⃣  Not satisfied`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Follow-up message sent to ${customer.name}`);
        await refresh();
      } else {
        showToast(json.error || 'Failed to send follow-up', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappBusinessName.trim() || !whatsappNumber.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setSubmittingVerification(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Please login first', 'error');
        return;
      }

      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          action: 'start_verification',
          businessName: whatsappBusinessName.trim(),
          phoneNumber: whatsappNumber.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, 'success');
        await refresh();
      } else {
        showToast(json.error || 'Failed to submit verification', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleRetryVerification = async () => {
    if (!whatsappBusinessName.trim() || !whatsappNumber.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setSubmittingVerification(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Please login first', 'error');
        return;
      }

      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          action: 'retry_verification',
          businessName: whatsappBusinessName.trim(),
          phoneNumber: whatsappNumber.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, 'success');
        await refresh();
      } else {
        showToast(json.error || 'Failed to retry verification', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const canRetryVerification = () => {
    if (!whatsappConnection?.updated_at) return false;
    const lastUpdate = new Date(whatsappConnection.updated_at);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 1;
  };

  const getWhatsAppStatusBadge = () => {
    const status = whatsappConnection?.status || 'not_connected';
    const map = {
      not_connected: { label: 'Not Connected', color: '#ff4757', icon: XCircle },
      pending_call: { label: 'Pending Call', color: '#fbbf24', icon: Clock },
      active: { label: 'Active', color: '#39ff87', icon: CheckCircle },
      failed: { label: 'Failed', color: '#ff4757', icon: XCircle },
    };
    const s = map[status as keyof typeof map] || map.not_connected;
    return { ...s, status };
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check if user has Pro plan
    if (userData?.plan !== 'pro') {
      showToast('CSV upload is available for Pro plan only', 'error');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row if present
      const dataLines = lines[0].toLowerCase().includes('name') ? lines.slice(1) : lines;
      
      let successCount = 0;
      let errorCount = 0;

      for (const line of dataLines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const [name, phone] = parts;
          
          const res = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              customerName: name,
              customerPhone: phone,
              message: `Hi ${name}! Thanks for visiting us today.\n\nHow was your experience?\n1️⃣  Excellent\n2️⃣  Good\n3️⃣  Not satisfied`,
            }),
          });
          
          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      showToast(`CSV uploaded: ${successCount} messages sent${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      await refresh();
      setShowCsvUpload(false);
    } catch {
      showToast('Failed to parse CSV file', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* WhatsApp Connection Card */}
      <div
        className="glass-card p-6"
        style={{ border: '1px solid rgba(57,255,135,0.15)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.3)' }}
            >
              <MessageCircle size={20} className="text-[#39ff87]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect Your WhatsApp</h2>
              <div className="flex items-center gap-2 mt-1">
                {(() => {
                  const badge = getWhatsAppStatusBadge();
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${badge.color}20`, color: badge.color, border: `1px solid ${badge.color}40` }}
                    >
                      <badge.icon size={11} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(57,255,135,0.08)', border: '1px solid rgba(57,255,135,0.2)' }}
          >
            <Shield size={14} className="text-[#39ff87]" />
            <span className="text-xs text-[#39ff87]">Verified</span>
          </div>
        </div>

        {(() => {
          const status = whatsappConnection?.status || 'not_connected';
          
          // Active state - show success
          if (status === 'active') {
            return (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(57,255,135,0.1)', border: '2px solid #39ff87' }}
                >
                  <CheckCircle size={32} className="text-[#39ff87]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">WhatsApp Verified ✅</h3>
                <p className="text-sm text-white/40 mb-4">
                  Your number has been successfully connected.
                </p>
                <p className="text-xs text-white/30">
                  {whatsappConnection?.phone_number}
                </p>
              </div>
            );
          }
          
          // Pending call - show waiting state
          if (status === 'pending_call') {
            const canRetry = canRetryVerification();
            return (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '2px solid #fbbf24' }}
                >
                  <Clock size={32} className="text-[#fbbf24] animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Verification in Progress</h3>
                <p className="text-sm text-white/40 mb-4">
                  You will receive a call within 1 hour for verification.
                </p>
                <p className="text-xs text-white/30 mb-6">
                  Our team will call you and complete your WhatsApp setup.
                </p>
                {canRetry && (
                  <button
                    onClick={handleRetryVerification}
                    disabled={submittingVerification}
                    className="btn-neon-solid px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingVerification ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Retry Verification
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          }
          
          // Failed state - show error
          if (status === 'failed') {
            return (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(255,71,87,0.1)', border: '2px solid #ff4757' }}
                >
                  <XCircle size={32} className="text-[#ff4757]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Verification Failed</h3>
                <p className="text-sm text-white/40 mb-6">
                  Verification failed. Please try again.
                </p>
                <button
                  onClick={handleRetryVerification}
                  disabled={submittingVerification}
                  className="btn-neon-solid px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingVerification ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Retry Verification
                    </>
                  )}
                </button>
              </div>
            );
          }
          
          // Not connected - show form
          return (
            <form onSubmit={handleStartVerification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium">Business Name</label>
                  <input
                    type="text"
                    value={whatsappBusinessName}
                    onChange={(e) => setWhatsappBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingVerification}
                className="btn-neon-solid w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingVerification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageCircle size={16} />
                    Start Verification
                  </>
                )}
              </button>
            </form>
          );
        })()}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-24 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in-up"
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
          { label: 'Happy', value: stats.positive, icon: ThumbsUp, color: '#39ff87' },
          { label: 'Not Happy', value: stats.negative, icon: ThumbsDown, color: '#ff4757' },
          { label: 'Waiting', value: stats.pending, icon: Clock, color: '#fbbf24' },
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          />
          <div
            className="relative glass-card p-8 max-w-md w-full"
            style={{ border: '1px solid rgba(57,255,135,0.2)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.3)' }}
              >
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Message Limit Reached</h3>
                <p className="text-sm text-white/50">You&apos;ve used all your monthly messages</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Current Plan</span>
                <span className="text-white font-semibold capitalize">{userData?.plan || 'Starter'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Messages Used</span>
                <span className="text-red-400 font-semibold">{userData?.messages_used || 0}/{userData?.message_limit || 200}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/settings"
                onClick={() => setShowUpgradeModal(false)}
                className="btn-neon-solid w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                Upgrade Your Plan
                <TrendingUp size={16} />
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Form + Activity */}
        <div className="xl:col-span-1 space-y-6">
          {/* Send feedback form */}
          <div
            className="glass-card p-6"
            style={{ border: '1px solid rgba(57,255,135,0.15)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.3)' }}
                >
                  <Send size={13} className="text-[#39ff87]" />
                </div>
                <h2 className="text-sm font-bold text-white">Send Feedback Request</h2>
              </div>
              {userData?.plan === 'pro' && (
                <button
                  onClick={() => setShowCsvUpload(!showCsvUpload)}
                  className="text-xs text-[#39ff87] hover:text-[#39ff87]/80 transition-colors flex items-center gap-1"
                >
                  <FileSpreadsheet size={12} />
                  CSV Upload
                </button>
              )}
            </div>

            {/* CSV Upload Section */}
            {showCsvUpload && userData?.plan === 'pro' && (
              <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(57,255,135,0.05)', border: '1px solid rgba(57,255,135,0.2)' }}>
                <div className="text-xs text-white/60 mb-2">
                  Upload CSV file with columns: Name, Phone
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(57,255,135,0.1)',
                    border: '1px solid rgba(57,255,135,0.3)',
                    color: '#39ff87',
                  }}
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-[#39ff87]/30 border-t-[#39ff87] rounded-full animate-spin" />
                  ) : (
                    <Upload size={13} />
                  )}
                  {uploading ? 'Uploading...' : 'Select CSV File'}
                </button>
              </div>
            )}

            <form onSubmit={sendRequest} className="space-y-4">
              <div className="text-xs text-[#39ff87]/80 mb-3 flex items-center gap-1.5">
                <Zap size={11} />
                Messages are sent automatically. No typing needed.
              </div>
              
              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Customer Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="John Smith"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 transition-all ${
                      nameError ? 'border-red-400' : ''
                    }`}
                    style={{ 
                      background: 'rgba(255,255,255,0.04)', 
                      border: nameError ? '1px solid #ff4757' : '1px solid rgba(255,255,255,0.1)' 
                    }}
                  />
                </div>
                {nameError && (
                  <div className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {nameError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 transition-all ${
                      phoneError ? 'border-red-400' : ''
                    }`}
                    style={{ 
                      background: 'rgba(255,255,255,0.04)', 
                      border: phoneError ? '1px solid #ff4757' : '1px solid rgba(255,255,255,0.1)' 
                    }}
                  />
                </div>
                {phoneError && (
                  <div className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {phoneError}
                  </div>
                )}
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
                onClick={refresh}
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
                <div className="text-xs text-white/20 mt-1">Send your first message</div>
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
                onResend={handleResend}
                resending={resending}
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
              <div className="text-sm font-semibold text-white">No conversation selected</div>
              <div className="text-white/40 text-sm text-center max-w-xs">
                Send a message or select a customer to view their conversation.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
