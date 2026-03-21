import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { artistName, email, country, genre, description, links, demoFile } = body;

  if (!artistName || !email || !country || !genre || !description) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const submission = await db.demoSubmission.create({
    data: {
      artistName,
      email,
      country,
      genre,
      description,
      links: JSON.stringify(links ?? {}),
      demoFile: demoFile ?? null,
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
