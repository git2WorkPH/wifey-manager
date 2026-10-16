import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { recordSchema, recentRecords, type LedgerRecord, type Mutation } from "@budget/contracts";
let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;
async function db() {
  databasePromise ??= SQLite.openDatabaseAsync("budget.db").then(async (connection) => {
    await connection.execAsync(
      "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY, body TEXT NOT NULL);",
    );
    return connection;
  });
  return databasePromise;
}
export async function listRecords(): Promise<LedgerRecord[]> {
  return (await (await db()).getAllAsync<{ body: string }>("SELECT body FROM records")).map((row) =>
    recordSchema.parse(JSON.parse(row.body)),
  );
}
export async function pendingCount() {
  return (
    (await (await db()).getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM outbox"))?.n ?? 0
  );
}
let busy = false;
export async function saveRecord(record: LedgerRecord) {
  if (busy) throw new Error("Sync is running. Try again in a moment.");
  const valid = recordSchema.parse(record);
  const connection = await db();
  await connection.withExclusiveTransactionAsync(async (tx) => {
    const queued = await tx.getFirstAsync<{ body: string }>(
      "SELECT body FROM outbox WHERE id=?",
      valid.id,
    );
    // Keep the original server revision when editing a record already pending.
    const revision = queued
      ? (JSON.parse(queued.body) as Mutation).record.revision
      : valid.revision;
    const mutation: Mutation = { operationId: Crypto.randomUUID(), record: { ...valid, revision } };
    await tx.runAsync(
      "INSERT OR REPLACE INTO records VALUES (?,?)",
      valid.id,
      JSON.stringify(mutation.record),
    );
    await tx.runAsync(
      "INSERT OR REPLACE INTO outbox VALUES (?,?)",
      valid.id,
      JSON.stringify(mutation),
    );
  });
}
export class SyncConflict extends Error {
  constructor(public remote: LedgerRecord) {
    super("This record changed on another device. Your local edit is preserved.");
  }
}
export async function acceptRemote(record: LedgerRecord) {
  const connection = await db();
  await connection.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "INSERT OR REPLACE INTO records VALUES (?,?)",
      record.id,
      JSON.stringify(record),
    );
    await tx.runAsync("DELETE FROM outbox WHERE id=?", record.id);
  });
}
export async function keepLocal(remote: LedgerRecord) {
  const local = (await listRecords()).find((r) => r.id === remote.id);
  if (!local) return;
  const connection = await db();
  const mutation: Mutation = {
    operationId: Crypto.randomUUID(),
    record: { ...local, revision: remote.revision },
  };
  await connection.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "INSERT OR REPLACE INTO records VALUES (?,?)",
      local.id,
      JSON.stringify(mutation.record),
    );
    await tx.runAsync(
      "INSERT OR REPLACE INTO outbox VALUES (?,?)",
      local.id,
      JSON.stringify(mutation),
    );
  });
}
export async function sync(url: string, token: string, month: string) {
  if (busy) throw new Error("Sync is already running.");
  if (!/^https?:\/\//.test(url))
    throw new Error("Enter a server address beginning with http:// or https://.");
  busy = true;
  const request = async (path: string, mutation?: Mutation) => {
    const response = await fetch(url.replace(/\/$/, "") + path, {
      method: mutation ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: mutation && JSON.stringify(mutation),
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    if (response.status === 409) throw new SyncConflict(recordSchema.parse(body.record));
    if (!response.ok) throw new Error(body.error ?? "Server request failed");
    return body;
  };
  try {
    const connection = await db();
    const queued = await connection.getAllAsync<{ body: string }>(
      "SELECT body FROM outbox ORDER BY rowid",
    );
    // Category creations must reach the server before dependent budgets or expenses.
    const mutations = queued
      .map((r) => JSON.parse(r.body) as Mutation)
      .sort((a, b) => Number(b.record.kind === "category") - Number(a.record.kind === "category"));
    for (const mutation of mutations) {
      const result = await request("/mutations", mutation);
      await acceptRemote(recordSchema.parse(result.record));
    }
    const remote = ((await request("/records")) as unknown[]).map((r) => recordSchema.parse(r));
    const keep = recentRecords(remote, month);
    await connection.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync("DELETE FROM records");
      for (const record of keep)
        await tx.runAsync("INSERT INTO records VALUES (?,?)", record.id, JSON.stringify(record));
    });
  } finally {
    busy = false;
  }
}
