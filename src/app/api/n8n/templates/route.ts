import { NextResponse } from 'next/server';
import { WorkflowParser } from '@/lib/parser/workflow-parser';

export async function POST(request: Request) {
  try {
    const workflowJson = await request.json();
    const parser = new WorkflowParser();
    const result = await parser.parseWorkflow(workflowJson);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error processing workflow:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 