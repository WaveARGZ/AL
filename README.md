# 友達リスト (Friends List)

Next.js (App Router) + SQLite で作った友達リストのWebアプリ。

## 機能

- 友達の一覧表示（お気に入りを上に自動ソート）
- 友達の追加（名前・メール・電話・メモ・お気に入り）
- 友達の削除
- お気に入りのオン/オフ切り替え
- 友達の詳細ページ
- 初期データとして **A・B・C・Dさん** を自動投入

## 起動方法

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

## 構成

| パス | 役割 |
| --- | --- |
| `lib/db.js` | SQLite 接続・スキーマ・ABCDの初期シード・CRUD 関数 |
| `app/api/friends/route.js` | 一覧取得 (GET) / 追加 (POST) |
| `app/api/friends/[id]/route.js` | 取得 (GET) / 更新 (PATCH) / 削除 (DELETE) |
| `app/page.jsx` | トップの一覧ページ |
| `app/friends/[id]/page.jsx` | 詳細ページ |
| `components/FriendsClient.jsx` | 一覧・追加・削除のクライアント UI |

DB ファイルは `data/friends.db` に保存されます（`.gitignore` 済み）。
削除すると次回起動時に ABCD が再投入されます。
# AL
