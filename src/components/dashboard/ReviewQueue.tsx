'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@trussworks/react-uswds';

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

interface ReviewQueueProps {
  reviews: Review[];
  showCompleted?: boolean;
}

export default function ReviewQueue({ reviews, showCompleted = false }: ReviewQueueProps) {
  const getRecommendationBadge = (recommendation: string | null) => {
    switch (recommendation) {
      case 'pass':
        return <span className="usa-tag bg-success text-white">Pass</span>;
      case 'fail':
        return <span className="usa-tag bg-error text-white">Fail</span>;
      case 'needs_review':
        return <span className="usa-tag bg-warning text-ink">Needs Review</span>;
      default:
        return <span className="usa-tag bg-base-lighter">Pending</span>;
    }
  };

  const getConfidenceDisplay = (confidence: number | null) => {
    if (confidence === null) return '-';
    const percent = Math.round(confidence * 100);
    let colorClass = 'text-error';
    if (percent >= 80) colorClass = 'text-success';
    else if (percent >= 50) colorClass = 'text-warning';
    return <span className={colorClass}>{percent}%</span>;
  };

  const getDecisionBadge = (decision: string | null) => {
    switch (decision) {
      case 'approved':
        return <span className="usa-tag bg-success text-white">Approved</span>;
      case 'rejected':
        return <span className="usa-tag bg-error text-white">Rejected</span>;
      case 'needs_remediation':
        return <span className="usa-tag bg-warning text-ink">Needs Remediation</span>;
      default:
        return <span className="usa-tag bg-base-lighter">Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('doc')) return 'DOC';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'XLS';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PPT';
    if (fileType.includes('html')) return 'HTML';
    if (fileType.includes('image')) return 'IMG';
    return 'FILE';
  };

  if (reviews.length === 0) {
    return (
      <div className="padding-4 text-center bg-base-lightest border-1px border-base-light radius-md">
        <p className="margin-0 text-base">
          {showCompleted
            ? 'No completed reviews yet.'
            : 'No documents pending review.'}
        </p>
      </div>
    );
  }

  return (
    <div className="usa-table-container--scrollable" tabIndex={0}>
      <table className="usa-table usa-table--borderless width-full review-queue-table">
        <thead>
          <tr>
            <th scope="col">Document</th>
            <th scope="col">Type</th>
            <th scope="col">Submitted</th>
            <th scope="col">AI Recommendation</th>
            <th scope="col">Confidence</th>
            {showCompleted && <th scope="col">Final Decision</th>}
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>
                <div>
                  <strong>{review.submission.fileName}</strong>
                  <br />
                  <code className="font-mono-3xs text-base-dark">
                    {review.submissionId.slice(0, 8)}...
                  </code>
                </div>
              </td>
              <td>
                <span className="usa-tag bg-base-lighter text-base-dark">
                  {getFileTypeIcon(review.submission.fileType)}
                </span>
              </td>
              <td>{formatDate(review.submission.submittedAt)}</td>
              <td>{getRecommendationBadge(review.aiRecommendation)}</td>
              <td>{getConfidenceDisplay(review.aiConfidence)}</td>
              {showCompleted && <td>{getDecisionBadge(review.finalDecision)}</td>}
              <td>
                <Link href={`/dashboard/review/${review.id}`}>
                  <Button type="button" outline className="padding-y-05 padding-x-1">
                    {showCompleted ? 'View' : 'Review'}
                  </Button>
                </Link>
                <Link href={`/results/${review.submissionId}`} className="margin-left-1">
                  <Button type="button" unstyled className="text-primary font-sans-xs">
                    Results
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
