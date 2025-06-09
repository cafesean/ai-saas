import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq } from "drizzle-orm";

const instance = axios.create();

export async function POST(
  request: NextRequest,
  { params }: { params: { modelId: string } },
  res: NextResponse,
) {
  try {
    const { modelId } = await params;
    let payload = null;
    try {
      payload = await request.json();
    } catch (err) {
      console.warn("Body is not valid JSON or is empty.");
    }

    const model = await db.query.models.findFirst({
      where: eq(schema.models.uuid, modelId),
    });
    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: "Model is not found.",
        },
        { status: 400 },
      );
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
      return NextResponse.json({
        success: true,
        data: inferenceResponse.data,
      });
    } else {
      throw new Error("Model not found");
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
