'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Button } from '@trussworks/react-uswds';
import Link from 'next/link';
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
  exampleBefore?: string;
  exampleAfter?: string;
  wcagCitation?: {
    criterion: string;
    name: string;
    level: string;
    text: string;
  };
  section508Reference?: {
    provision: string;
    text: string;
  };
  resources?: {
    title: string;
    url: string;
  }[];
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

interface PolicyResult {
  requiresReview: boolean;
  reason: string;
  documentType: string;
  isPublicFacing: boolean;
  hasComplexContent: boolean;
}

interface SubmissionWithReview {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  submittedAt: string;
  review?: {
    id: string;
    aiRecommendation: string | null;
    aiConfidence: number | null;
    findingsJson: string | null;
    guidanceJson: string | null;
    policyResult: string | null;
    finalDecision: string | null;
    reviewerNotes: string | null;
    reviewedAt: string | null;
  };
}

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;

  const [submission, setSubmission] = useState<SubmissionWithReview | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [guidance, setGuidance] = useState<GuidanceResult | null>(null);
  const [policy, setPolicy] = useState<PolicyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'major' | 'minor'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/submissions/${id}`);
        if (!response.ok) {
          throw new Error('Submission not found');
        }
        const data: SubmissionWithReview = await response.json();
        setSubmission(data);

        if (data.status !== 'completed' || !data.review) {
          setError('Analysis not yet complete. Please check the status page.');
          return;
        }

        // Parse JSON fields
        if (data.review.findingsJson) {
          setCompliance(JSON.parse(data.review.findingsJson));
        }
        if (data.review.guidanceJson) {
          setGuidance(JSON.parse(data.review.guidanceJson));
        }
        if (data.review.policyResult) {
          setPolicy(JSON.parse(data.review.policyResult));
        }
      } catch {
        setError('Unable to load results. Please try again.');
      }
    };

    fetchResults();
  }, [id]);

  const getGuidanceForFinding = (findingId: string): Guidance | undefined => {
    return guidance?.guidance.find(g => g.findingId === findingId);
  };

  const getFilteredFindings = (): Finding[] => {
    if (!compliance) return [];
    if (filter === 'all') return compliance.findings;
    return compliance.findings.filter(f => f.severity === filter);
  };

  if (error) {
    return (
      <div className="grid-row grid-gap">
        <div className="grid-col-12">
          <Alert type="error" headingLevel="h4" heading="Error">
            {error}
          </Alert>
          <div className="margin-top-3">
            <Link href={`/status/${id}`} className="usa-button">
              Check Status
            </Link>
            <Link href="/upload" className="usa-button usa-button--outline margin-left-2">
              Submit New Document
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!submission || !compliance) {
    return (
      <div className="grid-row grid-gap">
        <div className="grid-col-12 text-center padding-y-6">
          <div className="usa-spinner" aria-label="Loading" />
          <p className="margin-top-2">Loading results...</p>
        </div>
      </div>
    );
  }

  const filteredFindings = getFilteredFindings();

  return (
    <div className="grid-row grid-gap">
      {/* Header */}
      <div className="grid-col-12">
        <div className="display-flex flex-justify flex-align-center margin-bottom-2">
          <div>
            <h1 className="font-heading-xl margin-bottom-05">
              Compliance Results
            </h1>
            <p className="text-base margin-top-0">
              {submission.fileName}
            </p>
          </div>
          <div>
            <Link href="/upload" className="usa-button usa-button--outline">
              New Submission
            </Link>
          </div>
        </div>
      </div>

      {/* Human Review Status */}
      {submission.review?.finalDecision && (
        <div className="grid-col-12 margin-bottom-2">
          <Alert
            type={
              submission.review.finalDecision === 'approved'
                ? 'success'
                : submission.review.finalDecision === 'rejected'
                ? 'error'
                : 'warning'
            }
            headingLevel="h4"
            heading={`Human Review: ${
              submission.review.finalDecision === 'approved'
                ? 'Approved'
                : submission.review.finalDecision === 'rejected'
                ? 'Rejected'
                : 'Needs Remediation'
            }`}
          >
            {submission.review.reviewerNotes && (
              <p className="margin-bottom-0">
                <strong>Reviewer Notes:</strong> {submission.review.reviewerNotes}
              </p>
            )}
            {submission.review.reviewedAt && (
              <p className="margin-bottom-0 font-sans-xs text-base-dark margin-top-1">
                Reviewed on {new Date(submission.review.reviewedAt).toLocaleString()}
              </p>
            )}
          </Alert>
        </div>
      )}

      {/* Summary Card */}
      <div className="grid-col-12 margin-bottom-3">
        <ComplianceSummary
          recommendation={compliance.overallAssessment}
          confidence={compliance.confidence}
          totalIssues={compliance.totalIssues}
          summary={compliance.summary}
        />
      </div>

      {/* Policy Evaluation */}
      {policy && (
        <div className="grid-col-12 margin-bottom-3">
          <div className="usa-card">
            <div className="usa-card__container">
              <div className="usa-card__header">
                <h2 className="usa-card__heading">Policy Evaluation</h2>
              </div>
              <div className="usa-card__body">
                <div className="grid-row grid-gap">
                  <div className="grid-col-12 tablet:grid-col-6">
                    <p className="margin-top-0">
                      <strong>Requires 508 Review:</strong>{' '}
                      <span className={policy.requiresReview ? 'text-error' : 'text-success'}>
                        {policy.requiresReview ? 'Yes' : 'No'}
                      </span>
                    </p>
                    <p>
                      <strong>Document Type:</strong> {policy.documentType}
                    </p>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-6">
                    <p className="margin-top-0">
                      <strong>Public-Facing:</strong>{' '}
                      {policy.isPublicFacing ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <strong>Complex Content:</strong>{' '}
                      {policy.hasComplexContent ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                <p className="margin-bottom-0">
                  <strong>Reason:</strong> {policy.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Findings Section */}
      <div className="grid-col-12">
        <div className="display-flex flex-justify flex-align-center margin-bottom-2">
          <h2 className="margin-0">Findings</h2>
          {guidance?.estimatedEffort && (
            <p className="margin-0 text-base">
              <strong>Estimated Effort:</strong> {guidance.estimatedEffort}
            </p>
          )}
        </div>

        {/* Filter buttons */}
        {compliance.findings.length > 0 && (
          <div className="margin-bottom-2">
            <Button
              type="button"
              outline={filter !== 'all'}
              onClick={() => setFilter('all')}
              className="margin-right-1"
            >
              All ({compliance.findings.length})
            </Button>
            <Button
              type="button"
              outline={filter !== 'critical'}
              onClick={() => setFilter('critical')}
              className="margin-right-1"
            >
              Critical ({compliance.totalIssues.critical})
            </Button>
            <Button
              type="button"
              outline={filter !== 'major'}
              onClick={() => setFilter('major')}
              className="margin-right-1"
            >
              Major ({compliance.totalIssues.major})
            </Button>
            <Button
              type="button"
              outline={filter !== 'minor'}
              onClick={() => setFilter('minor')}
            >
              Minor ({compliance.totalIssues.minor})
            </Button>
          </div>
        )}

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <Alert type="success" headingLevel="h4" heading="No issues found!" slim>
            {filter === 'all'
              ? 'Your document passed all accessibility checks.'
              : `No ${filter} issues found.`}
          </Alert>
        ) : (
          <div>
            {filteredFindings.map((finding, index) => (
              <IssueCard
                key={finding.id}
                finding={finding}
                guidance={getGuidanceForFinding(finding.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid-col-12 margin-top-4 padding-top-2 border-top-1px border-base-light">
        <div className="display-flex flex-justify">
          <div>
            <Link href={`/status/${id}`} className="usa-button usa-button--outline">
              Back to Status
            </Link>
          </div>
          <div>
            {!submission.review?.finalDecision && (
              <Link href={`/dashboard/review/${submission.review?.id}`} className="usa-button">
                Submit for Human Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
