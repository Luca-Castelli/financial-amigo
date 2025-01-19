import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Session, User, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { SignJWT } from "jose";
import { jwtVerify } from "jose";

declare module "next-auth" {
  interface Session {
    access_token?: string;
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
    access_token?: string;
    id?: string;
    email?: string | null;
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "google") {
        try {
          // Sync user with our backend
          const response = await fetch(
            "http://localhost:8000/api/auth/sync-google-user",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                google_id: account.providerAccountId,
              }),
            }
          );

          if (!response.ok) {
            console.error(
              "Failed to sync user with backend:",
              await response.text()
            );
            return false;
          }
        } catch (error) {
          console.error("Error syncing user with backend:", error);
          return false;
        }
      }
      return true;
    },
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
      }

      // Generate a new backend token if:
      // 1. No token exists
      // 2. No email in token (invalid state)
      // 3. Token is expired (we don't store expiry as it's handled by the JWT itself)
      try {
        if (token.access_token) {
          // Verify the existing token
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
          try {
            await jwtVerify(token.access_token, secret);
            // Token is still valid
            return token;
          } catch {
            // Token is expired or invalid, generate new one below
          }
        }

        // Generate new token
        if (token.email) {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
          const backendToken = await new SignJWT({ email: token.email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(secret);

          token.access_token = backendToken;
        }
      } catch (error) {
        console.error("Error handling JWT token:", error);
        // Don't throw - let the user continue with a degraded experience
        // They'll get auth errors when calling the backend
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token.access_token) {
        session.access_token = token.access_token;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // After successful authentication, always redirect to dashboard
      if (url.includes("/api/auth/callback")) {
        return `${baseUrl}/dashboard`;
      }
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Handle same origin URLs
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
