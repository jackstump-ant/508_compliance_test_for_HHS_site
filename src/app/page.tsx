import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid-row grid-gap">
      {/* Hero Section */}
      <div className="grid-col-12 margin-bottom-5">
        <div className="usa-hero padding-y-5" style={{ backgroundColor: '#005ea2' }}>
          <div className="grid-row grid-gap flex-align-center">
            <div className="grid-col-12 tablet:grid-col-8">
              <h1 className="usa-hero__heading text-white font-heading-2xl">
                Section 508 Compliance Review
              </h1>
              <p className="usa-hero__tagline text-white font-sans-lg margin-bottom-3">
                AI-powered accessibility analysis for government documents.
                Get instant feedback and clear guidance to make your documents
                accessible to everyone.
              </p>
              <div className="display-flex flex-wrap gap-2">
                <Link href="/upload" className="usa-button usa-button--big usa-button--secondary">
                  Submit Document for Review
                </Link>
                <Link href="/dashboard" className="usa-button usa-button--big usa-button--outline usa-button--inverse">
                  Reviewer Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="grid-col-12 margin-bottom-5">
        <h2 className="font-heading-xl margin-bottom-3">How It Works</h2>
        <div className="grid-row grid-gap">
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <span className="display-inline-block bg-primary text-white padding-1 radius-full font-heading-lg width-5 height-5 text-center margin-bottom-1">
                    1
                  </span>
                  <h3 className="usa-card__heading">Upload Your Document</h3>
                </div>
                <div className="usa-card__body">
                  <p>
                    Submit PDF, Word, Excel, PowerPoint, HTML files, or images.
                    Drag and drop or browse to select your file.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <span className="display-inline-block bg-primary text-white padding-1 radius-full font-heading-lg width-5 height-5 text-center margin-bottom-1">
                    2
                  </span>
                  <h3 className="usa-card__heading">AI Analysis</h3>
                </div>
                <div className="usa-card__body">
                  <p>
                    Claude AI analyzes your document against WCAG 2.2 and
                    Section 508 standards, identifying accessibility issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="usa-card height-full">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <span className="display-inline-block bg-primary text-white padding-1 radius-full font-heading-lg width-5 height-5 text-center margin-bottom-1">
                    3
                  </span>
                  <h3 className="usa-card__heading">Get Guidance</h3>
                </div>
                <div className="usa-card__body">
                  <p>
                    Receive plain-language explanations of issues with
                    step-by-step instructions on how to fix them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid-col-12 margin-bottom-5">
        <h2 className="font-heading-xl margin-bottom-3">Features</h2>
        <div className="grid-row grid-gap">
          <div className="grid-col-12 tablet:grid-col-6">
            <ul className="usa-list">
              <li>
                <strong>Policy Evaluation</strong> - Automatically determines if
                your document requires 508 review
              </li>
              <li>
                <strong>Comprehensive Analysis</strong> - Checks images, tables,
                headings, links, color contrast, and more
              </li>
              <li>
                <strong>HTML/Web Support</strong> - Analyzes web content for
                semantic HTML, ARIA, keyboard accessibility
              </li>
              <li>
                <strong>Severity Ratings</strong> - Issues classified as
                Critical, Major, or Minor
              </li>
            </ul>
          </div>
          <div className="grid-col-12 tablet:grid-col-6">
            <ul className="usa-list">
              <li>
                <strong>Plain Language Guidance</strong> - Clear, actionable
                instructions anyone can follow
              </li>
              <li>
                <strong>Regulatory Citations</strong> - WCAG 2.2 criteria and
                Section 508 references for each issue
              </li>
              <li>
                <strong>Human Review Workflow</strong> - Reviewers can accept or
                override AI recommendations
              </li>
              <li>
                <strong>Audit Trail</strong> - Complete record of submissions
                and decisions
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What We Check */}
      <div className="grid-col-12 margin-bottom-5">
        <h2 className="font-heading-xl margin-bottom-3">What We Check</h2>
        <div className="grid-row grid-gap">
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="padding-2 border-1px border-base-light radius-md height-full">
              <h3 className="font-heading-md margin-top-0">Images & Graphics</h3>
              <p className="margin-bottom-0">
                Alt text presence and quality, decorative image handling
              </p>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="padding-2 border-1px border-base-light radius-md height-full">
              <h3 className="font-heading-md margin-top-0">Document Structure</h3>
              <p className="margin-bottom-0">
                Heading hierarchy, reading order, list formatting
              </p>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="padding-2 border-1px border-base-light radius-md height-full">
              <h3 className="font-heading-md margin-top-0">Tables</h3>
              <p className="margin-bottom-0">
                Header cells, scope attributes, logical structure
              </p>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="padding-2 border-1px border-base-light radius-md height-full">
              <h3 className="font-heading-md margin-top-0">Links</h3>
              <p className="margin-bottom-0">
                Descriptive link text, distinguishable from body text
              </p>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="padding-2 border-1px border-base-light radius-md height-full">
              <h3 className="font-heading-md margin-top-0">Color & Contrast</h3>
              <p className="margin-bottom-0">
                Sufficient contrast ratios, information not conveyed by color alone
              </p>
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-4">
            <div className="padding-2 border-1px border-base-light radius-md height-full">
              <h3 className="font-heading-md margin-top-0">Forms & Interactivity</h3>
              <p className="margin-bottom-0">
                Labels, error messages, keyboard accessibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="grid-col-12">
        <div className="bg-base-lightest padding-4 radius-md text-center">
          <h2 className="font-heading-xl margin-top-0">Ready to Get Started?</h2>
          <p className="font-sans-lg margin-bottom-3">
            Submit your document now and get instant accessibility feedback.
          </p>
          <Link href="/upload" className="usa-button usa-button--big">
            Submit Document for Review
          </Link>
        </div>
      </div>
    </div>
  );
}
