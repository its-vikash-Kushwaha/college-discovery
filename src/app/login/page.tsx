'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function LoginWorkspace() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, router, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-650 dark:text-zinc-450">
          Or{' '}
          <Link
            href="/signup"
            className="font-semibold text-indigo-650 hover:text-indigo-500 dark:text-violet-400 dark:hover:text-violet-300"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/75 backdrop-blur-sm px-4 py-8 shadow-xl shadow-zinc-150 border border-zinc-150 rounded-2xl sm:px-10 dark:bg-zinc-900/60 dark:border-zinc-800/80 dark:shadow-none">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-650 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
              <div className="flex gap-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-400"
              >
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm text-zinc-900 shadow-inner outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-violet-500 dark:focus:bg-zinc-950"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-400"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm text-zinc-900 shadow-inner outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-violet-500 dark:focus:bg-zinc-950"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-zinc-150 pt-4 text-center text-xs text-zinc-550 dark:border-zinc-800 dark:text-zinc-450">
            <span>Demo accounts: </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">test@example.com</span>
            <span> / </span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-250 border-t-indigo-600 mx-auto dark:border-zinc-800 dark:border-t-violet-400" />
      </div>
    }>
      <LoginWorkspace />
    </Suspense>
  );
}
