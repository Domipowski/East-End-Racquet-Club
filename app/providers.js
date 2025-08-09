'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Providers({ children }) {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session?.user?.id) return;

        const { data: existing } = await supabase
          .from('profiles')
          .select('id, onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!existing) {
          await supabase
            .from('profiles')
            .upsert({ id: session.user.id, onboarding_completed: false }, { onConflict: 'id', ignoreDuplicates: true });
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        const needs = !profile || !profile.onboarding_completed;
        const isAuthish = path?.startsWith('/auth') || path?.startsWith('/onboarding');
        if (!isAuthish) router.replace(needs ? '/onboarding' : '/');
      }
    );

    return () => subscription.unsubscribe();
  }, [router, path]);

  return <>{children}</>;
}