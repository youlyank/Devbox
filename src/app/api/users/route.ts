import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }
    
    // Create new user
    const user = await db.user.create({
      data: {
        email,
        name,
        subscriptionTier: 'free',
      },
    });
    
    // Create billing record
    await db.billing.create({
      data: {
        userId: user.id,
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        amount: 0,
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    
    let user;
    
    if (email) {
      user = await db.user.findUnique({
        where: { email },
        include: {
          billing: true,
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              projects: true,
              deployments: true,
            },
          },
        },
      });
    } else if (id) {
      user = await db.user.findUnique({
        where: { id },
        include: {
          billing: true,
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              projects: true,
              deployments: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Email or ID is required' },
        { status: 400 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}