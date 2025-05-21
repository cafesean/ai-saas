import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest, res: NextResponse) {
  if (request.method !== "GET") {
    return NextResponse.json(
      {
        success: false,
        error: "Method not allowed",
      },
      { status: 405 },
    );
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const friendlyName = searchParams.get("friendlyName");
    const pageSize = searchParams.get("pageSize");
    const page = searchParams.get("page");
    if (!pageSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Page size is required",
        },
        { status: 400 },
      );
    }

    if (page === undefined || page === null) {
      return NextResponse.json(
        {
          success: false,
          error: "Page is required",
        },
        { status: 400 },
      );
    }
    const base64Auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_TOKEN}`,
    ).toString("base64");
    const result = await axios.get(
      `${process.env.TWILIO_GET_TEMPLATE_LIST_URL}`,
      {
        params: {
          pageSize: pageSize,
          page: page,
          friendlyName: friendlyName,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + base64Auth,
        },
        timeout: 5 * 60 * 1000,
      },
    );
    if (!result.data.contents) {
      return NextResponse.json(
        { success: false, error: result.data.error || "Get Templates failed" },
        { status: 500 },
      );
    }

    // Return successful upload information
    return NextResponse.json(
      {
        success: true,
        data: result.data.contents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get templates:", error);
    return NextResponse.json(
      { error: "Get templates: failed" },
      { status: 500 },
    );
  }
}
