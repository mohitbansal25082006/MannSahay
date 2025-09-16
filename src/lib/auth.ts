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
    async session({ session, token, user }) {
      // For database strategy, we get 'user' parameter instead of 'token'
      if (session?.user) {
        // Generate hashed ID for privacy
        const hashedId = crypto
          .createHash('sha256')
          .update(session.user.email + process.env.NEXTAUTH_SECRET!)
          .digest('hex')
        
        // Update user with hashed ID if not exists
        await prisma.user.upsert({
          where: { email: session.user.email! },
          update: {
            hashedId: hashedId,
            name: session.user.name,
            image: session.user.image,
          },
          create: {
            email: session.user.email!,
            name: session.user.name,
            image: session.user.image,
            hashedId: hashedId,
          },
        })
        
        // Add hashedId to session
        session.user.hashedId = hashedId
        
        // For database strategy, we need to add the user id to session
        if (user) {
          session.user.id = user.id
        }
      }
      return session
    },
    async jwt({ token, user }) {
      // Add user id to token for JWT strategy (though we're using database)
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt", // CHANGED FROM "database" to "jwt" - This is crucial for middleware!
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs
}