import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseMoney,
  totals,
  monthOffset,
  recentRecords,
  recordSchema,
  type LedgerRecord,
} from "./index";
const id = "11111111-1111-4111-8111-111111111111";
const records: LedgerRecord[] = [
  {
    id,
    revision: 0,
    kind: "income",
    month: "2026-10",
    date: "2026-10-01",
    amount: 400000,
    note: "Salary",
  },
  {
    id,
    revision: 0,
    kind: "budget",
    month: "2026-10",
    categoryId: id,
    label: "Groceries",
    amount: 50000,
  },
  {
    id,
    revision: 0,
    kind: "expense",
    month: "2026-10",
    categoryId: id,
    date: "2026-10-04",
    amount: 57500,
    note: "",
    voided: false,
  },
  {
    id,
    revision: 0,
    kind: "expense",
    month: "2026-10",
    categoryId: id,
    date: "2026-10-04",
    amount: 10000,
    note: "",
    voided: true,
  },
];
test("salary allocation and overspending use exact cents and exclude voided expenses", () =>
  assert.deepEqual(totals(records, "2026-10"), {
    income: 400000,
    allocated: 50000,
    spent: 57500,
    unallocated: 350000,
    remaining: -7500,
  }));
test("money input rejects precision loss, negatives and exponent notation", () => {
  assert.equal(parseMoney("10.09"), 1009);
  assert.equal(parseMoney("0.1"), 10);
  for (const value of ["1.001", "-3", "1e3", "NaN", ""]) assert.throws(() => parseMoney(value));
});
test("month windows cross year boundaries", () => {
  assert.equal(monthOffset("2026-01", -2), "2025-11");
  assert.equal(monthOffset("2026-12", 1), "2027-01");
});
test("retention preserves categories and excludes old synchronized periods", () => {
  const category: LedgerRecord = {
    id,
    revision: 0,
    kind: "category",
    name: "Rent",
    archived: true,
  };
  assert.equal(
    recentRecords(
      [
        ...records,
        category,
        {
          ...records[0],
          kind: "income",
          month: "2026-07",
          date: "2026-07-01",
          amount: 100,
          note: "",
        },
      ],
      "2026-10",
    ).length,
    5,
  );
});
test("invalid calendar dates and money rejected at contract boundary", () => {
  assert.equal(recordSchema.safeParse({ ...records[2], date: "2026-02-30" }).success, false);
  assert.equal(recordSchema.safeParse({ ...records[0], amount: 1.5 }).success, false);
});
