import { NextResponse } from "next/server";
import { getFriend, updateFriend, deleteFriend } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const friend = getFriend(Number(id));
  if (!friend) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  return NextResponse.json(friend);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updated = updateFriend(Number(id), body);
  if (!updated) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const ok = deleteFriend(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
