import { NextResponse } from "next/server";
import { listFriends, createFriend } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listFriends());
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "名前は必須です" }, { status: 400 });
  }
  const friend = await createFriend({
    name,
    email: body.email?.trim() || null,
    phone: body.phone?.trim() || null,
    note: body.note?.trim() || null,
    favorite: !!body.favorite,
  });
  return NextResponse.json(friend, { status: 201 });
}
