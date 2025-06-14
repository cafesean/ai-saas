import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db} from '@/db';
import { nodeTypes } from '@/db/schema/n8n';
import { eq } from 'drizzle-orm';
import { withApiAuth, createApiError, createApiSuccess } from '@/lib/api-auth';

const nodeTypeSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().optional(),
});

export const PUT = withApiAuth(async (request: NextRequest, user) => {
  try {
    const id = request.url.split('/').pop();
    const body = await request.json();
    const data = nodeTypeSchema.parse(body);

    if (!id) {
      return createApiError('ID is required', 400);
    }

    const [nodeType] = await db.update(nodeTypes)
      .set(data)
      .where(eq(nodeTypes.id, parseInt(id)))
      .returning();

    return createApiSuccess(nodeType);
  } catch (error) {
    console.error('Error updating node type:', error);
    if (error instanceof z.ZodError) {
      return createApiError(`Validation error: ${JSON.stringify(error.errors)}`, 400);
    }
    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requireAdmin: true
});

export const DELETE = withApiAuth(async (request: NextRequest, user) => {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return createApiError('ID is required', 400);
    }
    
    await db.delete(nodeTypes)
      .where(eq(nodeTypes.id, parseInt(id)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting node type:', error);
    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requireAdmin: true
}); 