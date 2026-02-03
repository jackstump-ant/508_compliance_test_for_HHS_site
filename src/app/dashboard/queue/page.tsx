'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Button } from '@trussworks/react-uswds';
import ReviewQueue from '@/components/dashboard/ReviewQueue';

interface Submission {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  submittedAt: string;
}

interface Review {
  id: string;
  submissionId: string;
  aiRecommendation: 'pass' | 'fail' | 'needs_review' | null;
  aiConfidence: number | null;
  finalDecision: string | null;
  reviewedAt: string | null;
  submission: Submission;
}

export default function QueuePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail' | 'needs_review'>('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews?status=pending');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch {
        setError('Unable to load review queue.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
    // Refresh every 30 seconds
    const interval = setInterval(fetchReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredReviews = () => {
    if (filter === 'all') return reviews;
    return reviews.filter(r => r.aiRecommendation === filter);
  };

  const filteredReviews = getFilteredReviews();

  const counts = {
    all: reviews.length,
    pass: reviews.filter(r => r.aiRecommendation === 'pass').length,
    fail: reviews.filter(r => r.aiRecommendation === 'fail').length,
    needs_review: reviews.filter(r => r.aiRecommendation === 'needs_review').length,
  };

  if (error) {
    return (
      <Alert type="error" headingLevel="h4" heading="Error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="grid-row grid-gap">
      {/* Header */}
      <div className="grid-col-12">
        <div className="display-flex flex-justify flex-align-center margin-bottom-2">
          <div>
            <Link href="/dashboard" className="usa-link font-sans-xs">
              ← Back to Dashboard
            </Link>
            <h1 className="font-heading-xl margin-top-1 margin-bottom-0">
              Review Queue
            </h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid-col-12 margin-bottom-3">
        <div className="display-flex flex-wrap gap-1">
          <Button
            type="button"
            outline={filter !== 'all'}
            onClick={() => setFilter('all')}
          >
            All ({counts.all})
          </Button>
          <Button
            type="button"
            outline={filter !== 'fail'}
            onClick={() => setFilter('fail')}
            className={filter === 'fail' ? 'bg-error' : ''}
          >
            Fail ({counts.fail})
          </Button>
          <Button
            type="button"
            outline={filter !== 'needs_review'}
            onClick={() => setFilter('needs_review')}
            className={filter === 'needs_review' ? 'bg-warning' : ''}
          >
            Needs Review ({counts.needs_review})
          </Button>
          <Button
            type="button"
            outline={filter !== 'pass'}
            onClick={() => setFilter('pass')}
            className={filter === 'pass' ? 'bg-success' : ''}
          >
            Pass ({counts.pass})
          </Button>
        </div>
      </div>

      {/* Queue */}
      <div className="grid-col-12">
        {isLoading ? (
          <div className="text-center padding-y-6">
            <div className="usa-spinner" aria-label="Loading" />
            <p className="margin-top-2">Loading queue...</p>
          </div>
        ) : (
          <ReviewQueue reviews={filteredReviews} />
        )}
      </div>

      {/* Empty state message */}
      {!isLoading && filteredReviews.length === 0 && reviews.length > 0 && (
        <div className="grid-col-12 margin-top-2">
          <Alert type="info" headingLevel="h4" slim>
            No reviews match the selected filter.
          </Alert>
        </div>
      )}
    </div>
  );
}
