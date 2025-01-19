import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import type { Session, User, Account, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    accessToken?: string;
    provider?: string;
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM!,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Sign in to Financial Amigo",
            html: `
              <body style="background: #f9f9f9; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="color: #333; text-align: center;">Welcome to Financial Amigo</h1>
                  <p style="color: #666; text-align: center;">Click the button below to sign in:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" 
                       style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Sign in to Financial Amigo
                    </a>
                  </div>
                  <p style="color: #666; text-align: center; font-size: 14px;">
                    If you did not request this email, you can safely ignore it.
                  </p>
                </div>
              </body>
            `,
          });

          if (error) {
            console.error("Resend error:", error);
            throw new Error(error.message);
          }

          console.log("Email sent successfully:", data);
        } catch (error) {
          console.error("Failed to send email:", error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "Failed to send verification email"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
    }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.provider = account.provider;
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
      }
      return token;
    },
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: User;
    }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Handle sign in redirects
      if (url.startsWith(baseUrl)) {
        // If on the same origin
        if (url.includes("/api/auth/callback")) {
          // After successful authentication
          return `${baseUrl}/dashboard`;
        }
        return url;
      } else if (url.startsWith("/")) {
        // Handle relative URLs
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({
      user,
      account,
      profile,
      isNewUser,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
      isNewUser?: boolean;
    }) {
      console.log("[Auth Debug] SignIn Event:", { user, account, isNewUser });
    },
    async session({ session }: { session: Session }) {
      console.log("[Auth Debug] Session Event:", { session });
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
