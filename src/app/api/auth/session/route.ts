import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { token } = await request.json();

  // Get the cookies instance
  const cookieStore = await cookies();

  // Set the session cookie
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // Get the cookies instance
  const cookieStore = await cookies();

  // Delete the session cookie
  await cookieStore.delete("session");

  return NextResponse.json({ success: true });
}
