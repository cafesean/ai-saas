import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
// import { withPermission } from "../trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";

export const twilioRouter = createTRPCRouter({
  getTemplates: protectedProcedure
    .input(z.object({
      pageSize: z.number().min(1).max(200).default(200),
      page: z.number().min(0).default(0),
      friendlyName: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const { pageSize, page, friendlyName } = input;

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
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.data.error || "Failed to get Twilio templates",
          });
        }

        return result.data.contents;
      } catch (error) {
        console.error("Get Twilio templates error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch Twilio templates",
        });
      }
    }),
}); 