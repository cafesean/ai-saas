import NextAuth from "next-auth";
import { authOptions } from "@/server/auth-simple";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const maxDuration = 60;
