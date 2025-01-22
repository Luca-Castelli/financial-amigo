import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Session, User, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    refresh_token?: string;
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
    refresh_token?: string;
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
          // Sync user with our backend and get JWT tokens
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

          const data = await response.json();

          // Store both tokens and user ID
          if (data.access_token && data.refresh_token) {
            account.access_token = data.access_token;
            account.refresh_token = data.refresh_token;
            user.id = data.user.id;
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
        // Store both tokens
        if (account.access_token) {
          token.access_token = account.access_token;
        }
        if (account.refresh_token) {
          token.refresh_token = account.refresh_token;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token.access_token) {
        session.access_token = token.access_token;
      }
      if (token.refresh_token) {
        session.refresh_token = token.refresh_token;
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
