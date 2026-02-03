import Anthropic from '@anthropic-ai/sdk';
import {
  POLICY_EVALUATION_PROMPT,
  COMPLIANCE_ANALYSIS_PROMPT,
  GUIDANCE_GENERATION_PROMPT,
  createPolicyEvaluationMessages,
  createComplianceAnalysisMessages,
  createGuidanceGenerationMessages,
} from './prompts';
import { Finding, Guidance, PolicyResult } from '../db/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

interface PolicyEvaluationResponse {
  requiresReview: boolean;
  confidence: number;
  reason: string;
  documentType: string;
  isPublicFacing: boolean;
  hasComplexContent: boolean;
  complexContentTypes: string[];
}

interface ComplianceAnalysisResponse {
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

interface GuidanceResponse {
  guidance: Guidance[];
  priorityOrder: string[];
  estimatedEffort: string;
}

function parseJsonResponse<T>(text: string): T {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  return JSON.parse(jsonMatch[0]) as T;
}

export async function evaluatePolicy(
  documentContent: string,
  fileName: string,
  fileType: string
): Promise<PolicyEvaluationResponse> {
  const messages = createPolicyEvaluationMessages(documentContent, fileName, fileType);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: POLICY_EVALUATION_PROMPT,
    messages,
  });

  const textContent = response.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return parseJsonResponse<PolicyEvaluationResponse>(textContent.text);
}

export async function analyzeCompliance(
  documentContent: string,
  fileName: string,
  fileType: string
): Promise<ComplianceAnalysisResponse> {
  const messages = createComplianceAnalysisMessages(documentContent, fileName, fileType);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: COMPLIANCE_ANALYSIS_PROMPT,
    messages,
  });

  const textContent = response.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return parseJsonResponse<ComplianceAnalysisResponse>(textContent.text);
}

export async function generateGuidance(
  findings: Finding[],
  documentType: string
): Promise<GuidanceResponse> {
  const messages = createGuidanceGenerationMessages(JSON.stringify(findings, null, 2), documentType);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: GUIDANCE_GENERATION_PROMPT,
    messages,
  });

  const textContent = response.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return parseJsonResponse<GuidanceResponse>(textContent.text);
}

export async function performFullAnalysis(
  documentContent: string,
  fileName: string,
  fileType: string
): Promise<{
  policy: PolicyEvaluationResponse;
  compliance: ComplianceAnalysisResponse;
  guidance: GuidanceResponse | null;
}> {
  // Step 1: Policy Evaluation
  const policy = await evaluatePolicy(documentContent, fileName, fileType);

  // Step 2: Compliance Analysis
  const compliance = await analyzeCompliance(documentContent, fileName, fileType);

  // Step 3: Generate Guidance (only if issues found)
  let guidance: GuidanceResponse | null = null;
  if (compliance.findings.length > 0) {
    guidance = await generateGuidance(compliance.findings, fileType);
  }

  return { policy, compliance, guidance };
}

// Document content extraction utilities
export async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string> {
  const fs = await import('fs').then(m => m.promises);
  const path = await import('path');

  const extension = path.extname(filePath).toLowerCase();

  // For HTML files, read directly
  if (extension === '.html' || extension === '.htm') {
    return await fs.readFile(filePath, 'utf-8');
  }

  // For text files
  if (extension === '.txt') {
    return await fs.readFile(filePath, 'utf-8');
  }

  // For Word documents
  if (extension === '.docx') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch {
      // If mammoth fails, try to read as binary and note the type
      return `[Word Document: ${path.basename(filePath)}]\n\nNote: Full text extraction unavailable. Document requires manual review.`;
    }
  }

  // For PDF files - try basic extraction
  if (extension === '.pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = await import('pdf-parse') as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || `[PDF Document: ${path.basename(filePath)}]\n\nNote: Text extraction returned empty. Document may contain images only.`;
    } catch {
      return `[PDF Document: ${path.basename(filePath)}]\n\nNote: Text extraction failed. Document requires manual review.`;
    }
  }

  // For images, return a note about the image
  if (['.png', '.jpg', '.jpeg', '.gif'].includes(extension)) {
    return `[Image File: ${path.basename(filePath)}]\n\nThis is an image file. Key accessibility checks:\n- Does the image need alt text when used in documents?\n- Is the image used to convey information?\n- Would a text alternative be needed?`;
  }

  // For other file types, return a generic message
  return `[File: ${path.basename(filePath)}]\n\nFile type: ${fileType}\n\nNote: Automatic text extraction not available for this file type. Please provide the document content manually or use a supported format.`;
}
