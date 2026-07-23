"use client";

import { useEffect, useState } from "react";
import { avatarColor, initial } from "./avatar";

export default function FriendsClient({ initialFriends }) {
  const [friends, setFriends] = useState(initialFriends ?? []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: "",
    favorite: false,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/friends", { cache: "no-store" });
    setFriends(await res.json());
  }

  async function addFriend(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("名前は必須です");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "追加に失敗しました");
      return;
    }
    setForm({ name: "", email: "", phone: "", note: "", favorite: false });
    setShowForm(false);
    refresh();
  }

  async function removeFriend(id, name) {
    if (!confirm(`${name} を削除しますか？`)) return;
    await fetch(`/api/friends/${id}`, { method: "DELETE" });
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }

  async function toggleFavorite(friend) {
    const res = await fetch(`/api/friends/${friend.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: friend.favorite ? 0 : 1 }),
    });
    if (res.ok) refresh();
  }

  return (
    <div>
      <div className="toolbar">
        <span className="count-pill">{friends.length} 人の友達</span>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "閉じる" : "＋ 友達を追加"}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={addFriend}>
          <div className="field">
            <label>名前 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="山田 太郎"
              autoFocus
            />
          </div>
          <div className="field">
            <label>メール</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="taro@example.com"
            />
          </div>
          <div className="field">
            <label>電話番号</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="090-1234-5678"
            />
          </div>
          <div className="field">
            <label>メモ</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="どんな友達？"
            />
          </div>
          <div className="field">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.favorite}
                onChange={(e) =>
                  setForm({ ...form, favorite: e.target.checked })
                }
              />
              お気に入り
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" disabled={busy} type="submit">
              {busy ? "追加中…" : "追加する"}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => setShowForm(false)}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {friends.length === 0 ? (
        <p className="empty">まだ友達がいません。追加してみましょう。</p>
      ) : (
        friends.map((f) => (
          <div className="friend-card" key={f.id}>
            <div
              className="avatar"
              style={{ background: avatarColor(f.name) }}
            >
              {initial(f.name)}
            </div>
            <a
              className="friend-main"
              href={`/friends/${f.id}`}
              style={{ display: "block" }}
            >
              <div className="friend-name">
                {f.name}
                {f.favorite ? <span className="star">★</span> : null}
              </div>
              <div className="friend-sub">
                {f.email || f.phone || "連絡先なし"}
              </div>
            </a>
            <div className="row-actions">
              <button
                className="btn btn-sm"
                onClick={() => toggleFavorite(f)}
                title="お気に入り切り替え"
              >
                {f.favorite ? "★" : "☆"}
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => removeFriend(f.id, f.name)}
              >
                削除
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
