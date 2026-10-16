import { DatabaseSync } from "node:sqlite";
import { mutationSchema, type LedgerRecord } from "@budget/contracts";
export class LedgerStore {
  private db: DatabaseSync;
  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(
      "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS operations(id TEXT PRIMARY KEY, body TEXT NOT NULL);",
    );
  }
  list(): LedgerRecord[] {
    return (this.db.prepare("SELECT body FROM records").all() as { body: string }[]).map((r) =>
      JSON.parse(r.body),
    );
  }
  apply(input: unknown): { conflict: boolean; record: LedgerRecord } {
    const mutation = mutationSchema.parse(input);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const prior = this.db
        .prepare("SELECT body FROM operations WHERE id=?")
        .get(mutation.operationId) as { body: string } | undefined;
      if (prior) {
        this.db.exec("COMMIT");
        return JSON.parse(prior.body);
      }
      const row = this.db.prepare("SELECT body FROM records WHERE id=?").get(mutation.record.id) as
        | { body: string }
        | undefined;
      const existing: LedgerRecord | undefined = row && JSON.parse(row.body);
      if ((existing?.revision ?? 0) !== mutation.record.revision) {
        this.db.exec("COMMIT");
        if (!existing) throw new Error("Record no longer exists");
        return { conflict: true, record: existing };
      }
      const record = { ...mutation.record, revision: mutation.record.revision + 1 };
      const all = this.list();
      if (existing && existing.kind !== record.kind) throw new Error("Record type cannot change");
      if (record.kind === "budget" || record.kind === "expense") {
        const category = all.find((r) => r.id === record.categoryId && r.kind === "category");
        if (!category) throw new Error("Category does not exist");
        if (category.kind === "category" && category.archived && !existing)
          throw new Error("Category is archived");
        if (
          record.kind === "budget" &&
          all.some(
            (r) =>
              r.kind === "budget" &&
              r.month === record.month &&
              r.categoryId === record.categoryId &&
              r.id !== record.id,
          )
        )
          throw new Error("Category already has a budget this month");
        if (record.kind === "expense" && record.date.slice(0, 7) !== record.month)
          throw new Error("Expense date must match its month");
      }
      const result = { conflict: false, record };
      this.db
        .prepare("INSERT OR REPLACE INTO records VALUES (?,?)")
        .run(record.id, JSON.stringify(record));
      this.db
        .prepare("INSERT INTO operations VALUES (?,?)")
        .run(mutation.operationId, JSON.stringify(result));
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      if (this.db.isTransaction) this.db.exec("ROLLBACK");
      throw error;
    }
  }
  backup(path: string) {
    this.db.prepare("VACUUM INTO ?").run(path);
  }
  close() {
    this.db.close();
  }
}
