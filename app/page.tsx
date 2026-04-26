'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CyberBackground from '@/components/CyberBackground';
import { Star, MessageSquare, TrendingUp, Shield, Zap, Users, ChevronRight, Check, ArrowRight, Bot, ChartBar as BarChart3, Globe, Lock, Sparkles, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Smart Feedback Collection',
    desc: 'Instantly reach customers post-visit with personalized feedback requests via simulated messaging.',
    iconColor: '#39ff87',
    bgColor: 'rgba(57,255,135,0.08)',
    borderColor: 'rgba(57,255,135,0.2)',
  },
  {
    icon: Bot,
    title: 'AI Response Analysis',
    desc: 'Intelligent system detects sentiment and automatically routes positive customers to Google reviews.',
    iconColor: '#39d9ff',
    bgColor: 'rgba(57,217,255,0.08)',
    borderColor: 'rgba(57,217,255,0.2)',
  },
  {
    icon: TrendingUp,
    title: 'Reputation Growth',
    desc: 'Watch your star rating climb as happy customers are guided directly to your Google Business profile.',
    iconColor: '#fbbf24',
    bgColor: 'rgba(251,191,36,0.08)',
    borderColor: 'rgba(251,191,36,0.2)',
  },
  {
    icon: Shield,
    title: 'Protect Your Brand',
    desc: 'Negative feedback is captured privately, letting you resolve issues before they go public.',
    iconColor: '#ff4757',
    bgColor: 'rgba(255,71,87,0.08)',
    borderColor: 'rgba(255,71,87,0.2)',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Track conversion rates, response patterns, and reputation metrics with a live analytics dashboard.',
    iconColor: '#a8ff78',
    bgColor: 'rgba(168,255,120,0.08)',
    borderColor: 'rgba(168,255,120,0.2)',
  },
  {
    icon: Globe,
    title: 'Multi-location Support',
    desc: 'Manage feedback campaigns across all your business locations from one unified dashboard.',
    iconColor: '#c87bff',
    bgColor: 'rgba(200,123,255,0.08)',
    borderColor: 'rgba(200,123,255,0.2)',
  },
];

const steps = [
  {
    num: '01',
    title: 'Send Feedback Request',
    desc: 'Enter customer name and phone. The system instantly dispatches a personalized feedback message.',
    icon: MessageCircle,
  },
  {
    num: '02',
    title: 'Customer Responds',
    desc: 'Customer selects their experience rating. AI analyzes the sentiment response instantly.',
    icon: Zap,
  },
  {
    num: '03',
    title: 'Convert to Reviews',
    desc: 'Positive responses trigger a Google review link. Negative ones route to your support team privately.',
    icon: Star,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Dental Clinic Owner',
    text: 'RevUchat AI transformed our reputation. We went from 3.8 to 4.9 stars in just 3 months. The automation is seamless.',
    stars: 5,
    avatar: 'SJ',
  },
  {
    name: 'Marcus Chen',
    role: 'Restaurant Manager',
    text: 'Best investment we made. Customers love the quick check-in process and our reviews speak for themselves.',
    stars: 5,
    avatar: 'MC',
  },
  {
    name: 'Emily Torres',
    role: 'Spa Director',
    text: 'Incredibly intuitive and powerful. The dashboard gives us everything. Our Google rating jumped from 4.1 to 4.8 stars.',
    stars: 5,
    avatar: 'ET',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '₹499',
    desc: 'Perfect for small businesses',
    features: ['200 review requests/mo', 'Feedback collection system', 'Basic analytics', 'WhatsApp simulation', 'Email support'],
    cta: 'Start Free Trial',
    featured: false,
  },
  {
    name: 'Growth',
    price: '₹749',
    desc: 'The complete solution for growth',
    features: ['500 review requests/mo', 'Everything in Starter', 'Advanced analytics', 'Priority support', 'Faster response handling'],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Scale',
    price: '₹999',
    desc: 'Unlimited power for large operations',
    features: ['1000 review requests/mo', 'Everything in Growth', 'Priority processing', 'Dedicated support', 'Higher performance'],
    cta: 'Start Free Trial',
    featured: false,
  },
  {
    name: 'Custom',
    price: 'Custom Pricing',
    desc: 'For enterprise needs',
    features: ['Unlimited review requests', 'Custom integrations', 'Dedicated onboarding', 'Personalized support', 'White-label options'],
    cta: 'Contact Us',
    featured: false,
    isContact: true,
  },
];

function AnimatedStat({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  const [count, setCount] = useState(0);
  const numValue = parseInt(value.replace(/[^0-9]/g, ''));
  const displayValue = value.includes('K') || value.includes('+') ? value : `${count}+`;

  useEffect(() => {
    if (numValue === 0) return;
    const interval = setInterval(() => {
      setCount((prev) => (prev < numValue ? prev + Math.ceil(numValue / 30) : numValue));
    }, 50);
    return () => clearInterval(interval);
  }, [numValue]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon size={16} className="text-[#39ff87]" />
        <div className="text-3xl font-black neon-text">{displayValue}</div>
      </div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <CyberBackground />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.4)' }}
          >
            <Bot size={16} className="text-[#39ff87]" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">RevU</span>
            <span className="neon-text">chat</span>
            <span className="text-white ml-1 text-sm font-light opacity-60">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link href="/login" className="btn-neon-solid text-sm px-5 py-2 rounded-lg font-semibold">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
          style={{ background: 'rgba(57,255,135,0.1)', border: '1px solid rgba(57,255,135,0.3)', color: '#39ff87' }}
        >
          <Sparkles size={12} />
          AI-Powered Reputation Management
        </div>

        <h1
          className={`text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          Turn Customers into
          <br />
          <span className="gradient-text">5 Star Reviews</span>
          <br />
          Automatically
        </h1>

        <p
          className={`text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}
        >
          Collect feedback and grow your reputation effortlessly. Our AI system routes happy customers directly to your Google profile while protecting you from negative publicity.
        </p>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
          <Link
            href="/login"
            className="btn-neon-solid px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 group"
          >
            Start Free Trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="btn-neon px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2"
          >
            See How It Works
            <ChevronRight size={18} />
          </a>
        </div>

        <div className={`mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto ${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
          {[
            { val: '10K+', label: 'Businesses' },
            { val: '2.4M', label: 'Reviews Generated' },
            { val: '4.9', label: 'Avg Rating Boost' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black neon-text">{s.val}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase neon-text mb-3">Features</div>
          <h2 className="text-4xl font-black text-white">Everything you need to dominate</h2>
          <p className="text-white/40 mt-3 max-w-xl mx-auto">Built for modern businesses that take their online reputation seriously.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 card-hover cursor-default group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: f.bgColor, border: `1px solid ${f.borderColor}` }}
              >
                <f.icon size={22} style={{ color: f.iconColor }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase neon-text mb-3">Process</div>
          <h2 className="text-4xl font-black text-white">How RevUchat AI works</h2>
          <p className="text-white/40 mt-3">Three simple steps to 5-star reputation domination.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-16 left-full w-full h-px z-10"
                  style={{ background: 'linear-gradient(90deg, rgba(57,255,135,0.4), transparent)' }}
                />
              )}
              <div className="glass-card p-8 text-center card-hover">
                <div className="text-6xl font-black mb-4" style={{ color: 'rgba(57,255,135,0.12)' }}>{step.num}</div>
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(57,255,135,0.1)', border: '1px solid rgba(57,255,135,0.3)' }}
                >
                  <step.icon size={24} className="text-[#39ff87]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase neon-text mb-3">Testimonials</div>
          <h2 className="text-4xl font-black text-white">Trusted by thousands of businesses</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-6 card-hover">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#39ff87] fill-[#39ff87]" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black"
                  style={{ background: '#39ff87' }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-white/40 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase neon-text mb-3">Pricing</div>
          <h2 className="text-4xl font-black text-white">Simple, transparent pricing</h2>
          <p className="text-white/40 mt-3">14-day free trial. No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative glass-card p-8 card-hover"
              style={plan.featured ? {
                border: '1px solid rgba(57,255,135,0.4)',
                boxShadow: '0 0 40px rgba(57,255,135,0.1)',
              } : {}}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-black"
                  style={{ background: '#39ff87' }}
                >
                  MOST POPULAR
                </div>
              )}
              <div className="text-white/60 text-sm mb-2">{plan.name}</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-white/40 text-sm pb-2">/month</span>
              </div>
              <p className="text-white/40 text-sm mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check size={14} className="text-[#39ff87] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${plan.featured ? 'btn-neon-solid' : 'btn-neon'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 max-w-4xl mx-auto text-center">
        <div
          className="glass-card p-12"
          style={{ border: '1px solid rgba(57,255,135,0.2)', boxShadow: '0 0 60px rgba(57,255,135,0.05)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.4)' }}
          >
            <Zap size={28} className="text-[#39ff87]" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Ready to grow your reputation?</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Join thousands of businesses already using RevUchat AI to dominate their local market.
          </p>
          <Link
            href="/login"
            className="btn-neon-solid px-10 py-4 rounded-xl text-base font-bold inline-flex items-center gap-2 group"
          >
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-[#39ff87]" />
            <span className="font-bold text-white">
              RevUchat <span className="neon-text">AI</span>
            </span>
          </div>
          <div className="text-white/30 text-sm">2026 RevUchat AI. All rights reserved.</div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Lock size={12} />
            Enterprise-grade security
          </div>
        </div>
      </footer>
    </div>
  );
}
