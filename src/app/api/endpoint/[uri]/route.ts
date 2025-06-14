import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { WorkflowRunHistoryStatus, WorkflowStatus } from "@/constants/general";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

const instance = axios.create();

export async function POST(request: NextRequest) {
  // Manual authentication for this complex endpoint due to streaming responses
  const authResult = await import("@/lib/api-auth").then(m => m.authenticateApiRequest(request, {
    requireAuth: true,
    requiredPermission: 'endpoint:execute'
  }));

  if (!authResult.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: authResult.error 
      },
      { status: authResult.status }
    );
  }

  const user = authResult.user;
  try {
    // Extract URI from URL path
    const urlParts = request.url.split('/');
    const uri = urlParts[urlParts.length - 1];
    
    if (!uri) {
      return createApiError("Endpoint URI is required", 400);
    }
    let payload = null;
    try {
      payload = await request.json();
    } catch (err) {
      console.warn("Body is not valid JSON or is empty.");
    }
    const headers = request.headers;
    const clientId = headers.get("x-ai-saas-client-id");
    const clientSecret = headers.get("x-ai-saas-client-secret");
    // if (!clientId || !clientSecret) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Client ID and Client Secret are required",
    //     },
    //     { status: 400 }
    //   );
    // }
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(schema.endpoints.uri, uri),
      with: {
        workflow: true,
      },
    });
    // if (clientId !== endpoint?.clientId || clientSecret !== endpoint.clientSecret) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Invalid Client ID or Client Secret",
    //     },
    //     { status: 401 }
    //   );
    // }
    // const endpointPayload: Record<string, any> = {};
    // if (payload) {
    //   for (const key in payload) {
    //     if (endpoint?.payload?.hasOwnProperty(key)) {
    //       endpointPayload[key] = payload[key];
    //     }
    //   }
    // }
    // Check if the workflow in endpoint is published
    if (endpoint?.workflow.status !== WorkflowStatus.PUBLISHED) {
      return NextResponse.json(
        {
          success: false,
          error: "Workflow is not published",
        },
        { status: 400 },
      );
    }
    const endpointOptions = {
      baseURL: process.env.N8N_API_URL,
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": `${process.env.N8N_API_KEY}`,
      },
      url: `webhook/${endpoint?.flowURI}`,
      method: endpoint?.flowMethod,
      data: {
        ...payload,
      },
    };
    if (endpoint) {
      const endpointResponse = await instance(endpointOptions);
      if (payload && payload.stream) {
        const content = endpointResponse.data[0].response.text;
        const readableStream = new ReadableStream({
          start(controller) {
            let currentIndex = 0;
            const chunkSize = 64;
            const interval = setInterval(() => {
              if (currentIndex < content.length) {
                const chunk = content.slice(
                  currentIndex,
                  currentIndex + chunkSize,
                );
                controller.enqueue(new TextEncoder().encode(chunk));
                currentIndex += chunkSize;
              } else {
                clearInterval(interval);
                controller.close();
              }
            }, 100);
          },
        });
        return new Response(readableStream, {
          headers: {
            "Content-Type": "text/event-stream", // 设置响应头为 EventStream
            "Cache-Control": "no-cache", // 禁用缓存
            Connection: "keep-alive", // 保持连接
          },
        });
      } else {
        // Insert success response into workflow_run_history
        // Later should move the MQ
        await db
          .insert(schema.workflowRunHistory)
          .values({
            workflowId: endpoint?.workflow.uuid,
            path: endpoint?.uri,
            method: endpoint?.method,
            payload: payload,
            response: endpointResponse.data,
            status: WorkflowRunHistoryStatus.SUCCESS,
          })
          .returning();
        return NextResponse.json({
          success: true,
          data: endpointResponse.data,
        });
      }
    } else {
      throw new Error("Endpoint not found");
    }
  } catch (error: any) {
    console.log(error);
    if (
      error &&
      error?.response.data &&
      error?.response.data.message.includes("Error in workflow")
    ) {
      return NextResponse.json(
        {
          error: {
            message: `N8N: ${error?.response.data.message}`,
          },
        },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: error?.response.data },
        { status: 400 },
      );
    }
  }
}
