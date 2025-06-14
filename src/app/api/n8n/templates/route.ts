import { NextRequest, NextResponse } from 'next/server';
import { parseWorkflow } from '@/lib/parser/workflow-parser';
import { withApiAuth, createApiError, createApiSuccess } from '@/lib/api-auth';

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    const workflowJson = await request.json();
    const result = await parseWorkflow(workflowJson);

    return createApiSuccess(result, 201);
  } catch (error) {
    console.error('Error processing workflow:', error);
    
    if (error instanceof Error) {
      return createApiError(error.message, 400);
    }

    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'workflow:parse'
}); 