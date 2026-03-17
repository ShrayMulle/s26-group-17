import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from "@supabase/supabase-js";
import { supabase } from '../lib/supabase';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
        setSession(session)
      })

      return () => subscription.unsubscribe()
    }, [])

  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100 text-slate-900">
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-sky-400/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
          {/* Header with branding */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">StudyQuest</h1>
              <p className="mt-1 text-sm text-slate-600">Course planning workspace</p>
            </div>
          </div>

          {/* Auth container */}
          <div className="w-full max-w-md m-10">
            <div className="rounded-2xl m-4 border border-sky-200/70 bg-gradient-to-br from-sky-50/95 via-cyan-50/90 to-emerald-50/85 p-8 shadow-[0_14px_34px_rgba(2,132,199,0.14)] backdrop-blur">
              <div className="mb-6">
                <h2 className="text-center text-xl font-semibold text-slate-900">Welcome back</h2>
                <p className="mt-2 text-center text-sm text-slate-500">Sign in to your account to continue</p>
              </div>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
              />
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    navigate('/dashboard');
  }
}