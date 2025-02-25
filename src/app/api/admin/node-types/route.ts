import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { nodeTypes as nodeTypesTable } from '@/db/schema/n8n';
import { desc } from 'drizzle-orm';

const nodeTypeSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const nodeTypesResults = await db.select()
      .from(nodeTypesTable)
      .orderBy(desc(nodeTypesTable.type));

    return NextResponse.json(nodeTypesResults);
  } catch (error) {
    console.error('Error fetching node types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = nodeTypeSchema.parse(body);

    const [nodeType] = await db.insert(nodeTypesTable)
      .values(data)
      .returning();

    return NextResponse.json(nodeType, { status: 201 });
  } catch (error) {
    console.error('Error creating node type:', error);
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