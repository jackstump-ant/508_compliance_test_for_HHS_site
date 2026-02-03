import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingReviews,
  getCompletedReviews,
  getReviewById,
  updateReview,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    if (id) {
      const review = getReviewById(id);
      if (!review) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(review);
    }

    if (status === 'pending') {
      const reviews = getPendingReviews();
      return NextResponse.json(reviews);
    }

    if (status === 'completed') {
      const reviews = getCompletedReviews();
      return NextResponse.json(reviews);
    }

    // Return all reviews (pending + completed)
    const pending = getPendingReviews();
    const completed = getCompletedReviews();
    return NextResponse.json({
      pending,
      completed,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, finalDecision, reviewerNotes } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      );
    }

    if (!finalDecision || !['approved', 'rejected', 'needs_remediation'].includes(finalDecision)) {
      return NextResponse.json(
        { error: 'Valid finalDecision is required (approved, rejected, needs_remediation)' },
        { status: 400 }
      );
    }

    const review = getReviewById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const updatedReview = updateReview(reviewId, {
      finalDecision,
      reviewerNotes: reviewerNotes || null,
      reviewedAt: new Date().toISOString(),
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
