// E:\mannsahay\src\lib\auth.ts
import { NextAuthOptions, User, Account, Profile } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./db"
import crypto from "crypto"

// Define a proper type for GitHub profile that matches NextAuth's expectations
interface GitHubProfileType {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

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
      // Enhanced GitHub configuration
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile(profile: GitHubProfileType) {
        // Use the built-in GitHub profile type by not specifying a custom type
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login || 'GitHub User',
          email: profile.email, // Allow null for email as per NextAuth expectations
          image: profile.avatar_url,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle GitHub email issue - if no email from GitHub, try to get it from profile
      if (account?.provider === "github" && !user.email) {
        // Try to get email from profile if available
        if (profile && typeof profile === 'object' && 'email' in profile && profile.email) {
          user.email = profile.email as string;
        } else {
          // If still no email, create a placeholder and log the issue
          console.warn("GitHub user has no public email:", profile)
          // You might want to redirect to an email collection page
          return true // Allow signin but user will need to provide email later
        }
      }
      return true
    },
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
          try {
            await prisma.user.update({
              where: { email: session.user.email },
              data: { hashedId }
            });
          } catch (error) {
            // Ignore if user doesn't exist yet or update fails
            console.log("User update for hashedId failed:", error)
          }
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      // Add user ID to token when signing in
      if (user) {
        token.id = user.id;
      }

      // Add provider info to token
      if (account) {
        token.provider = account.provider;
      }

      // Handle GitHub profile data
      if (account?.provider === "github" && profile) {
        token.githubProfile = profile;
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
    error: "/auth/signin", // Redirect to signin on error
  },
  debug: process.env.NODE_ENV === 'development',
}