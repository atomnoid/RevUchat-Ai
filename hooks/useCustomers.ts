import { useState, useEffect } from 'react';
import { getCustomers } from '@/services/messagingService';
import type { Customer } from '@/lib/types';

export function useCustomers(userId: string | null) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // console.log('useCustomers: Fetching customers for user:', userId);
      const data = await getCustomers(userId);
      // console.log('useCustomers: Customers fetched:', data);
      setCustomers(data);
    } catch (err) {
      console.error('useCustomers: Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [userId]);

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const stats = {
    total: customers.length,
    positive: customers.filter(c => c.status === 'positive').length,
    negative: customers.filter(c => c.status === 'negative').length,
    pending: customers.filter(c => c.status === 'pending').length,
  };

  return {
    customers,
    loading,
    error,
    stats,
    refresh: fetchCustomers,
    addCustomer,
    updateCustomer,
  };
}
