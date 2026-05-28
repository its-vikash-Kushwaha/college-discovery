'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

function CompareWorkspace() {
  const { toggleSave, savedIds } = useAuth();
  const searchParams = useSearchParams();
  const initialAddId = searchParams.get('add');

  // Comparison Slots (Supports up to 3 colleges)
  const [comparedColleges, setComparedColleges] = useState<Array<College | null>>([null, null, null]);
  
  // Search Autocomplete State per slot
  const [searchQueries, setSearchQueries] = useState<string[]>(['', '', '']);
  const [searchResults, setSearchResults] = useState<College[][]>([[], [], []]);
  const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load college if 'add' parameter is in URL
  useEffect(() => {
    if (initialAddId) {
      async function loadInitialCollege() {
        try {
          const res = await fetch(`/api/colleges/${initialAddId}`);
          if (res.ok) {
            const data = await res.json();
            setComparedColleges((prev) => {
              const next = [...prev];
              next[0] = data.college;
              return next;
            });
          }
        } catch (err) {
          console.error('Load initial college error:', err);
        }
      }
      loadInitialCollege();
    }
  }, [initialAddId]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveSearchSlot(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle autocomplete search typing
  const handleSearchChange = (slotIndex: number, query: string) => {
    const nextQueries = [...searchQueries];
    nextQueries[slotIndex] = query;
    setSearchQueries(nextQueries);
    setActiveSearchSlot(slotIndex);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      const nextResults = [...searchResults];
      nextResults[slotIndex] = [];
      setSearchResults(nextResults);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?query=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const nextResults = [...searchResults];
          nextResults[slotIndex] = data.colleges;
          setSearchResults(nextResults);
        }
      } catch (err) {
        console.error('Autocomplete search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectCollege = (slotIndex: number, college: College) => {
    // Prevent adding the same college multiple times
    if (comparedColleges.some((c) => c?.id === college.id)) {
      alert('This college is already added to comparison');
      setActiveSearchSlot(null);
      return;
    }

    setComparedColleges((prev) => {
      const next = [...prev];
      next[slotIndex] = college;
      return next;
    });

    const nextQueries = [...searchQueries];
    nextQueries[slotIndex] = '';
    setSearchQueries(nextQueries);
    
    const nextResults = [...searchResults];
    nextResults[slotIndex] = [];
    setSearchResults(nextResults);
    
    setActiveSearchSlot(null);
  };

  const handleRemoveCollege = (slotIndex: number) => {
    setComparedColleges((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  // Aggregation/Extraction helpers
  const getPlacementStats = (college: College | null, year: number) => {
    if (!college) return '—';
    const record = college.placements.find((p) => p.year === year);
    if (!record) return 'N/A';
    return `Avg: ${record.averagePackage} LPA | Max: ${record.highestPackage} LPA`;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh / Year`;
    }
    return `₹${amount.toLocaleString('en-IN')} / Year`;
  };

  return (
    <div ref={containerRef} className="flex-1 bg-zinc-50 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-3xl font-black text-zinc-950 dark:text-white">Compare Colleges</h1>
          <p className="mt-2 text-sm text-zinc-550 dark:text-zinc-450">
            Select up to 3 colleges side-by-side to aggregate and analyze fees, placements, and courses.
          </p>
        </div>

        {/* Slot Autocomplete Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map((slotIndex) => {
            const college = comparedColleges[slotIndex];
            
            return (
              <div
                key={slotIndex}
                className="relative rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
              >
                {college ? (
                  // Populated slot layout
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 font-bold dark:bg-violet-950/20 dark:text-violet-300">
                        🎓
                      </div>
                      <div className="max-w-[160px] sm:max-w-none">
                        <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block">
                          Slot {slotIndex + 1}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-1 dark:text-white">
                          {college.name}
                        </h4>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveCollege(slotIndex)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-650 dark:hover:bg-zinc-800"
                      title="Clear slot"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  // Empty search slot layout
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                      Slot {slotIndex + 1} — Select College
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQueries[slotIndex]}
                        onChange={(e) => handleSearchChange(slotIndex, e.target.value)}
                        onFocus={() => setActiveSearchSlot(slotIndex)}
                        placeholder="Search & add college..."
                        className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-violet-500"
                      />
                      
                      {/* Search results autocomplete dropdown */}
                      {activeSearchSlot === slotIndex && searchQueries[slotIndex] && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border border-zinc-200 bg-white shadow-lg p-2 dark:border-zinc-800 dark:bg-zinc-900">
                          {searching ? (
                            <div className="text-center py-4 text-2xs text-zinc-400">Searching matches...</div>
                          ) : searchResults[slotIndex].length === 0 ? (
                            <div className="text-center py-4 text-2xs text-zinc-400">No colleges matched</div>
                          ) : (
                            <div className="space-y-1">
                              {searchResults[slotIndex].map((match) => (
                                <button
                                  key={match.id}
                                  onClick={() => handleSelectCollege(slotIndex, match)}
                                  className="w-full text-left rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-955 dark:text-zinc-300 dark:hover:bg-zinc-850 dark:hover:text-white"
                                >
                                  {match.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Matrix Comparison Table */}
        {comparedColleges.filter(Boolean).length === 0 ? (
          // Empty State Prompt
          <div className="bg-white border border-zinc-200 rounded-3xl p-16 text-center dark:bg-zinc-900 dark:border-zinc-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mx-auto h-16 w-16 text-indigo-600/80 dark:text-violet-400/85"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Workspace is empty</h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
              Choose colleges in the search slots above to compare fees, placement timeline trends, and courses.
            </p>
          </div>
        ) : (
          // Comparison Table Grid Frame
          <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                  <th className="w-1/4 px-6 py-6 font-bold text-zinc-500 dark:text-zinc-400">Comparing</th>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <th key={slotIndex} className="w-1/4 px-6 py-6 border-l border-zinc-200 dark:border-zinc-800">
                        {college ? (
                          <div className="space-y-3">
                            <h3 className="text-sm font-black text-zinc-950 leading-tight dark:text-white line-clamp-2">
                              {college.name}
                            </h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleSave(college.id)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-2xs font-bold border transition-all ${
                                  savedIds.includes(college.id)
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                                    : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-800'
                                }`}
                              >
                                ★ Watchlist
                              </button>
                              <Link
                                href={`/colleges/${college.id}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-2xs font-bold text-indigo-750 hover:bg-indigo-100 dark:bg-violet-950/20 dark:border-violet-900/30 dark:text-violet-300"
                              >
                                Detail Page
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-zinc-400 italic">Empty Slot</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-350">
                {/* 1. Location */}
                <tr className="hover:bg-zinc-50/20">
                  <td className="px-6 py-5 font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Location</td>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <td key={slotIndex} className="px-6 py-5 border-l border-zinc-200 dark:border-zinc-800">
                        {college ? `${college.location}, ${college.state}` : '—'}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Rating */}
                <tr className="hover:bg-zinc-50/20">
                  <td className="px-6 py-5 font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Overall Rating</td>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <td key={slotIndex} className="px-6 py-5 border-l border-zinc-200 dark:border-zinc-800">
                        {college ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                            ★ {college.rating.toFixed(1)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Tuition fees */}
                <tr className="hover:bg-zinc-50/20">
                  <td className="px-6 py-5 font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Tuition Fees</td>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <td key={slotIndex} className="px-6 py-5 border-l border-zinc-200 dark:border-zinc-800 font-extrabold text-zinc-950 dark:text-white">
                        {college ? formatCurrency(college.fees) : '—'}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Placements 2025 */}
                <tr className="hover:bg-zinc-50/20">
                  <td className="px-6 py-5 font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Placements (2025)</td>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <td key={slotIndex} className="px-6 py-5 border-l border-zinc-200 dark:border-zinc-800">
                        {college ? (
                          <div className="space-y-1">
                            {college.placements.find((p) => p.year === 2025) ? (
                              <>
                                <p>Average: <span className="font-extrabold text-zinc-950 dark:text-white">{college.placements.find((p) => p.year === 2025)?.averagePackage} LPA</span></p>
                                <p>Highest: <span className="font-extrabold text-emerald-650">{college.placements.find((p) => p.year === 2025)?.highestPackage} LPA</span></p>
                              </>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Placements 2024 */}
                <tr className="hover:bg-zinc-50/20">
                  <td className="px-6 py-5 font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Placements (2024)</td>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <td key={slotIndex} className="px-6 py-5 border-l border-zinc-200 dark:border-zinc-800">
                        {college ? (
                          <div className="space-y-1">
                            {college.placements.find((p) => p.year === 2024) ? (
                              <>
                                <p>Average: <span className="font-extrabold text-zinc-950 dark:text-white">{college.placements.find((p) => p.year === 2024)?.averagePackage} LPA</span></p>
                                <p>Highest: <span className="font-extrabold text-emerald-650">{college.placements.find((p) => p.year === 2024)?.highestPackage} LPA</span></p>
                              </>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Courses List */}
                <tr className="hover:bg-zinc-50/20">
                  <td className="px-6 py-5 font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Available Courses</td>
                  {[0, 1, 2].map((slotIndex) => {
                    const college = comparedColleges[slotIndex];
                    return (
                      <td key={slotIndex} className="px-6 py-5 border-l border-zinc-200 dark:border-zinc-800">
                        {college ? (
                          <ul className="list-disc list-inside space-y-1 max-w-[200px]">
                            {college.courses.map((course) => (
                              <li key={course.id} className="truncate" title={course.name}>
                                {course.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-zinc-50 py-12 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-250 border-t-indigo-600 dark:border-zinc-800 dark:border-t-violet-400" />
        <span className="mt-4 text-xs font-semibold text-zinc-550 dark:text-zinc-450">Loading comparison workspace...</span>
      </div>
    }>
      <CompareWorkspace />
    </Suspense>
  );
}
