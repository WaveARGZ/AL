# 友達リスト (Friends List)

Next.js (App Router) + **Amazon DynamoDB** で作った友達リストのWebアプリ。
AWS Amplify Hosting へのデプロイを想定しています。

## 機能

- 友達の一覧表示（お気に入りを上に自動ソート）
- 友達の追加 / 削除 / お気に入り切り替え
- 友達の詳細ページ
- 初期データとして **A・B・C・Dさん** をシード

## 構成

| パス | 役割 |
| --- | --- |
| `lib/db.js` | DynamoDB 接続・CRUD 関数（すべて非同期） |
| `app/api/friends/route.js` | 一覧取得 (GET) / 追加 (POST) |
| `app/api/friends/[id]/route.js` | 取得 (GET) / 更新 (PATCH) / 削除 (DELETE) |
| `app/page.jsx` | トップの一覧ページ |
| `app/friends/[id]/page.jsx` | 詳細ページ |
| `components/FriendsClient.jsx` | 一覧・追加・削除のクライアント UI |
| `scripts/seed.mjs` | テーブル作成＋ABCD投入スクリプト |

## 環境変数

| 変数 | 例 | 用途 |
| --- | --- | --- |
| `AWS_REGION` | `ap-northeast-1` | DynamoDB のリージョン（Amplify/Lambda では自動設定） |
| `FRIENDS_TABLE` | `Friends` | DynamoDB テーブル名 |

## テーブル作成＆初期データ投入（ローカルから1回だけ）

AWS 認証情報（`aws configure` 済み）が必要です。

```bash
AWS_REGION=ap-northeast-1 FRIENDS_TABLE=Friends npm run seed
```

これで `Friends` テーブルが作られ、ABCDさんが入ります。

## ローカル開発

```bash
npm install
AWS_REGION=ap-northeast-1 FRIENDS_TABLE=Friends npm run dev
```

http://localhost:3000

## AWS Amplify へのデプロイ

1. Amplify コンソール → 「Deploy an app」→ GitHub リポジトリ (`WaveARGZ/AL`) を接続
2. 環境変数に `AWS_REGION` と `FRIENDS_TABLE` を設定
3. SSR 用の **Compute role** に DynamoDB アクセス権（下記ポリシー）を付与
4. デプロイ完了後、上記の `npm run seed` でテーブルを用意

DynamoDB 権限ポリシー例（テーブル ARN は自分のものに置換）:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:Scan"],
    "Resource": "arn:aws:dynamodb:ap-northeast-1:<ACCOUNT_ID>:table/Friends"
  }]
}
```
