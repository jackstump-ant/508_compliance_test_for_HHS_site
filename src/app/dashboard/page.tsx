'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert } from '@trussworks/react-uswds';
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

interface ReviewData {
  pending: Review[];
  completed: Review[];
}

export default function DashboardPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const reviewData = await response.json();
        setData(reviewData);
      } catch {
        setError('Unable to load dashboard data.');
      }
    };

    fetchReviews();
    // Refresh every 30 seconds
    const interval = setInterval(fetchReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Alert type="error" headingLevel="h4" heading="Error">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center padding-y-6">
        <div className="usa-spinner" aria-label="Loading" />
        <p className="margin-top-2">Loading dashboard...</p>
      </div>
    );
  }

  const stats = {
    pending: data.pending.length,
    completed: data.completed.length,
    passRate: data.completed.length > 0
      ? Math.round(
          (data.completed.filter(r => r.finalDecision === 'approved').length /
            data.completed.length) *
            100
        )
      : 0,
    criticalPending: data.pending.filter(r => r.aiRecommendation === 'fail').length,
  };

  return (
    <div className="grid-row grid-gap">
      {/* Header */}
      <div className="grid-col-12">
        <h1 className="font-heading-xl margin-bottom-3">Reviewer Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid-col-12 margin-bottom-4">
        <div className="grid-row grid-gap">
          <div className="grid-col-6 tablet:grid-col-3">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__body text-center">
                  <p className="font-heading-3xl margin-0 text-primary">
                    {stats.pending}
                  </p>
                  <p className="margin-0 text-base">Pending Reviews</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid-col-6 tablet:grid-col-3">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__body text-center">
                  <p className="font-heading-3xl margin-0 text-error">
                    {stats.criticalPending}
                  </p>
                  <p className="margin-0 text-base">Flagged as Fail</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid-col-6 tablet:grid-col-3">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__body text-center">
                  <p className="font-heading-3xl margin-0 text-success">
                    {stats.completed}
                  </p>
                  <p className="margin-0 text-base">Completed</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid-col-6 tablet:grid-col-3">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__body text-center">
                  <p className="font-heading-3xl margin-0">
                    {stats.passRate}%
                  </p>
                  <p className="margin-0 text-base">Approval Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="grid-col-12 margin-bottom-4">
        <div className="display-flex flex-justify flex-align-center margin-bottom-2">
          <h2 className="margin-0">Pending Reviews</h2>
          <Link href="/dashboard/queue" className="usa-link">
            View all →
          </Link>
        </div>
        <ReviewQueue reviews={data.pending.slice(0, 5)} />
      </div>

      {/* Recent Completed */}
      <div className="grid-col-12">
        <div className="display-flex flex-justify flex-align-center margin-bottom-2">
          <h2 className="margin-0">Recently Completed</h2>
        </div>
        <ReviewQueue reviews={data.completed.slice(0, 5)} showCompleted />
      </div>
    </div>
  );
}
