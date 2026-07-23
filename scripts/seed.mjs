// ローカルから1回だけ実行するスクリプト。
//   1) DynamoDB テーブルが無ければ作成
//   2) A・B・C・Dさんを投入（既にあればスキップ）
//
// 実行前に AWS 認証情報（aws configure 済み or 環境変数）と
// リージョンが必要:
//   AWS_REGION=ap-northeast-1 FRIENDS_TABLE=Friends npm run seed

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "ap-northeast-1";
const TABLE = process.env.FRIENDS_TABLE || "Friends";

const client = new DynamoDBClient({ region: REGION });
const doc = DynamoDBDocumentClient.from(client);

async function ensureTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE }));
    console.log(`テーブル "${TABLE}" は既に存在します。`);
    return;
  } catch (e) {
    if (e.name !== "ResourceNotFoundException") throw e;
  }
  console.log(`テーブル "${TABLE}" を作成中…`);
  await client.send(
    new CreateTableCommand({
      TableName: TABLE,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    })
  );
  await waitUntilTableExists(
    { client, maxWaitTime: 120 },
    { TableName: TABLE }
  );
  console.log("作成完了。");
}

async function seed() {
  const now = new Date().toISOString();
  const rows = [
    { id: "a", name: "Aさん", email: "a@example.com", phone: "090-1000-0001", note: "学生時代からの友達", favorite: 1 },
    { id: "b", name: "Bさん", email: "b@example.com", phone: "090-1000-0002", note: "職場の同僚", favorite: 0 },
    { id: "c", name: "Cさん", email: "c@example.com", phone: "090-1000-0003", note: "テニスサークル仲間", favorite: 1 },
    { id: "d", name: "Dさん", email: "d@example.com", phone: "090-1000-0004", note: "ご近所さん", favorite: 0 },
  ];
  for (const r of rows) {
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: { ...r, created_at: now },
        // 既に同じ id があれば上書きしない
        ConditionExpression: "attribute_not_exists(id)",
      })
    ).then(
      () => console.log(`投入: ${r.name}`),
      (e) => {
        if (e.name === "ConditionalCheckFailedException") {
          console.log(`スキップ（既存）: ${r.name}`);
        } else {
          throw e;
        }
      }
    );
  }
}

await ensureTable();
await seed();
console.log("シード完了 🎉");
