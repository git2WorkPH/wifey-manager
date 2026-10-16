import "dotenv/config";
import { createBudgetServer } from "./http";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { LedgerStore } from "./store";
const token = process.env.BUDGET_TOKEN;
if (!token || token.length < 32)
  throw new Error("Set BUDGET_TOKEN to a secret of at least 32 characters.");
const directory = resolve(process.env.BUDGET_DATA_DIR ?? "data");
mkdirSync(directory, { recursive: true });
const store = new LedgerStore(resolve(directory, "budget.db"));
if (process.argv.includes("--backup")) {
  const path = resolve(directory, `backup-${Date.now()}.db`);
  store.backup(path);
  store.close();
  console.log(`Backup saved: ${path}`);
} else {
  createBudgetServer(store, token).listen(
    Number(process.env.PORT ?? 3001),
    process.env.HOST ?? "127.0.0.1",
    () => console.log("Budget server ready on port " + (process.env.PORT ?? 3001)),
  );
}
