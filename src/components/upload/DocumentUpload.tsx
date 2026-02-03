'use client';

import React, { useCallback, useState } from 'react';
import { Button, Alert } from '@trussworks/react-uswds';

interface DocumentUploadProps {
  onUploadComplete: (submissionId: string) => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'text/html',
  'image/png',
  'image/jpeg',
  'image/gif',
];

const ACCEPTED_EXTENSIONS = [
  '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.html', '.htm',
  '.png', '.jpg', '.jpeg', '.gif'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum allowed (50MB). Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return `File type not supported. Accepted types: ${ACCEPTED_EXTENSIONS.join(', ')}`;
    }

    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadProgress(100);
      const data = await response.json();
      onUploadComplete(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '(PDF)';
      case 'docx':
      case 'doc':
        return '(Word)';
      case 'xlsx':
      case 'xls':
        return '(Excel)';
      case 'pptx':
      case 'ppt':
        return '(PowerPoint)';
      case 'html':
      case 'htm':
        return '(HTML)';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '(Image)';
      default:
        return '';
    }
  };

  return (
    <div className="document-upload">
      {error && (
        <Alert type="error" headingLevel="h4" heading="Upload Error" className="margin-bottom-2">
          {error}
        </Alert>
      )}

      {!file ? (
        <div
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Drop zone for file upload"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('file-input')?.click();
            }
          }}
        >
          <div className="margin-bottom-2">
            <svg
              className="usa-icon usa-icon--size-5"
              aria-hidden="true"
              role="img"
              style={{ width: '48px', height: '48px', fill: '#71767a' }}
            >
              <use xlinkHref="/assets/uswds/img/sprite.svg#upload_file"></use>
            </svg>
          </div>
          <p className="font-sans-lg text-bold margin-bottom-1">
            Drag and drop your document here
          </p>
          <p className="text-base margin-bottom-2">
            or click to browse files
          </p>
          <p className="text-base-dark font-sans-xs">
            Supported formats: PDF, Word, Excel, PowerPoint, HTML, Images
          </p>
          <p className="text-base-dark font-sans-xs">
            Maximum file size: 50MB
          </p>
          <input
            type="file"
            id="file-input"
            className="usa-sr-only"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            aria-describedby="file-input-hint"
          />
          <label htmlFor="file-input" className="usa-button margin-top-2">
            Browse Files
          </label>
        </div>
      ) : (
        <div className="drop-zone has-file">
          <div className="display-flex flex-align-center flex-justify-center gap-2">
            <div>
              <p className="font-sans-lg text-bold margin-bottom-05">
                {file.name} {getFileIcon(file.name)}
              </p>
              <p className="text-base margin-bottom-0">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {isUploading ? (
            <div className="margin-top-2">
              <div className="usa-progress" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                <div className="usa-progress__bar">
                  <div
                    className="usa-progress__bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-center margin-top-1">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          ) : (
            <div className="margin-top-2 display-flex gap-2 flex-justify-center">
              <Button type="button" onClick={handleUpload}>
                Submit for Review
              </Button>
              <Button type="button" outline onClick={handleRemoveFile}>
                Remove File
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="margin-top-3 padding-2 bg-base-lightest border-1px border-base-light radius-md">
        <h4 className="margin-top-0 margin-bottom-1">What happens next?</h4>
        <ol className="usa-list margin-bottom-0">
          <li>Your document will be analyzed for Section 508 compliance</li>
          <li>AI will identify potential accessibility issues</li>
          <li>You&apos;ll receive detailed guidance on how to fix any issues</li>
          <li>A human reviewer will verify the results</li>
        </ol>
      </div>
    </div>
  );
}
