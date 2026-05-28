'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string } | null;
}

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
  courses: Course[];
  placements: Placement[];
  reviews: Review[];
}

export default function CollegeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toggleSave, savedIds, user } = useAuth();
  
  const [college, setCollege] = useState<College | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchCollegeDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/colleges/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCollege(data.college);
        setIsSaved(data.isSaved);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Fetch college details error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCollegeDetails();
  }, [fetchCollegeDetails]);

  // Keep saved status in sync with global Auth context watchlist state
  useEffect(() => {
    if (college) {
      setIsSaved(savedIds.includes(college.id));
    }
  }, [savedIds, college]);

  const handleToggleWatchlist = async () => {
    if (!college) return;
    const result = await toggleSave(college.id);
    setIsSaved(result);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    
    if (!user) {
      router.push(`/login?redirect=/colleges/${id}`);
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Review comment cannot be empty');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/colleges/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (res.ok) {
        // Clear modal state
        setReviewComment('');
        setReviewRating(5);
        setIsReviewModalOpen(false);
        // Refresh local details to reflect new review and recalculated rating
        await fetchCollegeDetails();
      } else {
        setReviewError(data.error || 'Submission failed');
      }
    } catch (err) {
      setReviewError('A network error occurred. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-50 py-12 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-250 border-t-indigo-600 dark:border-zinc-800 dark:border-t-violet-400" />
        <span className="mt-4 text-xs font-semibold text-zinc-550 dark:text-zinc-450">Loading college profile...</span>
      </div>
    );
  }

  if (!college) return null;

  const topPlacement = college.placements[0];

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 pb-24">
      {/* Banner / Header Frame */}
      <div className="relative h-64 sm:h-96 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        {college.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={college.bannerUrl} alt={college.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-violet-600 to-indigo-650" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Breadcrumb / Back Navigation */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-black/45 border border-white/10 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-black/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back to Catalog
          </Link>
        </div>

        {/* Watchlist Bookmark Button */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleToggleWatchlist}
            className={`inline-flex items-center gap-1.5 rounded-xl backdrop-blur-md px-4 py-2 text-xs font-extrabold shadow-sm border transition-all ${
              isSaved
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20'
                : 'bg-black/45 border-white/10 text-white hover:bg-black/60'
            }`}
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
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
            {isSaved ? 'Saved in Watchlist' : 'Add to Watchlist'}
          </button>
        </div>

        {/* Floating Titles */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/60 backdrop-blur-md px-2.5 py-1 text-2xs font-bold uppercase tracking-wider text-white">
                  📍 {college.location}, {college.state}
                </span>
                <h1 className="mt-3 text-2xl font-black text-white sm:text-4xl leading-tight">
                  {college.name}
                </h1>
              </div>

              {/* High-level Relational Figures */}
              <div className="flex gap-4">
                <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3 text-white">
                  <span className="block text-3xs font-semibold uppercase tracking-wider opacity-75">
                    Overall Rating
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xl font-black">
                    <span className="text-yellow-400">★</span>
                    {college.rating.toFixed(1)}
                  </span>
                </div>
                {topPlacement && (
                  <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3 text-white">
                    <span className="block text-3xs font-semibold uppercase tracking-wider opacity-75">
                      Avg Placement
                    </span>
                    <span className="mt-1 text-xl font-black text-emerald-400">
                      {topPlacement.averagePackage} LPA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Tabs Content Frame */}
      <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Relational Data Subsections */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs List Headers */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white rounded-2xl p-1.5 shadow-sm dark:bg-zinc-900 border dark:border-zinc-800">
              {([
                { id: 'overview', name: 'Overview' },
                { id: 'courses', name: 'Courses & Fees' },
                { id: 'placements', name: 'Placements Timeline' },
                { id: 'reviews', name: 'Reviews' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-850'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Render Active Tab Body */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">About the Institute</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-650 dark:text-zinc-400">
                    {college.overview}
                  </p>

                  <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                    Key Features & Highlights
                  </h3>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-zinc-150 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white">Strategic Location</h4>
                      <p className="mt-1 text-2xs text-zinc-550 dark:text-zinc-450">
                        Conveniently located in {college.location}, a robust hub providing rich corporate exposure.
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-150 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white">Academic Competence</h4>
                      <p className="mt-1 text-2xs text-zinc-550 dark:text-zinc-450">
                        Offers {college.courses.length} specialized undergraduate and postgraduate courses.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Courses */}
              {activeTab === 'courses' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Courses & Fees</h2>
                  <p className="mt-2 text-xs text-zinc-550 dark:text-zinc-450">
                    Detailed schedule of tuition fees and semesters for available degrees.
                  </p>

                  <div className="mt-6 overflow-hidden rounded-xl border border-zinc-150 dark:border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-2xs font-bold uppercase tracking-wider text-zinc-550 border-b border-zinc-150 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800">
                        <tr>
                          <th className="px-6 py-4">Course Name</th>
                          <th className="px-6 py-4">Duration</th>
                          <th className="px-6 py-4 text-right">Annual Fees</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                        {college.courses.map((course) => (
                          <tr key={course.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-955/20">
                            <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                              {course.name}
                            </td>
                            <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">
                              {course.duration} Years
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-zinc-950 dark:text-white">
                              {formatCurrency(course.fees)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Placements */}
              {activeTab === 'placements' && (
                <div>
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Placement Metrics</h2>
                  <p className="mt-2 text-xs text-zinc-550 dark:text-zinc-450">
                    Timeline statistics tracking highest and average package (Lakhs per Annum).
                  </p>

                  {college.placements.length === 0 ? (
                    <p className="mt-6 text-sm text-zinc-500">Placement timeline data is not currently available.</p>
                  ) : (
                    <div className="mt-8 space-y-8">
                      {/* Premium Visual Packages Chart */}
                      <div className="space-y-4">
                        {college.placements.map((record) => (
                          <div key={record.id} className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-zinc-900 dark:text-white">Year {record.year}</span>
                              <span className="text-zinc-550 dark:text-zinc-450">
                                Max: <span className="text-emerald-650">{record.highestPackage} LPA</span> | Avg:{' '}
                                <span className="text-indigo-650 dark:text-violet-400">{record.averagePackage} LPA</span>
                              </span>
                            </div>
                            
                            {/* Visual Bars Container */}
                            <div className="space-y-1.5">
                              {/* Highest package bar */}
                              <div className="h-6 w-full rounded-lg bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex">
                                <div
                                  style={{ width: `${Math.min(record.highestPackage * 0.65, 100)}%` }}
                                  className="h-full rounded-r-lg bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"
                                />
                                <span className="ml-2 text-3xs font-extrabold text-zinc-450 self-center">
                                  Highest Package
                                </span>
                              </div>
                              {/* Average package bar */}
                              <div className="h-6 w-full rounded-lg bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex">
                                <div
                                  style={{ width: `${Math.min(record.averagePackage * 0.65, 100)}%` }}
                                  className="h-full rounded-r-lg bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm"
                                />
                                <span className="ml-2 text-3xs font-extrabold text-zinc-450 self-center">
                                  Average Package
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Packages Details List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {college.placements.map((record) => (
                          <div
                            key={record.id}
                            className="rounded-xl border border-zinc-150 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20"
                          >
                            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              Placements Batch {record.year}
                            </h4>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-3xs text-zinc-450 dark:text-zinc-500 uppercase block">
                                  Highest
                                </span>
                                <span className="text-lg font-black text-emerald-650 dark:text-emerald-400">
                                  {record.highestPackage} LPA
                                </span>
                              </div>
                              <div>
                                <span className="text-3xs text-zinc-450 dark:text-zinc-500 uppercase block">
                                  Average
                                </span>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">
                                  {record.averagePackage} LPA
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Reviews */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Student Reviews</h2>
                      <p className="mt-1 text-xs text-zinc-550 dark:text-zinc-450">
                        Honest peer-to-peer feedback and star ratings.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (user) {
                          setIsReviewModalOpen(true);
                        } else {
                          router.push(`/login?redirect=/colleges/${id}`);
                        }
                      }}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 px-4 py-2.5 text-xs font-bold text-white hover:brightness-105"
                    >
                      Write Review
                    </button>
                  </div>

                  {/* List of reviews */}
                  {college.reviews.length === 0 ? (
                    <div className="mt-8 text-center border border-dashed border-zinc-200 rounded-xl p-8 dark:border-dashed dark:border-zinc-800">
                      <p className="text-xs font-medium text-zinc-500">
                        No reviews have been written for this college yet. Be the first to add yours!
                      </p>
                    </div>
                  ) : (
                    <div className="mt-8 space-y-6">
                      {college.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-zinc-150 pb-6 last:border-0 last:pb-0 dark:border-zinc-800"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                {review.user?.name || 'Anonymous Peer'}
                              </span>
                              <span className="ml-2 text-2xs text-zinc-400">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            
                            {/* Star badge */}
                            <div className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-750 dark:bg-violet-950/40 dark:text-violet-300">
                              <span>★</span>
                              <span>{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-xs leading-6 text-zinc-650 dark:text-zinc-400">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Dynamic Sidebars */}
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                Annual Average Fees
              </h3>
              <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
                {formatCurrency(college.fees)}
              </p>
              <span className="mt-1 text-3xs text-zinc-450 block">
                Calculated as average across standard degree courses.
              </span>

              <div className="mt-6 border-t border-zinc-150 pt-6 space-y-4 dark:border-zinc-800">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Courses Count</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{college.courses.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Location</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{college.location}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">State</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{college.state}</span>
                </div>
              </div>

              {/* Compare Quick Trigger */}
              <div className="mt-8">
                <Link
                  href={`/compare?add=${college.id}`}
                  className="flex w-full justify-center items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/70 py-3 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Compare College
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Write Review Modal Frame */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setReviewComment('');
                setReviewError('');
                setIsReviewModalOpen(false);
              }}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Submit Your Feedback</h3>
            <p className="mt-1 text-xs text-zinc-550 dark:text-zinc-450">
              Provide your review for <span className="font-semibold">{college.name}</span>.
            </p>

            {reviewError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-650 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                {reviewError}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleReviewSubmit}>
              {/* Star selector */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Rating Selection
                </label>
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => setReviewRating(starNum)}
                      className={`text-xl transition-all ${
                        reviewRating >= starNum ? 'text-amber-500' : 'text-zinc-200 dark:text-zinc-800'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Text comment */}
              <div>
                <label htmlFor="comment" className="block text-2xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Written Feedback
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-xs text-zinc-900 shadow-inner outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-violet-500 dark:focus:bg-zinc-955"
                  placeholder="Share your experience regarding campus facilities, course syllabus, and placement opportunities..."
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => {
                    setReviewComment('');
                    setReviewError('');
                    setIsReviewModalOpen(false);
                  }}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-350 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 px-5 py-2.5 text-xs font-bold text-white hover:brightness-105 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
