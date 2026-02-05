'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Label, Textarea, Radio } from '@trussworks/react-uswds';
import ComplianceSummary from '@/components/results/ComplianceSummary';
import IssueCard from '@/components/results/IssueCard';

interface Finding {
  id: string;
  type: string;
  severity: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  location?: string;
  wcagCriterion?: string;
  wcagLevel?: string;
  section508Reference?: string;
}

interface Guidance {
  findingId: string;
  whatIsWrong: string;
  whyItMatters: string;
  howToFix: string[];
  wcagCriterion?: string;
}

interface ComplianceResult {
  overallAssessment: 'pass' | 'fail' | 'needs_review';
  confidence: number;
  summary: string;
  totalIssues: {
    critical: number;
    major: number;
    minor: number;
  };
  findings: Finding[];
}

interface GuidanceResult {
  guidance: Guidance[];
  priorityOrder: string[];
  estimatedEffort: string;
}

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
  findingsJson: string | null;
  guidanceJson: string | null;
  policyResult: string | null;
  finalDecision: string | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [decision, setDecision] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        // First get the review
        const reviewResponse = await fetch(`/api/reviews?id=${id}`);
        if (!reviewResponse.ok) {
          throw new Error('Review not found');
        }
        const reviewData: Review = await reviewResponse.json();
        setReview(reviewData);

        // Set form defaults if already reviewed
        if (reviewData.finalDecision) {
          setDecision(reviewData.finalDecision);
          setNotes(reviewData.reviewerNotes || '');
        }

        // Parse findings and guidance
        if (reviewData.findingsJson) {
          setCompliance(JSON.parse(reviewData.findingsJson));
        }
        if (reviewData.guidanceJson) {
          setGuidance(JSON.parse(reviewData.guidanceJson));
        }

        // Get submission details
        const submissionResponse = await fetch(`/api/submissions/${reviewData.submissionId}`);
        if (submissionResponse.ok) {
          const submissionData = await submissionResponse.json();
          setSubmission(submissionData);
        }
      } catch {
        setError('Unable to load review.');
      }
    };

    fetchReview();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!decision) {
      setError('Please select a decision.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: id,
          finalDecision: decision,
          reviewerNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Redirect back to dashboard
      router.push('/dashboard');
    } catch {
      setError('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getGuidanceForFinding = (findingId: string): Guidance | undefined => {
    return guidance?.guidance.find(g => g.findingId === findingId);
  };

  if (error && !review) {
    return (
      <div className="grid-row grid-gap">
        <div className="grid-col-12">
          <Alert type="error" headingLevel="h4" heading="Error">
            {error}
          </Alert>
          <Link href="/dashboard" className="usa-button margin-top-2">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!review || !compliance) {
    return (
      <div className="text-center padding-y-6">
        <div className="usa-spinner" aria-label="Loading" />
        <p className="margin-top-2">Loading review...</p>
      </div>
    );
  }

  const isAlreadyReviewed = !!review.finalDecision;

  return (
    <div className="grid-row grid-gap">
      {/* Header */}
      <div className="grid-col-12">
        <Link href="/dashboard/queue" className="usa-link font-sans-xs">
          ← Back to Queue
        </Link>
        <h1 className="font-heading-xl margin-top-1 margin-bottom-1">
          Review Submission
        </h1>
        {submission && (
          <p className="text-base margin-top-0">
            {submission.fileName} • Submitted{' '}
            {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Already reviewed notice */}
      {isAlreadyReviewed && (
        <div className="grid-col-12 margin-bottom-2">
          <Alert type="info" headingLevel="h4" heading="Review Complete">
            This submission was reviewed on{' '}
            {review.reviewedAt
              ? new Date(review.reviewedAt).toLocaleString()
              : 'an earlier date'}
            .
          </Alert>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="grid-col-12 margin-bottom-2">
          <Alert type="error" headingLevel="h4" heading="Error">
            {error}
          </Alert>
        </div>
      )}

      {/* Main content - two columns */}
      <div className="grid-col-12 desktop:grid-col-8">
        {/* Summary */}
        <div className="margin-bottom-3">
          <ComplianceSummary
            recommendation={compliance.overallAssessment}
            confidence={compliance.confidence}
            totalIssues={compliance.totalIssues}
            summary={compliance.summary}
          />
        </div>

        {/* Findings */}
        <div>
          <h2 className="margin-bottom-2">
            Findings ({compliance.findings.length})
          </h2>
          {compliance.findings.length === 0 ? (
            <Alert type="success" headingLevel="h4" slim>
              No accessibility issues found.
            </Alert>
          ) : (
            compliance.findings.map((finding, index) => (
              <IssueCard
                key={finding.id}
                finding={finding}
                guidance={getGuidanceForFinding(finding.id)}
                index={index}
              />
            ))
          )}
        </div>
      </div>

      {/* Review panel - sidebar */}
      <div className="grid-col-12 desktop:grid-col-4">
        <div className="usa-card position-sticky" style={{ top: '1rem' }}>
          <div className="usa-card__container">
            <div className="usa-card__header">
              <h2 className="usa-card__heading">
                {isAlreadyReviewed ? 'Review Decision' : 'Submit Review'}
              </h2>
            </div>
            <div className="usa-card__body">
              {/* AI Recommendation */}
              <div className="margin-bottom-3 padding-2 bg-base-lightest radius-md">
                <p className="margin-top-0 margin-bottom-05 font-sans-xs text-bold">
                  AI Recommendation
                </p>
                <p className="margin-0 font-heading-md">
                  {review.aiRecommendation === 'pass' && (
                    <span className="text-success">Pass</span>
                  )}
                  {review.aiRecommendation === 'fail' && (
                    <span className="text-error">Fail</span>
                  )}
                  {review.aiRecommendation === 'needs_review' && (
                    <span className="text-warning">Needs Review</span>
                  )}
                </p>
                <p className="margin-0 font-sans-xs">
                  Confidence: {Math.round((review.aiConfidence || 0) * 100)}%
                </p>
              </div>

              {/* Decision radio buttons */}
              <fieldset className="usa-fieldset margin-bottom-2">
                <legend className="usa-legend usa-legend--large">
                  Your Decision
                </legend>
                <Radio
                  id="decision-approved"
                  name="decision"
                  label="Approve - Document is compliant"
                  value="approved"
                  checked={decision === 'approved'}
                  onChange={(e) => setDecision(e.target.value)}
                  disabled={isAlreadyReviewed}
                />
                <Radio
                  id="decision-needs-remediation"
                  name="decision"
                  label="Needs Remediation - Issues must be fixed"
                  value="needs_remediation"
                  checked={decision === 'needs_remediation'}
                  onChange={(e) => setDecision(e.target.value)}
                  disabled={isAlreadyReviewed}
                />
                <Radio
                  id="decision-rejected"
                  name="decision"
                  label="Reject - Cannot be made compliant"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                  disabled={isAlreadyReviewed}
                />
              </fieldset>

              {/* Notes */}
              <Label htmlFor="reviewer-notes">Reviewer Notes (optional)</Label>
              <Textarea
                id="reviewer-notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isAlreadyReviewed}
                placeholder="Add any notes or instructions for the submitter..."
              />

              {/* Submit button */}
              {!isAlreadyReviewed && (
                <Button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !decision}
                  className="width-full margin-top-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              )}
            </div>

            {/* Links */}
            <div className="usa-card__footer">
              <Link
                href={`/results/${review.submissionId}`}
                className="usa-link"
              >
                View Full Results →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
