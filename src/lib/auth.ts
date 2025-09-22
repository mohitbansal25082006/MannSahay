// E:\mannsahay\src\lib\auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./db"
import crypto from "crypto"

// Define interface for GitHub email API response
interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
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
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile: async (profile, tokens) => {
        try {
          console.log("GitHub Profile:", profile);
          if (profile.email == null) {
            const res = await fetch("https://api.github.com/user/emails", {
              headers: { Authorization: `token ${tokens.access_token}` },
            });
            console.log("GitHub API Response Status:", res.status);
            if (res.ok) {
              const emails: GitHubEmail[] = await res.json();
              console.log("GitHub Emails:", emails);
              if (emails?.length > 0) {
                const primaryEmail = emails.find((e: GitHubEmail) => e.primary);
                profile.email = primaryEmail ? primaryEmail.email : emails[0].email;
                console.log("Selected Email:", profile.email);
              } else {
                console.error("No emails found in GitHub API response");
              }
            } else {
              console.error("Failed to fetch GitHub emails:", res.statusText);
            }
          }
          if (!profile.email) {
            console.error("No email available for GitHub user");
            throw new Error("Unable to retrieve user email from GitHub");
          }
          return profile;
        } catch (error) {
          console.error("Error in GitHub profile callback:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub || token.id as string;

        if (!session.user.hashedId && session.user.email) {
          const hashedId = crypto
            .createHash('sha256')
            .update(session.user.email + process.env.NEXTAUTH_SECRET!)
            .digest('hex');

          session.user.hashedId = hashedId;

          try {
            await prisma.user.update({
              where: { email: session.user.email },
              data: { hashedId }
            });
          } catch (error) {
            console.error("Error updating user with hashedId:", error);
          }
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
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