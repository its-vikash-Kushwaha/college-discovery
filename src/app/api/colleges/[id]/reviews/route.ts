import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collegeId } = await params;
    
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await request.json();
    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }

    const ratingVal = parseFloat(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if college exists
    const collegeExists = await prisma.college.findUnique({
      where: { id: collegeId },
    });
    if (!collegeExists) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Submit review
    const newReview = await prisma.review.create({
      data: {
        collegeId,
        userId: decoded.userId,
        rating: ratingVal,
        comment,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // Recalculate average rating
    const aggregates = await prisma.review.aggregate({
      where: { collegeId },
      _avg: { rating: true },
    });

    const newAvgRating = aggregates._avg.rating || ratingVal;
    const roundedAvg = Math.round(newAvgRating * 10) / 10;

    await prisma.college.update({
      where: { id: collegeId },
      data: { rating: roundedAvg },
    });

    return NextResponse.json({ review: newReview, rating: roundedAvg });
  } catch (error) {
    console.error('POST review error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
