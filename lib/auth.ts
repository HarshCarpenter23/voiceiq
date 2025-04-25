// lib/auth.ts
import { parse } from 'cookie';
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { headers } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";

// Helper function to extract country code
export function getCountryCode(claimant: string): string {
  const match = claimant.match(/Country Code: ([A-Z]{2})/);
  return match ? match[1].toLowerCase() : "us";
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add a credentials provider for MauthN
    CredentialsProvider({
      id: "mauthn",
      name: "MauthN",
      credentials: {
        email: { label: "Email", type: "email" },
        userData: { label: "User Data", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userData) {
          return null;
        }
        
        try {
          const userData = JSON.parse(credentials.userData);
          
          if (!userData.email || !userData.name || !userData.claimant) {
            return null;
          }
          
          // In a real app, you'd verify this data against your database
          // For demo, we'll just return the user object
          return {
            id: `mauthn_${userData.email}`,
            name: userData.name,
            email: userData.email,
            image: `https://flagcdn.com/w80/${getCountryCode(userData.claimant)}.png`,
            claimant: userData.claimant,
          };
        } catch (err) {
          console.error("Error parsing MauthN credentials:", err);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        
        // If this is a MauthN login, store the claimant
        if (account?.provider === "mauthn" && "claimant" in user) {
          token.mauthNUser = {
            claimant: user.claimant,
            name: user.name,
            email: user.email
          };
        }
      }
      
      try {
        // Only run this in server context
        if (typeof window === 'undefined') {
          // ONLY works in App Router server context
          const cookieHeader = headers().get("cookie"); // Use `headers()` from 'next/headers'
          if (cookieHeader) {
            const cookies = parse(cookieHeader);
            const rawData = cookies.mauthNUserData;
            if (rawData) {
              const decoded = decodeURIComponent(rawData);
              const mauthNUser = JSON.parse(decoded);
              token.mauthNUser = mauthNUser;
              if (!token.name) token.name = mauthNUser.name;
              if (!token.email) token.email = mauthNUser.email;
              if (!token.picture) {
                token.picture = `https://flagcdn.com/w80/${getCountryCode(mauthNUser.claimant)}.png`;
              }
            }
          }
        }
      } catch (e) {
        console.error("JWT callback cookie parsing failed:", e);
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
        name: token.name,
        email: token.email,
        image: token.picture,
      };
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