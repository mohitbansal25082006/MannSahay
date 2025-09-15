import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./db"
import crypto from "crypto"
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user?.email) {
        // Generate hashed ID for privacy
        const hashedId = crypto
          .createHash('sha256')
          .update(session.user.email + process.env.NEXTAUTH_SECRET)
          .digest('hex')
        
        // Update user with hashed ID if not exists
        await prisma.user.upsert({
          where: { email: session.user.email },
          update: {
            hashedId: hashedId,
            name: session.user.name,
            image: session.user.image,
          },
          create: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            hashedId: hashedId,
          },
        })
        
        session.user.hashedId = hashedId
      }
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
  },
}