// app/auth/callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const run = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) return router.replace('/auth?error=oauth');
      router.replace('/onboarding'); // or '/'
    };
    run();
  }, [router]);
  return <div className="min-h-[40vh] grid place-items-center">Finishing sign-in…</div>;
}