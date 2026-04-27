import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('useUser: Fetching auth session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('useUser: No session found');
          setUser(null);
          setUserData(null);
          return;
        }

        console.log('useUser: Session found, user:', session.user.id);
        setUser(session.user);
        
        // Load user data from users table
        console.log('useUser: Fetching user data from database...');
        const data = await getUserData(session.user.id);
        
        if (data) {
          console.log('useUser: User data loaded:', data);
          setUserData(data);
        } else {
          console.log('useUser: No user data found, using defaults');
          setUserData({
            plan: 'starter',
            message_limit: 200,
            messages_used: 0,
          });
        }
      } catch (err) {
        console.error('useUser: Error loading user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        console.log('useUser: Auth state changed - no session');
        setUser(null);
        setUserData(null);
        router.push('/login');
      } else {
        console.log('useUser: Auth state changed - session exists');
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
          .catch(err => console.error('useUser: Error fetching user data on auth change:', err));
      }
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
      }
    },
  };
}
