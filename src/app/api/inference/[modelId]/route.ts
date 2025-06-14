import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

const instance = axios.create();

export const POST = withApiAuth(async (request: NextRequest, user) => {
  try {
    // Extract modelId from URL path
    const urlParts = request.url.split('/');
    const modelId = urlParts[urlParts.length - 1];
    
    if (!modelId) {
      return createApiError("Model ID is required", 400);
    }
    
    let payload = null;
    try {
      payload = await request.json();
    } catch (err) {
      console.warn("Body is not valid JSON or is empty.");
    }

    // Add tenant isolation to model query
    const model = await db.query.models.findFirst({
      where: and(
        eq(schema.models.uuid, modelId),
        eq(schema.models.tenantId, user.tenantId)
      ),
    });
    
    if (!model) {
      return createApiError("Model not found or access denied", 404);
    }
    if (model) {
      const inferenceOptions = {
        baseURL: process.env.INFERENCE_URL?.replace("{model_uuid}", modelId),
        headers: {
          "Content-Type": "application/json",
          [`${process.env.MODEL_SERVICE_ACCESS_ID_KEY}`]: `${process.env.MODEL_SERVICE_ACCESS_ID_VALUE}`,
          [`${process.env.MODEL_SERVICE_SECRET_KEY}`]: `${process.env.MODEL_SERVICE_SECRET_VALUE}`,
        },
        method: "POST",
        params: {
          model_path: model.fileKey,
          metadata_path: model.metadataFileKey,
        },
        data: {
          ...payload,
        },
      };
      const inferenceResponse = await instance(inferenceOptions);
      if (inferenceResponse.data && !inferenceResponse.data.error) {
        // Insert inference into inferences table
        await db.insert(schema.inferences).values({
          modelId: model.id,
          input: payload,
          output: inferenceResponse.data,
        });
      }
      return createApiSuccess(inferenceResponse.data);
    } else {
      throw new Error("Model not found");
    }
  } catch (error: any) {
    console.log(error);
    if (
      error &&
      error?.response?.data &&
      error?.response?.data?.message?.includes("Error in workflow")
    ) {
      return createApiError(`N8N: ${error?.response.data.message}`, 400);
    } else {
      return createApiError(error?.response?.data || "Model inference failed", 400);
    }
  }
}, {
  requireAuth: true,
  requiredPermission: 'model:inference'
});
