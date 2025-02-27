import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { db } from "@/db/config";
import schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const instance = axios.create();

export async function POST(request: NextRequest, { params }: { params: { uri: string } }) {
  try {
    const { uri } = await params;
    const payload = await request.json()
    const headers = request.headers;
    const clientId = headers.get("x-ai-sass-client-id");
    const clientSecret = headers.get("x-ai-sass-client-secret");
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        "success": false,
        "error": "Client ID and Client Secret are required",
      }, { status: 400 })
    }
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(schema.endpoints.uri, uri),
    });
    if (clientId !== endpoint?.clientId|| clientSecret !== endpoint.clientSecret) {
      return NextResponse.json({
        "success": false,
        "error": "Invalid Client ID or Client Secret",
      }, { status: 401 })
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
    const endpointResponse = await instance(endpointOptions);
    return NextResponse.json({
      "success": true,
      data: endpointResponse.data[0].response,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' }, 
      { status: 400 }
    )
  }
}
