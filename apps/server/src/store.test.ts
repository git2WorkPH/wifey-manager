import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LedgerStore } from "./store";
import type { LedgerRecord, Mutation } from "@budget/contracts";
const category = (): LedgerRecord => ({
  id: randomUUID(),
  revision: 0,
  kind: "category",
  name: "Groceries",
  archived: false,
});
const mutation = (record: LedgerRecord): Mutation => ({ operationId: randomUUID(), record });
test("retrying a mutation is idempotent and stale edits conflict", () => {
  const store = new LedgerStore(":memory:");
  try {
    const m = mutation(category());
    const first = store.apply(m);
    assert.deepEqual(store.apply(m), first);
    assert.equal(store.list().length, 1);
    assert.equal(
      store.apply(mutation({ ...m.record, name: "Other device" } as LedgerRecord)).conflict,
      true,
    );
    assert.equal(store.list()[0].revision, 1);
  } finally {
    store.close();
  }
});
test("renaming and archiving preserve historical allocation labels and expense totals", () => {
  const store = new LedgerStore(":memory:");
  try {
    const c = store.apply(mutation(category())).record;
    const budget: LedgerRecord = {
      id: randomUUID(),
      revision: 0,
      kind: "budget",
      categoryId: c.id,
      month: "2026-10",
      label: "Groceries",
      amount: 50000,
    };
    store.apply(mutation(budget));
    store.apply(mutation({ ...c, kind: "category", name: "Food", archived: true }));
    assert.equal(store.list().find((r) => r.kind === "budget")?.kind, "budget");
    assert.equal(
      (store.list().find((r) => r.kind === "budget") as typeof budget).label,
      "Groceries",
    );
    assert.throws(
      () => store.apply(mutation({ ...budget, id: randomUUID(), month: "2026-11" })),
      /archived/,
    );
  } finally {
    store.close();
  }
});
test("duplicate allocations and orphan expenses are rejected without changing data", () => {
  const store = new LedgerStore(":memory:");
  try {
    const c = store.apply(mutation(category())).record;
    const b: LedgerRecord = {
      id: randomUUID(),
      revision: 0,
      kind: "budget",
      categoryId: c.id,
      month: "2026-10",
      label: "Groceries",
      amount: 100,
    };
    store.apply(mutation(b));
    assert.throws(() => store.apply(mutation({ ...b, id: randomUUID() })), /already has/);
    assert.throws(
      () =>
        store.apply(
          mutation({
            id: randomUUID(),
            revision: 0,
            kind: "expense",
            categoryId: randomUUID(),
            month: "2026-10",
            date: "2026-10-01",
            amount: 100,
            note: "",
            voided: false,
          }),
        ),
      /does not exist/,
    );
    assert.equal(store.list().length, 2);
  } finally {
    store.close();
  }
});
test("backup restores the ledger", () => {
  const dir = mkdtempSync(join(tmpdir(), "budget-test-"));
  const original = new LedgerStore(join(dir, "original.db"));
  try {
    original.apply(mutation(category()));
    original.backup(join(dir, "backup.db"));
    const restored = new LedgerStore(join(dir, "backup.db"));
    try {
      assert.deepEqual(restored.list(), original.list());
    } finally {
      restored.close();
    }
  } finally {
    original.close();
    rmSync(dir, { recursive: true });
  }
});
