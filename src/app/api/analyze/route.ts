import { NextRequest, NextResponse } from 'next/server';
import {
  getSubmissionById,
  updateSubmission,
  createReview,
  updateReview,
  getReviewBySubmissionId,
} from '@/lib/db';
import {
  performFullAnalysis,
  extractTextFromFile,
} from '@/lib/claude/analyzer';

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId is required' },
        { status: 400 }
      );
    }

    // Get submission
    const submission = getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if already analyzing or completed
    if (submission.status === 'analyzing') {
      return NextResponse.json(
        { error: 'Analysis already in progress' },
        { status: 409 }
      );
    }

    // Update status to analyzing
    updateSubmission(submissionId, { status: 'analyzing' });

    // Create review record if doesn't exist
    let review = getReviewBySubmissionId(submissionId);
    if (!review) {
      review = createReview(submissionId);
    }

    try {
      // Extract text content from file
      const documentContent = await extractTextFromFile(
        submission.filePath,
        submission.fileType
      );

      // Perform AI analysis
      const analysisResult = await performFullAnalysis(
        documentContent,
        submission.fileName,
        submission.fileType
      );

      // Update review with results
      updateReview(review.id, {
        policyResult: JSON.stringify(analysisResult.policy),
        aiRecommendation: analysisResult.compliance.overallAssessment,
        aiConfidence: analysisResult.compliance.confidence,
        findingsJson: JSON.stringify(analysisResult.compliance),
        guidanceJson: analysisResult.guidance ? JSON.stringify(analysisResult.guidance) : null,
      });

      // Update submission status
      updateSubmission(submissionId, {
        status: 'completed',
        requiresReview: analysisResult.policy.requiresReview,
      });

      return NextResponse.json({
        success: true,
        submissionId,
        status: 'completed',
        recommendation: analysisResult.compliance.overallAssessment,
      });
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);

      // Update submission status to failed
      updateSubmission(submissionId, { status: 'failed' });

      return NextResponse.json(
        { error: 'Analysis failed', details: String(analysisError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
