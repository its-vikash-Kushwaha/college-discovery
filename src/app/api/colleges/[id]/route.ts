import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch college with deep relations
    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: {
          orderBy: { year: 'desc' },
        },
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Check if user has saved this college
    let isSaved = false;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        const saved = await prisma.savedCollege.findUnique({
          where: {
            userId_collegeId: {
              userId: decoded.userId,
              collegeId: id,
            },
          },
        });
        isSaved = !!saved;
      }
    }

    return NextResponse.json({ college, isSaved });
  } catch (error) {
    console.error('GET college detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
