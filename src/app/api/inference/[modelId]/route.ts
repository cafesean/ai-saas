import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/db";
import { models, inferences } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";
import { processInferenceResponse } from "@/lib/inference-utils";

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

    // Add org isolation to model query
    const model = await db.query.models.findFirst({
      where: and(
        eq(models.uuid, modelId),
        eq(models.orgId, user.orgId)
      ),
    });
    
    if (!model) {
      return createApiError("Model not found or access denied", 404);
    }
    if (model) {
      const inferenceOptions = {
        baseURL: process.env.MODEL_SERVICE_URL?.replace("{model_uuid}", modelId),
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
        // Fix feature contributions before storing and returning
        const processedResponse = await processInferenceResponse(
          inferenceResponse.data,
          payload,
          modelId,
          user.orgId
        );
        
        // Insert inference into inferences table
        await db.insert(inferences).values({
          modelId: model.id,
          input: payload,
          output: processedResponse,
        });
        
        return createApiSuccess(processedResponse);
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
