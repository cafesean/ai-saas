export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuth: !!process.env.NEXTAUTH_SECRET,
    };

    return Response.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 