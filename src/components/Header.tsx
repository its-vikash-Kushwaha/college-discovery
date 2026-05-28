'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, savedIds, loading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Find Colleges', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: 'Watchlist', href: '/watchlist', badge: savedIds.length },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-200 transition-all group-hover:scale-105 dark:shadow-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M12 13.49v.01"
                />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-zinc-950 to-zinc-800 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-white dark:to-zinc-300">
              College<span className="from-violet-600 to-indigo-600 text-indigo-600 dark:text-violet-400">Discover</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-violet-400'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  {link.name}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1 text-2xs font-semibold text-indigo-600 dark:bg-violet-950/50 dark:text-violet-300">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-violet-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Auth Section */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-850" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-sm text-zinc-600 dark:text-zinc-400">
                Hi, <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
              </span>
              {/* Mobile Watchlist Icon */}
              <Link
                href="/watchlist"
                className="relative p-2 md:hidden text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                  />
                </svg>
                {savedIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-3xs font-semibold text-white">
                    {savedIds.length}
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-100 transition-all hover:brightness-105 dark:shadow-none"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
