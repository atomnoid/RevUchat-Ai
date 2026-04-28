'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Zap, Crown, ArrowRight, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/lib/auth';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹599',
    interactions: 200,
    features: [
      '200 Interactions per month',
      'Manual Send (one-click messaging)',
      'Basic Analytics',
      'Email Support'
    ],
    icon: Zap,
    color: '#39d9ff',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₹799',
    interactions: 350,
    popular: true,
    features: [
      '350 Interactions per month',
      'Auto Follow-up (1 Reminder)',
      'Priority Sending',
      'Advanced Analytics',
      'Priority Support'
    ],
    icon: Crown,
    color: '#39ff87',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹999',
    interactions: 500,
    features: [
      '500 Interactions per month',
      'Auto Follow-up (2 Reminders)',
      'Bulk Upload (CSV)',
      'Advanced Analytics',
      'Priority Support'
    ],
    icon: CreditCard,
    color: '#c87bff',
  },
];

/**
 * Placeholder function for payment success handler
 * 
 * FUTURE INTEGRATION:
 * - Integrate with Razorpay / Stripe
 * - Handle payment webhooks
 * - Update user plan after successful payment
 */
async function handlePaymentSuccess(userId: string, newPlan: string, newLimit: number) {
  // Placeholder logic
  console.log(`Payment successful for user ${userId}, upgrading to ${newPlan}`);
  
  // FUTURE: This will be called by payment provider webhook
  // const { error } = await supabase
  //   .from('users')
  //   .update({ 
  //     plan: newPlan, 
  //     message_limit: newLimit,
  //     messages_used: 0 // Reset counter on upgrade
  //   })
  //   .eq('id', userId);
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching user data for settings...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('User found for settings:', session.user.id);
          const data = await getUserData(session.user.id);
          console.log('User data for settings:', data);
          setUserData(data);
        } else {
          console.log('No user found for settings');
        }
      } catch (err) {
        console.error('Error loading user data for settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    
    // FUTURE: Initiate payment flow here
    // const paymentResponse = await initiatePayment(planId);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, just show success
    alert(`Payment integration placeholder: Would upgrade to ${planId} plan`);
    setUpgrading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#39ff87] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your subscription and account</p>
      </div>

      {/* Current Plan */}
      <div
        className="glass-card p-6"
        style={{ border: '1px solid rgba(57,255,135,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/40 mb-1">Current Plan</div>
            <div className="text-2xl font-black text-white capitalize">{userData?.plan || 'Starter'}</div>
            <div className="text-sm text-white/50 mt-1">
              {userData?.messages_used || 0} / {userData?.message_limit || 200} messages used this month
            </div>
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(57,255,135,0.1)', border: '1px solid rgba(57,255,135,0.3)' }}
          >
            <Crown size={28} className="text-[#39ff87]" />
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = userData?.plan === plan.id;
            const isUpgrade = plan.interactions > (userData?.message_limit || 200);
            
            return (
              <div
                key={plan.id}
                className={`relative glass-card p-6 transition-all ${
                  plan.popular ? 'hover:scale-105' : 'card-hover'
                }`}
                style={{
                  border: plan.popular ? '2px solid #39ff87' : '1px solid rgba(255,255,255,0.06)',
                  opacity: isCurrentPlan ? 0.7 : 1,
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-black"
                    style={{ background: '#39ff87' }}
                  >
                    MOST POPULAR
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <plan.icon size={20} style={{ color: plan.color }} />
                  <div className="text-lg font-bold text-white">{plan.name}</div>
                </div>
                
                <div className="text-3xl font-black mb-4" style={{ color: plan.color }}>
                  {plan.price}
                  <span className="text-sm text-white/40 font-normal">/month</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                      <Check size={14} className="text-[#39ff87] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || upgrading === plan.id}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    isCurrentPlan
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'btn-neon-solid'
                  }`}
                >
                  {upgrading === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : isUpgrade ? (
                    'Upgrade'
                  ) : (
                    'Downgrade'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Info Placeholder */}
      <div
        className="glass-card p-6"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-sm font-bold text-white mb-4">Payment Information</h3>
        <div className="text-sm text-white/40 space-y-2">
          <p>Payment integration placeholder.</p>
          <p className="text-xs">Future: Razorpay / Stripe integration will be added here.</p>
        </div>
      </div>
    </div>
  );
}
