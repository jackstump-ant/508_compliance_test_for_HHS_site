'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Alert } from '@trussworks/react-uswds';
import Link from 'next/link';

interface SubmissionStatus {
  id: string;
  fileName: string;
  fileType: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  submittedAt: string;
  review?: {
    aiRecommendation: string | null;
  };
}

const statusSteps = [
  { key: 'uploaded', label: 'Document Uploaded', description: 'Your file has been received' },
  { key: 'analyzing', label: 'AI Analysis', description: 'Checking for accessibility issues' },
  { key: 'completed', label: 'Review Complete', description: 'Results are ready' },
];

export default function StatusPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [submission, setSubmission] = useState<SubmissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/submissions/${id}`);
      if (!response.ok) {
        throw new Error('Submission not found');
      }
      const data = await response.json();
      setSubmission(data);

      // If status is pending, start analysis
      if (data.status === 'pending' && !isStartingAnalysis) {
        setIsStartingAnalysis(true);
        startAnalysis();
      }
    } catch {
      setError('Unable to find submission. Please check the ID and try again.');
    }
  }, [id, isStartingAnalysis]);

  const startAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status !== 409) { // 409 = already analyzing
          console.error('Analysis start error:', data.error);
        }
      }
    } catch (err) {
      console.error('Failed to start analysis:', err);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Poll for updates every 3 seconds while analyzing
    const interval = setInterval(() => {
      if (submission?.status === 'analyzing' || submission?.status === 'pending') {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStatus, submission?.status]);

  const getCurrentStep = () => {
    if (!submission) return 0;
    switch (submission.status) {
      case 'pending':
        return 0;
      case 'analyzing':
        return 1;
      case 'completed':
      case 'failed':
        return 2;
      default:
        return 0;
    }
  };

  if (error) {
    return (
      <div className="grid-row grid-gap">
        <div className="grid-col-12">
          <Alert type="error" headingLevel="h4" heading="Error">
            {error}
          </Alert>
          <div className="margin-top-3">
            <Link href="/upload" className="usa-button">
              Submit New Document
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="grid-row grid-gap">
        <div className="grid-col-12 text-center padding-y-6">
          <div className="usa-spinner" aria-label="Loading" />
          <p className="margin-top-2">Loading submission status...</p>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="grid-row grid-gap">
      <div className="grid-col-12">
        <h1 className="font-heading-xl margin-bottom-2">
          Submission Status
        </h1>
      </div>

      <div className="grid-col-12 tablet:grid-col-8">
        {/* File Info Card */}
        <div className="usa-card margin-bottom-3">
          <div className="usa-card__container">
            <div className="usa-card__body">
              <h2 className="usa-card__heading">{submission.fileName}</h2>
              <p className="text-base margin-bottom-0">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </p>
              <p className="text-base margin-bottom-0">
                ID: <code>{submission.id}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="usa-step-indicator" aria-label="Progress">
          <ol className="usa-step-indicator__segments">
            {statusSteps.map((step, index) => (
              <li
                key={step.key}
                className={`usa-step-indicator__segment ${
                  index < currentStep
                    ? 'usa-step-indicator__segment--complete'
                    : index === currentStep
                    ? 'usa-step-indicator__segment--current'
                    : ''
                }`}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                <span className="usa-step-indicator__segment-label">
                  {step.label}
                  {index < currentStep && <span className="usa-sr-only">completed</span>}
                  {index === currentStep && <span className="usa-sr-only">current</span>}
                  {index > currentStep && <span className="usa-sr-only">not completed</span>}
                </span>
              </li>
            ))}
          </ol>
          <div className="usa-step-indicator__header">
            <h3 className="usa-step-indicator__heading">
              <span className="usa-step-indicator__heading-counter">
                <span className="usa-sr-only">Step</span>
                <span className="usa-step-indicator__current-step">{currentStep + 1}</span>
                <span className="usa-step-indicator__total-steps">of {statusSteps.length}</span>
              </span>
              <span className="usa-step-indicator__heading-text">
                {statusSteps[currentStep]?.label}
              </span>
            </h3>
          </div>
        </div>

        {/* Status-specific content */}
        <div className="margin-top-4">
          {submission.status === 'analyzing' && (
            <div className="text-center padding-y-4">
              <div className="margin-bottom-2">
                <svg
                  className="usa-icon usa-icon--size-6"
                  aria-hidden="true"
                  style={{
                    animation: 'spin 2s linear infinite',
                    width: '48px',
                    height: '48px',
                    fill: '#005ea2'
                  }}
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="80 40"
                  />
                </svg>
              </div>
              <p className="font-sans-lg">
                Analyzing your document for accessibility issues...
              </p>
              <p className="text-base">
                This usually takes 30-60 seconds depending on document size.
              </p>
            </div>
          )}

          {submission.status === 'completed' && (
            <Alert type="success" headingLevel="h4" heading="Analysis Complete">
              <p>
                Your document has been analyzed. View the detailed results to see
                any accessibility issues found and guidance on how to fix them.
              </p>
              <Button
                type="button"
                onClick={() => router.push(`/results/${id}`)}
                className="margin-top-2"
              >
                View Results
              </Button>
            </Alert>
          )}

          {submission.status === 'failed' && (
            <Alert type="error" headingLevel="h4" heading="Analysis Failed">
              <p>
                We encountered an error while analyzing your document.
                This could be due to an unsupported file format or a temporary issue.
              </p>
              <div className="margin-top-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsStartingAnalysis(false);
                    startAnalysis();
                  }}
                  className="margin-right-2"
                >
                  Retry Analysis
                </Button>
                <Link href="/upload" className="usa-button usa-button--outline">
                  Upload Different File
                </Link>
              </div>
            </Alert>
          )}
        </div>
      </div>

      <div className="grid-col-12 tablet:grid-col-4">
        <div className="usa-summary-box" role="region" aria-labelledby="summary-box-status">
          <div className="usa-summary-box__body">
            <h3 className="usa-summary-box__heading" id="summary-box-status">
              What&apos;s happening?
            </h3>
            <div className="usa-summary-box__text">
              <p><strong>Step 1: Upload</strong></p>
              <p className="margin-top-0">Your document is securely stored.</p>

              <p><strong>Step 2: AI Analysis</strong></p>
              <p className="margin-top-0">
                Claude AI reviews your document against WCAG 2.2 and Section 508 standards.
              </p>

              <p><strong>Step 3: Results</strong></p>
              <p className="margin-top-0 margin-bottom-0">
                Get detailed findings with plain-language guidance on how to fix issues.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
