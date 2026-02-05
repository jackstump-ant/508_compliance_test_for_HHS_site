// Database schema definitions and types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'submitter' | 'reviewer' | 'admin';
  createdAt: string;
}

export interface Submission {
  id: string;
  submitterId: string | null;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  requiresReview: boolean | null;
  submittedAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  submissionId: string;
  aiRecommendation: 'pass' | 'fail' | 'needs_review' | null;
  aiConfidence: number | null;
  findingsJson: string | null;
  guidanceJson: string | null;
  policyResult: string | null;
  finalDecision: 'approved' | 'rejected' | 'needs_remediation' | null;
  reviewerId: string | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Parsed types for JSON fields
export interface Finding {
  id: string;
  type: string;
  severity: 'critical' | 'major' | 'minor';
  title: string;
  description: string;
  location?: string;
  wcagCriterion?: string;
  section508Reference?: string;
}

export interface Guidance {
  findingId: string;
  whatIsWrong: string;
  whyItMatters: string;
  howToFix: string[];
  wcagCriterion: string;
}

export interface PolicyResult {
  requiresReview: boolean;
  reason: string;
  documentType: string;
  isPublicFacing: boolean;
  hasComplexContent: boolean;
}

// SQL schema creation
export const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'submitter' CHECK(role IN ('submitter', 'reviewer', 'admin')),
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    submitterId TEXT,
    fileName TEXT NOT NULL,
    fileType TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'analyzing', 'completed', 'failed')),
    requiresReview INTEGER,
    submittedAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (submitterId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    submissionId TEXT UNIQUE NOT NULL,
    aiRecommendation TEXT CHECK(aiRecommendation IN ('pass', 'fail', 'needs_review')),
    aiConfidence REAL,
    findingsJson TEXT,
    guidanceJson TEXT,
    policyResult TEXT,
    finalDecision TEXT CHECK(finalDecision IN ('approved', 'rejected', 'needs_remediation')),
    reviewerId TEXT,
    reviewerNotes TEXT,
    reviewedAt TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (submissionId) REFERENCES submissions(id),
    FOREIGN KEY (reviewerId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
  CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON submissions(submitterId);
  CREATE INDEX IF NOT EXISTS idx_reviews_submission ON reviews(submissionId);
`;
