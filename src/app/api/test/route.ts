import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function GET() {
  const diagnostics: any = {};
  
  // Test 1: Check Environment Variable
  diagnostics.env = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  };

  // Test 2: Database Connection
  try {
    const usersCount = await prisma.user.count();
    diagnostics.database = { success: true, usersCount };
  } catch (err: any) {
    diagnostics.database = { success: false, error: err.message, stack: err.stack };
  }

  // Test 3: Hashing Library
  try {
    const hashed = await bcrypt.hash('test', 10);
    diagnostics.bcrypt = { success: true, hashed: !!hashed };
  } catch (err: any) {
    diagnostics.bcrypt = { success: false, error: err.message, stack: err.stack };
  }

  // Test 4: Token Signer
  try {
    const token = await signToken({ userId: 'test-id', email: 'test@example.com', name: 'Test' });
    diagnostics.jose = { success: true, token: !!token };
  } catch (err: any) {
    diagnostics.jose = { success: false, error: err.message, stack: err.stack };
  }

  return NextResponse.json(diagnostics);
}
