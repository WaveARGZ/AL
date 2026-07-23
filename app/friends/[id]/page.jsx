import { notFound } from "next/navigation";
import { getFriend } from "@/lib/db";
import { avatarColor, initial } from "@/components/avatar";

export const dynamic = "force-dynamic";

export default async function FriendDetailPage({ params }) {
  const { id } = await params;
  const friend = getFriend(Number(id));
  if (!friend) notFound();

  const rows = [
    ["メール", friend.email],
    ["電話番号", friend.phone],
    ["メモ", friend.note],
    ["お気に入り", friend.favorite ? "★ はい" : "いいえ"],
    ["登録日", friend.created_at],
  ];

  return (
    <div>
      <a href="/" className="back-link">
        ← 一覧へ戻る
      </a>
      <div className="detail-head">
        <div className="avatar" style={{ background: avatarColor(friend.name) }}>
          {initial(friend.name)}
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            {friend.name}
          </h1>
          <p className="subtitle" style={{ margin: 0 }}>
            ID #{friend.id}
          </p>
        </div>
      </div>

      <div className="card">
        {rows.map(([k, v]) => (
          <div className="detail-row" key={k}>
            <div className="k">{k}</div>
            <div>{v || <span style={{ color: "var(--muted)" }}>—</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
