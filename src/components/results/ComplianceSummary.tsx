'use client';

import React from 'react';

interface ComplianceSummaryProps {
  recommendation: 'pass' | 'fail' | 'needs_review' | null;
  confidence: number | null;
  totalIssues: {
    critical: number;
    major: number;
    minor: number;
  };
  summary: string;
}

export default function ComplianceSummary({
  recommendation,
  confidence,
  totalIssues,
  summary,
}: ComplianceSummaryProps) {
  const getStatusColor = () => {
    switch (recommendation) {
      case 'pass':
        return { bg: 'bg-success-lighter', border: 'border-success', text: 'text-success-darker' };
      case 'fail':
        return { bg: 'bg-error-lighter', border: 'border-error', text: 'text-error-darker' };
      case 'needs_review':
        return { bg: 'bg-warning-lighter', border: 'border-warning', text: 'text-warning-darker' };
      default:
        return { bg: 'bg-base-lightest', border: 'border-base', text: 'text-base-darkest' };
    }
  };

  const getStatusLabel = () => {
    switch (recommendation) {
      case 'pass':
        return 'Compliant';
      case 'fail':
        return 'Non-Compliant';
      case 'needs_review':
        return 'Needs Human Review';
      default:
        return 'Unknown';
    }
  };

  const getConfidenceLevel = () => {
    if (!confidence) return { label: 'Unknown', class: 'low' };
    if (confidence >= 0.8) return { label: 'High', class: 'high' };
    if (confidence >= 0.5) return { label: 'Medium', class: 'medium' };
    return { label: 'Low', class: 'low' };
  };

  const colors = getStatusColor();
  const confidenceLevel = getConfidenceLevel();
  const totalIssueCount = totalIssues.critical + totalIssues.major + totalIssues.minor;

  return (
    <div className={`usa-card ${colors.bg} border-left-2 ${colors.border}`}>
      <div className="usa-card__container">
        <div className="usa-card__body">
          <div className="grid-row grid-gap">
            {/* Status Badge */}
            <div className="grid-col-12 tablet:grid-col-4">
              <div className="text-center tablet:text-left">
                <p className="text-base margin-bottom-05">AI Recommendation</p>
                <p className={`font-heading-xl margin-top-0 ${colors.text}`}>
                  {getStatusLabel()}
                </p>
                <div className="confidence-meter">
                  <span className="text-base">Confidence:</span>
                  <div className="confidence-bar">
                    <div
                      className={`confidence-fill ${confidenceLevel.class}`}
                      style={{ width: `${(confidence || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-bold">{confidenceLevel.label}</span>
                </div>
              </div>
            </div>

            {/* Issue Counts */}
            <div className="grid-col-12 tablet:grid-col-4">
              <div className="text-center">
                <p className="text-base margin-bottom-1">Issues Found</p>
                <div className="display-flex flex-justify-center gap-3">
                  <div className="text-center">
                    <span
                      className="display-inline-block padding-1 radius-md severity-critical font-heading-lg"
                      style={{ minWidth: '48px' }}
                    >
                      {totalIssues.critical}
                    </span>
                    <p className="margin-top-05 margin-bottom-0 font-sans-xs">Critical</p>
                  </div>
                  <div className="text-center">
                    <span
                      className="display-inline-block padding-1 radius-md severity-major font-heading-lg"
                      style={{ minWidth: '48px' }}
                    >
                      {totalIssues.major}
                    </span>
                    <p className="margin-top-05 margin-bottom-0 font-sans-xs">Major</p>
                  </div>
                  <div className="text-center">
                    <span
                      className="display-inline-block padding-1 radius-md severity-minor font-heading-lg"
                      style={{ minWidth: '48px' }}
                    >
                      {totalIssues.minor}
                    </span>
                    <p className="margin-top-05 margin-bottom-0 font-sans-xs">Minor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="grid-col-12 tablet:grid-col-4">
              <div className="text-center tablet:text-right">
                <p className="text-base margin-bottom-05">Total Issues</p>
                <p className="font-heading-3xl margin-top-0 margin-bottom-0">
                  {totalIssueCount}
                </p>
                <p className="text-base margin-top-0">
                  {totalIssueCount === 0
                    ? 'No issues detected'
                    : totalIssueCount === 1
                    ? '1 issue requires attention'
                    : `${totalIssueCount} issues require attention`}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-top-1px border-base-light padding-top-2 margin-top-2">
            <p className="margin-bottom-0">
              <strong>Summary:</strong> {summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
