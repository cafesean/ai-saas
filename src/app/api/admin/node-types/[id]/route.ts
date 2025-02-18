import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db} from '@/db';
import { nodeTypes } from '@/db/schema/n8n';
import { eq } from 'drizzle-orm';

const nodeTypeSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().optional(),
});

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const id = request.url.split('/').pop();
    const body = await request.json();
    const data = nodeTypeSchema.parse(body);

    if (!id) {
      throw new Error('ID is required');
    }

    const [nodeType] = await db.update(nodeTypes)
      .set(data)
      .where(eq(nodeTypes.id, id as string))
      .returning();

    return NextResponse.json(nodeType);
  } catch (error) {
    console.error('Error updating node type:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const id = request.url.split('/').pop();
    
    await db.delete(nodeTypes)
      .where(eq(nodeTypes.id, id as string));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting node type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 