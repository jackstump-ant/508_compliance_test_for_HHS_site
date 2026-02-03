import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createTablesSQL, Submission, Review, User } from './schema';

// Database singleton
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'compliance.db');
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    // Initialize tables
    db.exec(createTablesSQL);
  }
  return db;
}

// User operations
export function createUser(email: string, name: string, role: 'submitter' | 'reviewer' | 'admin' = 'submitter'): User {
  const db = getDb();
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, role)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, email, name, role);
  return getUserById(id)!;
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | null;
}

// Submission operations
export function createSubmission(data: {
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  submitterId?: string;
}): Submission {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO submissions (id, submitterId, fileName, fileType, filePath, fileSize, submittedAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.submitterId || null, data.fileName, data.fileType, data.filePath, data.fileSize, now, now);
  return getSubmissionById(id)!;
}

export function getSubmissionById(id: string): Submission | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = stmt.get(id) as any;
  if (row) {
    // SQLite stores booleans as integers
    row.requiresReview = row.requiresReview === 1 ? true : row.requiresReview === 0 ? false : null;
    return row as Submission;
  }
  return null;
}

export function updateSubmission(id: string, data: Partial<Pick<Submission, 'status' | 'requiresReview'>>): Submission | null {
  const db = getDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.requiresReview !== undefined) {
    updates.push('requiresReview = ?');
    values.push(data.requiresReview === null ? null : data.requiresReview ? 1 : 0);
  }

  updates.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const stmt = db.prepare(`UPDATE submissions SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getSubmissionById(id);
}

export function getAllSubmissions(): Submission[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM submissions ORDER BY submittedAt DESC');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = stmt.all() as any[];
  return rows.map(row => ({
    ...row,
    requiresReview: row.requiresReview === 1 ? true : row.requiresReview === 0 ? false : null
  } as Submission));
}

export function getSubmissionsByStatus(status: Submission['status']): Submission[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY submittedAt DESC');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = stmt.all(status) as any[];
  return rows.map(row => ({
    ...row,
    requiresReview: row.requiresReview === 1 ? true : row.requiresReview === 0 ? false : null
  } as Submission));
}

// Review operations
export function createReview(submissionId: string): Review {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO reviews (id, submissionId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, submissionId, now, now);
  return getReviewById(id)!;
}

export function getReviewById(id: string): Review | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM reviews WHERE id = ?');
  return stmt.get(id) as Review | null;
}

export function getReviewBySubmissionId(submissionId: string): Review | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM reviews WHERE submissionId = ?');
  return stmt.get(submissionId) as Review | null;
}

export function updateReview(id: string, data: Partial<Omit<Review, 'id' | 'submissionId' | 'createdAt'>>): Review | null {
  const db = getDb();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  const fields: (keyof typeof data)[] = [
    'aiRecommendation', 'aiConfidence', 'findingsJson', 'guidanceJson',
    'policyResult', 'finalDecision', 'reviewerId', 'reviewerNotes', 'reviewedAt'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field] as string | number | null);
    }
  }

  if (updates.length === 0) return getReviewById(id);

  updates.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const stmt = db.prepare(`UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getReviewById(id);
}

export function getPendingReviews(): (Review & { submission: Submission })[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT r.*, s.fileName, s.fileType, s.filePath, s.fileSize, s.status as submissionStatus,
           s.submittedAt, s.submitterId
    FROM reviews r
    JOIN submissions s ON r.submissionId = s.id
    WHERE r.finalDecision IS NULL
    ORDER BY s.submittedAt ASC
  `);
  const rows = stmt.all() as (Review & {
    fileName: string;
    fileType: string;
    filePath: string;
    fileSize: number;
    submissionStatus: string;
    submittedAt: string;
    submitterId: string | null;
  })[];

  return rows.map(row => ({
    id: row.id,
    submissionId: row.submissionId,
    aiRecommendation: row.aiRecommendation,
    aiConfidence: row.aiConfidence,
    findingsJson: row.findingsJson,
    guidanceJson: row.guidanceJson,
    policyResult: row.policyResult,
    finalDecision: row.finalDecision,
    reviewerId: row.reviewerId,
    reviewerNotes: row.reviewerNotes,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    submission: {
      id: row.submissionId,
      submitterId: row.submitterId,
      fileName: row.fileName,
      fileType: row.fileType,
      filePath: row.filePath,
      fileSize: row.fileSize,
      status: row.submissionStatus as Submission['status'],
      requiresReview: null,
      submittedAt: row.submittedAt,
      updatedAt: row.updatedAt
    }
  }));
}

export function getCompletedReviews(): (Review & { submission: Submission })[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT r.*, s.fileName, s.fileType, s.filePath, s.fileSize, s.status as submissionStatus,
           s.submittedAt, s.submitterId
    FROM reviews r
    JOIN submissions s ON r.submissionId = s.id
    WHERE r.finalDecision IS NOT NULL
    ORDER BY r.reviewedAt DESC
  `);
  const rows = stmt.all() as (Review & {
    fileName: string;
    fileType: string;
    filePath: string;
    fileSize: number;
    submissionStatus: string;
    submittedAt: string;
    submitterId: string | null;
  })[];

  return rows.map(row => ({
    id: row.id,
    submissionId: row.submissionId,
    aiRecommendation: row.aiRecommendation,
    aiConfidence: row.aiConfidence,
    findingsJson: row.findingsJson,
    guidanceJson: row.guidanceJson,
    policyResult: row.policyResult,
    finalDecision: row.finalDecision,
    reviewerId: row.reviewerId,
    reviewerNotes: row.reviewerNotes,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    submission: {
      id: row.submissionId,
      submitterId: row.submitterId,
      fileName: row.fileName,
      fileType: row.fileType,
      filePath: row.filePath,
      fileSize: row.fileSize,
      status: row.submissionStatus as Submission['status'],
      requiresReview: null,
      submittedAt: row.submittedAt,
      updatedAt: row.updatedAt
    }
  }));
}

// Initialize default reviewer user for demo
export function ensureDefaultReviewer(): User {
  const existing = getUserByEmail('reviewer@agency.gov');
  if (existing) return existing;
  return createUser('reviewer@agency.gov', 'Default Reviewer', 'reviewer');
}
