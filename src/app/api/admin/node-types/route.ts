import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { nodeTypes as nodeTypesTable } from '@/db/schema/n8n';
import { desc } from 'drizzle-orm';
import { withApiAuth, createApiError, createApiSuccess } from '@/lib/api-auth';

const nodeTypeSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().optional(),
});

export const GET = withApiAuth(async (request: NextRequest, user) => {
  try {
    const nodeTypesResults = await db.select()
      .from(nodeTypesTable)
      .orderBy(desc(nodeTypesTable.type));

    return createApiSuccess(nodeTypesResults);
  } catch (error) {
    console.error('Error fetching node types:', error);
    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requireAdmin: true
});

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const data = nodeTypeSchema.parse(body);

    const [nodeType] = await db.insert(nodeTypesTable)
      .values(data)
      .returning();

    return createApiSuccess(nodeType, 201);
  } catch (error) {
    console.error('Error creating node type:', error);
    if (error instanceof z.ZodError) {
      return createApiError(`Validation error: ${JSON.stringify(error.errors)}`, 400);
    }
    return createApiError('Internal server error', 500);
  }
}, {
  requireAuth: true,
  requireAdmin: true
}); 