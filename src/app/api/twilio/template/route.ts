import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { withApiAuth, createApiError, createApiSuccess } from "@/lib/api-auth";

export const GET = withApiAuth(async (request: NextRequest, user) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const friendlyName = searchParams.get("friendlyName");
    const pageSize = searchParams.get("pageSize");
    const page = searchParams.get("page");

    if (!pageSize) {
      return createApiError("Page size is required", 400);
    }

    if (page === undefined || page === null) {
      return createApiError("Page is required", 400);
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
      return createApiError(result.data.error || "Get Templates failed", 500);
    }

    return createApiSuccess(result.data.contents);
  } catch (error) {
    console.error("Get templates error:", error);
    return createApiError("Get templates failed", 500);
  }
}, {
  requireAuth: true,
  requiredPermission: 'twilio:templates'
});
