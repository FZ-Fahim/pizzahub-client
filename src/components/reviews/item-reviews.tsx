'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { reviewApi } from '@/lib/api';
import { Review, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Send,
} from 'lucide-react';

interface ItemReviewsProps {
  itemId: string;
  itemName: string;
}

const DEMO_REVIEWS: Review[] = [
  {
    _id: 'rev_1',
    itemId: 'm_1',
    customerId: {
      _id: 'c_1',
      name: 'Sofia Rossi',
      email: 'sofia@example.com',
      role: 'customer',
      isBlocked: false,
      subscriptionPlan: 'free',
    },
    rating: 5,
    comment:
      'The crust fermentation on this pizza is phenomenal! Light, airy, blistered cornicione with authentic San Marzano acidity. Easily the best pie in the city.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'rev_2',
    itemId: 'm_1',
    customerId: {
      _id: 'c_2',
      name: 'David Miller',
      email: 'david@example.com',
      role: 'customer',
      isBlocked: false,
      subscriptionPlan: 'free',
    },
    rating: 5,
    comment:
      'Arrived steaming hot. The buffalo mozzarella had that incredible fresh milky stretch. Will definitely order from this pizzaiolo again!',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export function ItemReviews({ itemId, itemName }: ItemReviewsProps) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [averageRating, setAverageRating] = useState<number>(4.9);

  // Form states
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);
        if (isMongoId) {
          const res = await reviewApi.getItemReviews(itemId);
          if (res?.data) {
            setReviews(res.data);
            if (res.averageRating) setAverageRating(res.averageRating);
          }
        } else {
          // Check local storage for mock reviews
          let localList: Review[] = [];
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(`pizzahub_reviews_${itemId}`);
            if (raw) localList = JSON.parse(raw);
          }
          const combined = [...localList, ...DEMO_REVIEWS];
          setReviews(combined);
          if (combined.length > 0) {
            const avg =
              combined.reduce((sum, r) => sum + r.rating, 0) / combined.length;
            setAverageRating(Number(avg.toFixed(1)));
          }
        }
      } catch {
        setReviews(DEMO_REVIEWS);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [itemId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setFeedback({
        type: 'error',
        text: 'Please sign in to your customer account to submit a review.',
      });
      return;
    }

    if (user?.role !== 'customer') {
      setFeedback({
        type: 'error',
        text: 'Only customers who enjoy pizzas can write tasting reviews.',
      });
      return;
    }

    if (!comment.trim() || comment.trim().length < 8) {
      setFeedback({
        type: 'error',
        text: 'Please write a review with at least 8 characters.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);

    try {
      let newRev: Review;

      if (isMongoId) {
        const res = await reviewApi.createReview({
          itemId,
          rating: selectedRating,
          comment: comment.trim(),
        });
        newRev = res.data;
      } else {
        await new Promise((r) => setTimeout(r, 600));
        newRev = {
          _id: 'rev_' + Math.random().toString(36).substring(2, 9),
          itemId,
          customerId: user,
          rating: selectedRating,
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
        };

        // Cache in local storage
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem(`pizzahub_reviews_${itemId}`);
          const list: Review[] = raw ? JSON.parse(raw) : [];
          list.unshift(newRev);
          localStorage.setItem(`pizzahub_reviews_${itemId}`, JSON.stringify(list));
        }
      }

      setReviews((prev) => [newRev, ...prev]);
      setComment('');
      setFeedback({
        type: 'success',
        text: 'Thank you! Your tasting review has been recorded.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
      {/* Reviews Header & Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pizza-orange" />
            Artisanal Tasting Reviews
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real feedback from connoisseurs who enjoyed this wood-fired creation.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-zinc-300 dark:text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            {averageRating}
          </span>
          <span className="text-xs text-zinc-400">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Write a Review Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Leave Your Tasting Verdict
          </h3>
          <span className="text-xs text-zinc-400">Crafted for {itemName}</span>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                feedback.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-[11px] font-semibold underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Interactive Star Rating Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
              Your Rating:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-zinc-300 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || selectedRating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-2">
                {selectedRating === 5
                  ? 'Perfezione! (5/5)'
                  : selectedRating === 4
                  ? 'Delizioso (4/5)'
                  : selectedRating === 3
                  ? 'Buono (3/5)'
                  : 'Average (2/5)'}
              </span>
            </div>
          </div>

          {/* Comment input */}
          <div className="space-y-1.5">
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the crust crispness, cheese melt, sourdough aroma, and overall dining satisfaction..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs focus:ring-2 focus:ring-pizza-orange/30 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-zinc-400">
              {!isAuthenticated
                ? 'Sign in as a customer to post your review.'
                : user?.role !== 'customer'
                ? 'Only customer accounts can post reviews.'
                : 'Verified review will appear immediately.'}
            </p>

            <Button
              type="submit"
              disabled={isSubmitting || !isAuthenticated || user?.role !== 'customer'}
              className="h-9 px-4 rounded-xl bg-pizza-red hover:bg-pizza-red/90 text-white font-semibold text-xs gap-1.5 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Review</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => {
          const cust = typeof rev.customerId === 'object' ? rev.customerId : null;
          const reviewerName = cust?.name || 'Pizza Connoisseur';

          return (
            <div
              key={rev._id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pizza-orange/10 text-pizza-red font-bold text-xs flex items-center justify-center shrink-0">
                    {reviewerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {reviewerName}
                    </h4>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ItemReviews;
