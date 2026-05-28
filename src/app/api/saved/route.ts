import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saved = await prisma.savedCollege.findMany({
      where: { userId: user.userId },
      include: {
        college: {
          include: {
            courses: true,
            placements: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ saved: saved.map((s) => s.college) });
  } catch (error) {
    console.error('GET saved error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collegeId } = await request.json();
    if (!collegeId) {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Check if already saved
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.userId,
          collegeId,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedCollege.delete({
        where: {
          id: existing.id,
        },
      });
      return NextResponse.json({ saved: false, message: 'Removed from watchlist' });
    } else {
      // Save
      await prisma.savedCollege.create({
        data: {
          userId: user.userId,
          collegeId,
        },
      });
      return NextResponse.json({ saved: true, message: 'Added to watchlist' });
    }
  } catch (error) {
    console.error('POST saved error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
