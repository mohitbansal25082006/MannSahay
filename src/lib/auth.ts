// E:\mannsahay\src\lib\auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./db"
import crypto from "crypto"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Add authorization params to get user email
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // For JWT strategy, we get the user ID from the token
      if (session?.user && token) {
        // Add user ID to session
        session.user.id = token.sub || token.id as string;
        
        // Generate hashed ID for privacy if not already set
        if (!session.user.hashedId && session.user.email) {
          const hashedId = crypto
            .createHash('sha256')
            .update(session.user.email + process.env.NEXTAUTH_SECRET!)
            .digest('hex');
          
          session.user.hashedId = hashedId;
          
          // Update user with hashed ID if not exists
          await prisma.user.update({
            where: { email: session.user.email },
            data: { hashedId }
          }).catch(() => {
            // Ignore if user doesn't exist yet
          });
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Add user ID to token when signing in
      if (user) {
        token.id = user.id;
      }
      
      // Add provider info to token
      if (account) {
        token.provider = account.provider;
      }
      
      return token
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === 'development',
}