import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // JWT callback - runs when a JWT is created or updated
    async jwt({ token, user }) {
      // Handle Google OAuth user
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      // Handle MauthN user data from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        const mauthNData = localStorage.getItem('mauthNUserData');
        if (mauthNData) {
          try {
            const mauthNUser = JSON.parse(mauthNData);
            token.mauthNUser = mauthNUser;
            // Only override if not set by Google OAuth
            if (!token.name) token.name = mauthNUser.name;
            if (!token.email) token.email = mauthNUser.email;
            if (!token.picture) {
              token.picture = `https://flagcdn.com/w80/${getCountryCode(mauthNUser.claimant)}.png`;
            }
          } catch (e) {
            console.error("Failed to parse MauthN data:", e);
          }
        }
      }

      return token;
    },

    // Session callback - controls what gets returned to the client
    async session({ session, token }) {
      // Always include the basic user info
      session.user = {
        ...session.user,
        id: token.sub,
        name: token.name,
        email: token.email,
        image: token.picture,
      };

      // Add MauthN-specific data if available
      if (token.mauthNUser) {
        session.user.mauthNData = {
          claimant: token.mauthNUser.claimant,
          verified: true
        };
      }

      return session;
    },
  },
};

// Helper function to extract country code
function getCountryCode(claimant: string): string {
  const match = claimant.match(/Country Code: ([A-Z]{2})/);
  return match ? match[1].toLowerCase() : "us";
}