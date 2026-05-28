'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Course {
  id: string;
  name: string;
  duration: number;
  fees: number;
}

interface Placement {
  id: string;
  year: number;
  highestPackage: number;
  averagePackage: number;
}

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  logoUrl: string | null;
  bannerUrl: string | null;
  courses: Course[];
  placements: Placement[];
}

export default function WatchlistPage() {
  const { user, loading, toggleSave } = useAuth();
  const [savedColleges, setSavedColleges] = useState<College[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchWatchlist = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedColleges(data.saved);
      }
    } catch (err) {
      console.error('Fetch watchlist error:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setFetching(false);
    }
  }, [user]);

  const handleUnsave = async (collegeId: string) => {
    await toggleSave(collegeId);
    setSavedColleges((prev) => prev.filter((c) => c.id !== collegeId));
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh / Year`;
    }
    return `₹${amount.toLocaleString('en-IN')} / Year`;
  };

  if (loading || fetching) {
    return (
      <div className="flex-1 bg-zinc-50 py-12 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-250 border-t-indigo-600 dark:border-zinc-800 dark:border-t-violet-400" />
        <span className="mt-4 text-xs font-semibold text-zinc-550 dark:text-zinc-450">Loading your watchlist...</span>
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="flex-1 bg-gradient-to-b from-zinc-50 to-white py-16 dark:from-zinc-950 dark:to-black min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="mx-auto max-w-md w-full px-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center shadow-lg dark:bg-zinc-900 dark:border-zinc-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-violet-950/20 dark:text-violet-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-7 w-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
            <h3 className="mt-6 text-lg font-black text-zinc-950 dark:text-white">Secure Dashboard</h3>
            <p className="mt-2 text-xs text-zinc-550 dark:text-zinc-450 max-w-xs mx-auto">
              Please sign in or create an account to view and manage your personalized saved colleges list.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login?redirect=/watchlist"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:brightness-105 dark:shadow-none"
              >
                Log In
              </Link>
              <Link
                href="/signup?redirect=/watchlist"
                className="rounded-xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-3xl font-black text-zinc-950 dark:text-white">My Watchlist</h1>
          <p className="mt-2 text-sm text-zinc-550 dark:text-zinc-450">
            A secure workspace showing colleges you saved. Compare them or review tuition fees and packages.
          </p>
        </div>

        {/* Saved Cards List */}
        {savedColleges.length === 0 ? (
          // Empty state
          <div className="bg-white border border-zinc-200 rounded-3xl p-16 text-center dark:bg-zinc-900 dark:border-zinc-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mx-auto h-16 w-16 text-indigo-600/80 dark:text-violet-400/80"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Your Watchlist is empty</h3>
            <p className="mt-2 text-sm text-zinc-550 max-w-sm mx-auto">
              Browse the college directory and press the bookmark star icon on colleges to save them here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:brightness-105 dark:shadow-none"
            >
              Explore Colleges
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedColleges.map((college) => {
              const topPlacement = college.placements[0];
              
              return (
                <div
                  key={college.id}
                  className="group relative flex flex-col justify-between overflow-hidden bg-white border border-zinc-200/80 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none"
                >
                  {/* Banner Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-zinc-100">
                    {college.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={college.bannerUrl} alt={college.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-indigo-100 to-violet-100 dark:from-zinc-850 dark:to-zinc-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-lg bg-black/45 backdrop-blur-md px-2 py-1 text-xs font-bold text-white">
                      <span className="text-yellow-450">★</span>
                      <span>{college.rating.toFixed(1)}</span>
                    </div>

                    {/* Remove Star Icon */}
                    <button
                      onClick={() => handleUnsave(college.id)}
                      className="absolute top-3 right-3 rounded-full p-2 bg-amber-500/10 border border-amber-500/40 text-amber-500 backdrop-blur-md shadow-sm transition-all hover:bg-amber-500/20"
                      title="Remove from Watchlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                      </svg>
                    </button>

                    {/* Location */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-xs font-semibold opacity-90 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                          />
                        </svg>
                        {college.location}, {college.state}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <Link href={`/colleges/${college.id}`}>
                        <h3 className="text-base font-bold text-zinc-950 hover:text-indigo-650 leading-5 transition-colors line-clamp-1 dark:text-white dark:hover:text-violet-400">
                          {college.name}
                        </h3>
                      </Link>

                      <div className="mt-4 flex flex-wrap gap-2 text-2xs font-semibold uppercase tracking-wider">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-zinc-550 dark:bg-zinc-850 dark:text-zinc-400">
                          {college.courses.length} Courses
                        </span>
                        {topPlacement && (
                          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400">
                            Avg Placement: {topPlacement.averagePackage} LPA
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-150 flex items-center justify-between dark:border-zinc-800">
                      <div>
                        <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">
                          Tuition fees
                        </span>
                        <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                          {formatCurrency(college.fees)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/compare?add=${college.id}`}
                          className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-900 dark:text-zinc-350 dark:hover:bg-zinc-800"
                          title="Compare College"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-4.5 w-4.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                          </svg>
                        </Link>
                        <Link
                          href={`/colleges/${college.id}`}
                          className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-500"
                        >
                          Explore
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
