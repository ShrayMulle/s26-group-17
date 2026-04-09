import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from "@supabase/supabase-js";
import { supabase } from '../lib/supabase';
import { GraduationCap } from 'lucide-react';

async function syncWithBackend(session: Session) {
  const email = session.user.email!;
  const name = session.user.user_metadata?.full_name || email.split('@')[0];
  const password = email; // use email as password for consistency

  // Try to register (will fail if already exists, that's ok)
  try {
    await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
  } catch (_) {}

  // Login to get FastAPI JWT token
  try {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log('Login response:', res.status, data);
    if (res.ok) {
      localStorage.setItem('token', data.access_token);
      console.log('Token saved:', data.access_token?.slice(0, 20));
    }
  } catch (_) {}
}

export default function LoginPage() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        await syncWithBackend(session);
        setTimeout(() => navigate('/dashboard'), 100);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await syncWithBackend(session);
        setTimeout(() => navigate('/dashboard'), 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:w-2/5">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">StudyQuest</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Course planning workspace</p>

          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign in to your account to continue.</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:w-3/5 lg:p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#111827',
                    brandAccent: '#1f2937',
                    inputBackground: '#f9fafb',
                    inputBorder: '#d1d5db',
                    inputText: '#111827',
                    inputPlaceholder: '#6b7280',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}
