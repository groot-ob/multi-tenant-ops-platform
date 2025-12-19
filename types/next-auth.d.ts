import NextAuth, { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      memberships: {
        tenantId: string;
        role: string;
        slug: string;
        name: string;
      }[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    memberships: {
      tenantId: string;
      role: string;
      slug: string;
      name: string;
    }[];
  }
}