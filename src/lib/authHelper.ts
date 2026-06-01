import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AdminSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    const error = new Error("Unauthorized");
    (error as any).status = 401;
    throw error;
  }
  
  if ((session.user as any).role !== 'admin') {
    const error = new Error("Forbidden");
    (error as any).status = 403;
    throw error;
  }
  
  return session as AdminSession;
}
