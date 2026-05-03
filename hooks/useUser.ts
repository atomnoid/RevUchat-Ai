import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [whatsappConnection, setWhatsappConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchWhatsappConnection = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setWhatsappConnection(null);
        } else {
          console.error('Error fetching WhatsApp connection:', error);
        }
      } else {
        setWhatsappConnection(data);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp connection:', err);
    }
  };

  const loadUserSession = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useUser] Calling supabase.auth.getSession()...');
      const { data: { session } } = await supabase.auth.getSession();

      console.log('[useUser] getSession result:', {
        hasSession: !!session,
        userId: session?.user?.id,
        sessionExpiry: session?.expires_at,
      });

      if (!session) {
        setUser(null);
        setUserData(null);
        setWhatsappConnection(null);
        router.push('/login');
        return;
      }

      setUser(session.user);

      const data = await getUserData(session.user.id);
      console.log('[useUser] User data fetch result:', { hasData: !!data });

      if (data) {
        setUserData(data);
      } else {
        setUserData({
          plan: 'starter',
          message_limit: 200,
          messages_used: 0,
        });
      }

      await fetchWhatsappConnection(session.user.id);
    } catch (err) {
      console.error('[useUser] Error loading user:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[useUser] useUser hook initialized');
    loadUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[useUser] Auth state change:', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (!session) {
        setUser(null);
        setUserData(null);
        setWhatsappConnection(null);
        router.push('/login');
        return;
      }

      setUser(session.user);

      getUserData(session.user.id)
        .then(data => {
          if (data) {
            setUserData(data);
          } else {
            setUserData({
              plan: 'starter',
              message_limit: 200,
              messages_used: 0,
            });
          }
        })
        .then(() => fetchWhatsappConnection(session.user.id))
        .catch(err => console.error('[useUser] Error fetching user data on auth change:', err));
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const safeUserData = userData || {
    plan: 'starter',
    message_limit: 200,
    messages_used: 0,
  };

  const usagePercentage = safeUserData.message_limit > 0
    ? Math.round((safeUserData.messages_used / safeUserData.message_limit) * 100)
    : 0;

  const isLimitReached = safeUserData.messages_used >= safeUserData.message_limit;

  return {
    user,
    userData: safeUserData,
    whatsappConnection,
    loading,
    error,
    usagePercentage,
    isLimitReached,
    refresh: () => {
      if (user) {
        getUserData(user.id).then(data => {
          if (data) {
            setUserData(data);
          }
        });
        fetchWhatsappConnection(user.id);
      }
    },
  };
}
