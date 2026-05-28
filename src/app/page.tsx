'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  overview: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  courses: Array<{ id: string; name: string; duration: number; fees: number }>;
  placements: Array<{ id: string; year: number; highestPackage: number; averagePackage: number }>;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

const AVAILABLE_STATES = ['Delhi', 'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu'];

export default function HomePage() {
  const { toggleSave, savedIds, user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxFees, setMaxFees] = useState<number>(1200000);
  const [sortBy, setSortBy] = useState('rating_desc');
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch colleges whenever filter criteria changes
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const stateParams = selectedStates.join(',');
      const url = `/api/colleges?query=${encodeURIComponent(debouncedQuery)}&state=${encodeURIComponent(
        stateParams
      )}&minRating=${minRating}&maxFees=${maxFees}&sortBy=${sortBy}&page=${page}&limit=6`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setColleges(data.colleges);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedStates, minRating, maxFees, sortBy, page]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedStates, minRating, maxFees, sortBy]);

  const handleStateToggle = (stateName: string) => {
    setSelectedStates((prev) =>
      prev.includes(stateName) ? prev.filter((s) => s !== stateName) : [...prev, stateName]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStates([]);
    setMinRating(0);
    setMaxFees(1200000);
    setSortBy('rating_desc');
    setPage(1);
  };

  // Formatting utility
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-zinc-50 py-16 dark:from-zinc-900/40 dark:via-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-750 dark:bg-violet-950/40 dark:text-violet-300">
              🎓 Empowering Your Educational Journey
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-650 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
                Perfect College
              </span>
            </h1>
            <p className="mt-4 text-lg leading-7 text-zinc-650 dark:text-zinc-400">
              Search, filter, and compare premier Indian institutes. Access detailed placement packages, fee breakdown tables, and real ratings to make decision-making transparent.
            </p>

            {/* Quick Search */}
            <div className="mt-8 mx-auto max-w-xl">
              <div className="relative rounded-2xl bg-white shadow-lg shadow-zinc-150 border border-zinc-200/80 p-2 flex items-center gap-2 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none">
                <div className="flex-1 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 text-zinc-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by college name, city or state..."
                    className="ml-3 block w-full border-0 bg-transparent p-0 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-0 dark:text-white"
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Directory */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          
          {/* Filters Sidebar */}
          <div className="lg:block bg-white/70 backdrop-blur-sm border border-zinc-200/80 rounded-2xl p-6 h-fit dark:bg-zinc-900/60 dark:border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-indigo-650 hover:text-indigo-500 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Reset All
              </button>
            </div>

            {/* Filter by States */}
            <div className="mt-6 border-b border-zinc-150 pb-5 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-400">
                States
              </h3>
              <div className="mt-3 space-y-2">
                {AVAILABLE_STATES.map((stateName) => (
                  <label key={stateName} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(stateName)}
                      onChange={() => handleStateToggle(stateName)}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <span className="text-sm text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-450 dark:group-hover:text-zinc-200">
                      {stateName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter by Fees Range */}
            <div className="mt-6 border-b border-zinc-150 pb-5 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-400">
                  Annual Budget
                </h3>
                <span className="text-xs font-bold text-indigo-600 dark:text-violet-400">
                  {maxFees === 1200000 ? 'Any' : `< ${formatCurrency(maxFees)}`}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="1200000"
                step="10000"
                value={maxFees}
                onChange={(e) => setMaxFees(parseInt(e.target.value))}
                className="mt-4 w-full h-1.5 rounded-lg bg-zinc-200 appearance-none cursor-pointer accent-indigo-600 dark:bg-zinc-800 dark:accent-violet-500"
              />
              <div className="mt-2 flex items-center justify-between text-2xs font-semibold text-zinc-450 dark:text-zinc-550">
                <span>₹10K</span>
                <span>₹12L</span>
              </div>
            </div>

            {/* Filter by Rating */}
            <div className="mt-6 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-400">
                Minimum Rating
              </h3>
              <div className="mt-3 grid grid-cols-5 gap-1">
                {[0, 4.0, 4.2, 4.5, 4.8].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => setMinRating(ratingVal)}
                    className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      minRating === ratingVal
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-650 dark:border-violet-500 dark:bg-violet-950/20 dark:text-violet-300'
                        : 'border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {ratingVal === 0 ? 'All' : `${ratingVal}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="lg:col-span-3">
            {/* Top Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-zinc-200/80 rounded-2xl p-4 mb-6 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {loading ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    Showing <span className="text-zinc-900 dark:text-white">{colleges.length}</span> of{' '}
                    <span className="text-zinc-900 dark:text-white">
                      {pagination?.totalCount || colleges.length}
                    </span>{' '}
                    Colleges
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                {/* Sorting Select */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sortBy" className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                    Sort By:
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:border-violet-500"
                  >
                    <option value="rating_desc">Highest Rating</option>
                    <option value="fees_asc">Fees: Low to High</option>
                    <option value="fees_desc">Fees: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>

                {/* View Toggles */}
                <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-1.5 ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-indigo-650 dark:bg-zinc-900 dark:text-violet-400'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
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
                        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-1.5 ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-indigo-650 dark:bg-zinc-900 dark:text-violet-400'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
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
                        d="M3.75 12h16.5m-16.5 5.25h16.5m-16.5-10.5h16.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Shimmer List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-80 w-full animate-pulse rounded-2xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800" />
                ))}
              </div>
            ) : colleges.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center dark:bg-zinc-900 dark:border-zinc-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mx-auto h-12 w-12 text-zinc-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">No colleges found</h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
                  We couldn&apos;t find any colleges matching your search query or active filter selections. Try clearing some parameters!
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {colleges.map((college) => {
                  const isSaved = savedIds.includes(college.id);
                  const topPlacement = college.placements[0];
                  
                  return (
                    <div
                      key={college.id}
                      className="group relative flex flex-col justify-between overflow-hidden bg-white border border-zinc-200/80 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none"
                    >
                      {/* Banner Image */}
                      <div className="relative h-40 w-full overflow-hidden bg-zinc-100">
                        {college.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={college.bannerUrl}
                            alt={college.name}
                            className="h-full w-full object-cover transition-all duration-505 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-tr from-indigo-100 to-violet-100 dark:from-zinc-850 dark:to-zinc-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-lg bg-black/45 backdrop-blur-md px-2 py-1 text-xs font-bold text-white">
                          <span className="text-yellow-450">★</span>
                          <span>{college.rating.toFixed(1)}</span>
                        </div>

                        {/* Watchlist Toggle Star */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleSave(college.id);
                          }}
                          className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-md shadow-sm border transition-all ${
                            isSaved
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20'
                              : 'bg-black/45 border-white/20 text-white hover:bg-black/60'
                          }`}
                          title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill={isSaved ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-4.5 w-4.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499c.195-.39.787-.39.982 0l2.35 4.767 5.233.76c.43.062.602.593.29.904l-3.793 3.698.895 5.21c.074.432-.38.762-.767.558L12 18.347l-4.693 2.47c-.388.204-.842-.126-.767-.558l.895-5.21-3.793-3.698c-.312-.31-.14-.841.29-.904l5.233-.76 2.35-4.767Z"
                            />
                          </svg>
                        </button>

                        {/* Location Details on Image Banner */}
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

                      {/* Content Card Body */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <Link href={`/colleges/${college.id}`}>
                            <h3 className="text-base font-bold text-zinc-950 hover:text-indigo-650 leading-5 transition-colors line-clamp-1 dark:text-white dark:hover:text-violet-400">
                              {college.name}
                            </h3>
                          </Link>

                          {/* Secondary Metadata Info */}
                          <div className="mt-4 flex flex-wrap gap-2 text-2xs font-semibold text-zinc-500 uppercase tracking-wider">
                            <span className="rounded-lg bg-zinc-100 px-2 py-1 dark:bg-zinc-800 dark:text-zinc-400">
                              {college.courses.length} Courses
                            </span>
                            {topPlacement && (
                              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400">
                                Max Lpa: {topPlacement.highestPackage} Lakhs
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tuition Fees & Action Details */}
                        <div className="mt-6 pt-4 border-t border-zinc-150 flex items-center justify-between dark:border-zinc-800">
                          <div>
                            <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">
                              Avg Annual Tuition
                            </span>
                            <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                              {formatCurrency(college.fees)}
                            </span>
                          </div>
                          
                          <Link
                            href={`/colleges/${college.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-850 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                          >
                            Explore Detail
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Layout */
              <div className="space-y-4">
                {colleges.map((college) => {
                  const isSaved = savedIds.includes(college.id);
                  const topPlacement = college.placements[0];
                  
                  return (
                    <div
                      key={college.id}
                      className="group relative flex flex-col sm:flex-row overflow-hidden bg-white border border-zinc-200/80 rounded-2xl shadow-sm transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none"
                    >
                      {/* Left Thumbnail Banner */}
                      <div className="relative h-44 sm:h-auto sm:w-56 flex-shrink-0 overflow-hidden bg-zinc-100">
                        {college.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={college.bannerUrl}
                            alt={college.name}
                            className="h-full w-full object-cover transition-all duration-505 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-tr from-indigo-100 to-violet-100 dark:from-zinc-850 dark:to-zinc-800" />
                        )}
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-lg bg-black/45 backdrop-blur-md px-2 py-1 text-xs font-bold text-white">
                          <span className="text-yellow-450">★</span>
                          <span>{college.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <Link href={`/colleges/${college.id}`}>
                              <h3 className="text-lg font-bold text-zinc-950 hover:text-indigo-650 leading-6 transition-colors dark:text-white dark:hover:text-violet-400">
                                {college.name}
                              </h3>
                            </Link>
                            
                            {/* Star Toggle */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleSave(college.id);
                              }}
                              className={`rounded-full p-2 backdrop-blur-md shadow-sm border transition-all ${
                                isSaved
                                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20'
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-650 dark:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                              }`}
                              title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill={isSaved ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4.5 w-4.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11.48 3.499c.195-.39.787-.39.982 0l2.35 4.767 5.233.76c.43.062.602.593.29.904l-3.793 3.698.895 5.21c.074.432-.38.762-.767.558L12 18.347l-4.693 2.47c-.388.204-.842-.126-.767-.558l.895-5.21-3.793-3.698c-.312-.31-.14-.841.29-.904l5.233-.76 2.35-4.767Z"
                                />
                              </svg>
                            </button>
                          </div>

                          <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="h-3.5 w-3.5 text-zinc-400"
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

                          {/* Relational Quick Stats */}
                          <div className="mt-4 flex flex-wrap gap-2 text-2xs font-semibold uppercase tracking-wider">
                            <span className="rounded-lg bg-zinc-100 px-2 py-1 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400">
                              {college.courses.length} Courses
                            </span>
                            {topPlacement && (
                              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400">
                                Highest Package: {topPlacement.highestPackage} LPA
                              </span>
                            )}
                            {topPlacement && (
                              <span className="rounded-lg bg-indigo-50 px-2 py-1 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400">
                                Average Package: {topPlacement.averagePackage} LPA
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tuition Fees & Action Details */}
                        <div className="mt-6 pt-4 border-t border-zinc-150 flex items-center justify-between dark:border-zinc-800">
                          <div>
                            <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">
                              Average Tuition Fee
                            </span>
                            <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                              {formatCurrency(college.fees)} / Year
                            </span>
                          </div>
                          
                          <Link
                            href={`/colleges/${college.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-850 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                          >
                            Explore College
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                >
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${
                        page === pageNum
                          ? 'border-indigo-650 bg-indigo-50 text-indigo-650 dark:border-violet-500 dark:bg-violet-950/20 dark:text-violet-300'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={page === pagination.totalPages}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
