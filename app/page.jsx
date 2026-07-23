import { listFriends } from "@/lib/db";
import FriendsClient from "@/components/FriendsClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const friends = listFriends();
  return (
    <div>
      <h1 className="page-title">友達リスト</h1>
      <p className="subtitle">Next.js + SQLite。名前をタップで詳細へ。</p>
      <FriendsClient initialFriends={friends} />
    </div>
  );
}
