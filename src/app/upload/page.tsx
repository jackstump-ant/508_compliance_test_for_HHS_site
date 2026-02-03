'use client';

import { useRouter } from 'next/navigation';
import DocumentUpload from '@/components/upload/DocumentUpload';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadComplete = (submissionId: string) => {
    // Redirect to status page to watch analysis progress
    router.push(`/status/${submissionId}`);
  };

  return (
    <div className="grid-row grid-gap">
      <div className="grid-col-12">
        <h1 className="font-heading-xl margin-bottom-2">
          Submit Document for 508 Review
        </h1>
        <p className="usa-intro">
          Upload your document to check for Section 508 accessibility compliance.
          Our AI-powered analysis will identify potential issues and provide
          guidance on how to fix them.
        </p>
      </div>

      <div className="grid-col-12 tablet:grid-col-8">
        <DocumentUpload onUploadComplete={handleUploadComplete} />
      </div>

      <div className="grid-col-12 tablet:grid-col-4">
        <div className="usa-summary-box" role="region" aria-labelledby="summary-box-key-information">
          <div className="usa-summary-box__body">
            <h3 className="usa-summary-box__heading" id="summary-box-key-information">
              About Section 508
            </h3>
            <div className="usa-summary-box__text">
              <p>
                Section 508 of the Rehabilitation Act requires federal agencies
                to make their electronic and information technology accessible
                to people with disabilities.
              </p>
              <ul className="usa-list">
                <li>Applies to all federal agencies</li>
                <li>Covers websites, documents, software, and hardware</li>
                <li>Based on WCAG 2.0 Level AA guidelines</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="margin-top-3">
          <h4>Supported File Types</h4>
          <ul className="usa-list">
            <li><strong>PDF</strong> - Portable Document Format</li>
            <li><strong>Word</strong> - .doc, .docx</li>
            <li><strong>Excel</strong> - .xls, .xlsx</li>
            <li><strong>PowerPoint</strong> - .ppt, .pptx</li>
            <li><strong>HTML</strong> - Web pages</li>
            <li><strong>Images</strong> - .png, .jpg, .gif</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
