// app/api/auth/mauthn/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions, getCountryCode } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { mauthNUser } = await req.json();
   
    if (!mauthNUser?.email) {
      return NextResponse.json(
        { error: "Invalid user data" },
        { status: 400 }
      );
    }

    // In a real app, you would verify the MauthN data
    // Here we're just returning success to let the client-side handle the authentication
    return NextResponse.json({
      success: true,
      user: {
        name: mauthNUser.name,
        email: mauthNUser.email,
        image: `https://flagcdn.com/w80/${getCountryCode(mauthNUser.claimant)}.png`,
        claimant: mauthNUser.claimant
      }
    });
  } catch (error) {
    console.error("MauthN session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";