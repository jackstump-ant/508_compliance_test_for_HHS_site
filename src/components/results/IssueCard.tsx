'use client';

import React, { useState } from 'react';
import { Button } from '@trussworks/react-uswds';

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

interface IssueCardProps {
  finding: Finding;
  guidance?: Guidance;
  index: number;
}

export default function IssueCard({ finding, guidance, index }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityLabel = () => {
    switch (finding.severity) {
      case 'critical':
        return 'Critical';
      case 'major':
        return 'Major';
      case 'minor':
        return 'Minor';
      default:
        return 'Unknown';
    }
  };

  const getSeverityIcon = () => {
    switch (finding.severity) {
      case 'critical':
        return '!';
      case 'major':
        return '!';
      case 'minor':
        return 'i';
      default:
        return '?';
    }
  };

  return (
    <div className={`finding-card ${finding.severity}`}>
      <div className="grid-row grid-gap flex-align-start">
        {/* Severity Badge */}
        <div className="grid-col-auto">
          <div
            className={`severity-${finding.severity} display-flex flex-align-center flex-justify-center radius-full font-heading-lg`}
            style={{ width: '40px', height: '40px' }}
            aria-label={`${getSeverityLabel()} severity`}
          >
            {getSeverityIcon()}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid-col-fill">
          <div className="display-flex flex-justify flex-align-start">
            <div>
              <span className={`usa-tag severity-${finding.severity} margin-right-1`}>
                {getSeverityLabel()}
              </span>
              <span className="usa-tag bg-base-lighter text-base-dark">
                {finding.type}
              </span>
              {finding.wcagCriterion && (
                <span className="usa-tag bg-primary-lighter text-primary-darker margin-left-1">
                  WCAG {finding.wcagCriterion}
                </span>
              )}
            </div>
            <span className="text-base font-sans-xs">#{index + 1}</span>
          </div>

          <h3 className="margin-top-1 margin-bottom-1 font-heading-md">
            {finding.title}
          </h3>

          <p className="text-base margin-bottom-1">{finding.description}</p>

          {finding.location && (
            <p className="text-base-dark font-sans-xs margin-bottom-1">
              <strong>Location:</strong> {finding.location}
            </p>
          )}

          {/* Expand/Collapse for guidance */}
          {guidance && (
            <>
              <Button
                type="button"
                unstyled
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary margin-top-1"
                aria-expanded={isExpanded}
                aria-controls={`guidance-${finding.id}`}
              >
                {isExpanded ? '− Hide remediation guidance' : '+ Show remediation guidance'}
              </Button>

              {isExpanded && (
                <div
                  id={`guidance-${finding.id}`}
                  className="margin-top-2 padding-2 bg-base-lightest border-1px border-base-light radius-md"
                >
                  {/* What's Wrong */}
                  <div className="margin-bottom-2">
                    <h4 className="margin-top-0 margin-bottom-05 text-error-dark">
                      What&apos;s Wrong
                    </h4>
                    <p className="margin-top-0">{guidance.whatIsWrong}</p>
                  </div>

                  {/* Why It Matters */}
                  <div className="margin-bottom-2">
                    <h4 className="margin-top-0 margin-bottom-05 text-warning-dark">
                      Why It Matters
                    </h4>
                    <p className="margin-top-0">{guidance.whyItMatters}</p>
                  </div>

                  {/* How to Fix */}
                  <div className="margin-bottom-2">
                    <h4 className="margin-top-0 margin-bottom-05 text-success-dark">
                      How to Fix
                    </h4>
                    <ol className="usa-list margin-top-0">
                      {guidance.howToFix.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Examples */}
                  {(guidance.exampleBefore || guidance.exampleAfter) && (
                    <div className="margin-bottom-2">
                      <h4 className="margin-top-0 margin-bottom-1">Examples</h4>
                      <div className="grid-row grid-gap">
                        {guidance.exampleBefore && (
                          <div className="grid-col-12 tablet:grid-col-6">
                            <div className="padding-1 bg-error-lighter border-1px border-error-light radius-md">
                              <p className="margin-0 font-sans-xs text-bold text-error-dark">Before (Incorrect):</p>
                              <code className="font-mono-xs">{guidance.exampleBefore}</code>
                            </div>
                          </div>
                        )}
                        {guidance.exampleAfter && (
                          <div className="grid-col-12 tablet:grid-col-6">
                            <div className="padding-1 bg-success-lighter border-1px border-success-light radius-md">
                              <p className="margin-0 font-sans-xs text-bold text-success-dark">After (Correct):</p>
                              <code className="font-mono-xs">{guidance.exampleAfter}</code>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Citations */}
                  <div className="padding-top-2 border-top-1px border-base-light">
                    <h4 className="margin-top-0 margin-bottom-1">Regulatory References</h4>
                    <div className="grid-row grid-gap">
                      {guidance.wcagCitation && (
                        <div className="grid-col-12 tablet:grid-col-6">
                          <p className="margin-top-0 margin-bottom-05">
                            <strong>WCAG 2.2</strong>
                          </p>
                          <p className="margin-top-0 font-sans-xs">
                            <span className="text-bold">{guidance.wcagCitation.criterion}</span>
                            {' - '}{guidance.wcagCitation.name}
                            {' '}(Level {guidance.wcagCitation.level})
                          </p>
                          <p className="margin-top-0 font-sans-xs text-base-dark">
                            {guidance.wcagCitation.text}
                          </p>
                        </div>
                      )}
                      {guidance.section508Reference && (
                        <div className="grid-col-12 tablet:grid-col-6">
                          <p className="margin-top-0 margin-bottom-05">
                            <strong>Section 508</strong>
                          </p>
                          <p className="margin-top-0 font-sans-xs">
                            <span className="text-bold">{guidance.section508Reference.provision}</span>
                          </p>
                          <p className="margin-top-0 font-sans-xs text-base-dark">
                            {guidance.section508Reference.text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resources */}
                  {guidance.resources && guidance.resources.length > 0 && (
                    <div className="padding-top-2 border-top-1px border-base-light margin-top-2">
                      <h4 className="margin-top-0 margin-bottom-1">Helpful Resources</h4>
                      <ul className="usa-list margin-top-0">
                        {guidance.resources.map((resource, i) => (
                          <li key={i}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="usa-link"
                            >
                              {resource.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
