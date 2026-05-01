import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  // const user = data.user;
  return user;
}

export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }

  // const data = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}
