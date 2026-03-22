import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    totalEnvCount: Object.keys(process.env).length,
    allKeys: Object.keys(process.env).sort(),
  });
}
