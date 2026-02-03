import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, getReviewBySubmissionId } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = getSubmissionById(id);

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Get associated review if exists
    const review = getReviewBySubmissionId(id);

    return NextResponse.json({
      ...submission,
      review: review || null,
    });
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json(
      { error: 'Failed to get submission' },
      { status: 500 }
    );
  }
}
