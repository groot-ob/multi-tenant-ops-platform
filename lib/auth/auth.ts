import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../prisma";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = "localhost"; // switch to domain use "yourdomain.com"


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
        authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
   async jwt({ token, user, trigger }) {
  if (user) {
    token.id = user.id;
  }

  if (token.id) {
    const memberships = await prisma.membership.findMany({
      where: { userId: token.id as string },
      include: { tenant: true },
    });

    token.memberships = memberships.map((m) => ({
      tenantId: m.tenantId,
      role: m.role,
      slug: m.tenant.slug,
      name: m.tenant.name,
    }));
  }
  
  return token;
},

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.memberships = token.memberships as any[];
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};


