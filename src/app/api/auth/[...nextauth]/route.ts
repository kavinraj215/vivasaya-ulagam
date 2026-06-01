import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

const authHandler = async (req: NextRequest, ctx: any) => {
  const host = req.headers.get("host") || "localhost:3001";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  process.env.NEXTAUTH_URL = `${protocol}://${host}`;

  return handler(req, ctx);
};

export { authHandler as GET, authHandler as POST };
