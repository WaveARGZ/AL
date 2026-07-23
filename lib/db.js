import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

// Amplify (Lambda) が自動で AWS_REGION を渡す。ローカルは .env などで指定。
const REGION = process.env.AWS_REGION || "ap-northeast-1";
export const TABLE = process.env.FRIENDS_TABLE || "Friends";

// 接続はホットリロード/コールドスタート間で使い回す。
const globalForDb = globalThis;
const client =
  globalForDb.__ddbClient ?? new DynamoDBClient({ region: REGION });
globalForDb.__ddbClient = client;

const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export async function listFriends() {
  const { Items = [] } = await doc.send(new ScanCommand({ TableName: TABLE }));
  // お気に入りを上に、その中は登録順。DynamoDB は並び順を保証しないので JS 側で並べる。
  return Items.sort((a, b) => {
    if ((b.favorite ? 1 : 0) !== (a.favorite ? 1 : 0)) {
      return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
    }
    return (a.created_at || "").localeCompare(b.created_at || "");
  });
}

export async function getFriend(id) {
  const { Item } = await doc.send(
    new GetCommand({ TableName: TABLE, Key: { id: String(id) } })
  );
  return Item ?? null;
}

export async function createFriend({ name, email, phone, note, favorite }) {
  const item = {
    id: randomUUID(),
    name,
    email: email || null,
    phone: phone || null,
    note: note || null,
    favorite: favorite ? 1 : 0,
    created_at: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

export async function updateFriend(id, fields) {
  const current = await getFriend(id);
  if (!current) return null;
  const merged = {
    ...current,
    ...fields,
    id: current.id,
    favorite: (fields.favorite ?? current.favorite) ? 1 : 0,
  };
  await doc.send(new PutCommand({ TableName: TABLE, Item: merged }));
  return merged;
}

export async function deleteFriend(id) {
  const { Attributes } = await doc.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { id: String(id) },
      ReturnValues: "ALL_OLD",
    })
  );
  return !!Attributes;
}
