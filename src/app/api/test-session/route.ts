import { NextRequest, NextResponse } from 'next/server';
import { createTRPCContextFetch } from '@/server/api/trpc';

export async function GET(request: NextRequest) {
  try {
    // Test the tRPC context creation
    const context = await createTRPCContextFetch({
      req: request,
      resHeaders: new Headers(),
    });

    return NextResponse.json({
      hasSession: !!context.session,
      userId: context.session?.user?.id,
      email: context.session?.user?.email,
      orgId: context.session?.user?.orgId,
      permissionsCount: context.session?.user?.roles?.flatMap(r => r.policies).length || 0,
      rolesCount: context.session?.user?.roles?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create tRPC context',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 