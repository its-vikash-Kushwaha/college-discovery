import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query params
    const query = searchParams.get('query') || '';
    const stateStr = searchParams.get('state') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxFees = parseInt(searchParams.get('maxFees') || '99999999');
    const sortBy = searchParams.get('sortBy') || 'rating_desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.CollegeWhereInput = {
      rating: { gte: minRating },
      fees: { lte: maxFees },
    };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
      ];
    }

    // State filter (supports comma-separated list of states)
    if (stateStr) {
      const states = stateStr.split(',').map((s) => s.trim()).filter(Boolean);
      if (states.length > 0) {
        where.state = { in: states, mode: 'insensitive' };
      }
    }

    // Sorting
    let orderBy: Prisma.CollegeOrderByWithRelationInput = { rating: 'desc' };
    if (sortBy === 'fees_asc') {
      orderBy = { fees: 'asc' };
    } else if (sortBy === 'fees_desc') {
      orderBy = { fees: 'desc' };
    } else if (sortBy === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sortBy === 'rating_desc') {
      orderBy = { rating: 'desc' };
    }

    // Query DB
    const [colleges, totalCount] = await prisma.$transaction([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          courses: true,
          placements: {
            orderBy: { year: 'desc' },
            take: 1, // only need most recent placement summary for listings
          },
        },
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      colleges,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('GET colleges error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
