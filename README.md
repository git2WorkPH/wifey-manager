# Our Budget

A TypeScript household budget app: Expo/React Native on your phone, Node.js and SQLite on your own computer. Uses pnpm workspaces and shared validated contracts. This is an initial version; native device verification is still required.

## Start

Requires Node.js 24.15+ (or Node 26) and pnpm 11.25.0. Install dependencies from the repository root:

```sh
pnpm install
```

Generate a household secret and keep it private:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the server environment template, then edit `apps/server/.env` and set `BUDGET_TOKEN` to your generated secret:

```sh
cp apps/server/.env.example apps/server/.env
```

The template sets `HOST=0.0.0.0` for access from your phone on the local network. In one terminal, start the server:

```sh
pnpm server
```

In another terminal:

```sh
pnpm mobile
```

Open with a compatible Expo Go app, or create a development build with `pnpm --filter @budget/mobile ios` / `pnpm --filter @budget/mobile android` (native toolchains required). Expo Go compatibility depends on the SDK supported by the installed client. Allow local-network permission on iOS. The included Android config plugin enables LAN HTTP in development builds; plain HTTP access still needs target-phone verification. Use HTTPS for production.

In Settings, enter your computer's LAN address (for example `http://192.168.1.20:3001`) and the household secret. Both devices must be on a reachable network, and the computer must be awake for sync. The default server binding is loopback unless HOST is set. The LAN HTTP setup is for development on a trusted network; use HTTPS/private VPN for use beyond that environment. Do not port-forward this development server to the internet.

## First budgeting session

1. Create your categories under Categories: rent, groceries, utilities, or any names you choose.
2. Select the month and enter salary under Income.
3. Allocate amounts under Overview. Unallocated shows salary still available to distribute.
4. Add purchases under Expenses. Remaining becomes negative when spending exceeds a budget.
5. Use Settings → Sync now to send changes to your computer. Configure another phone with the same secret to share the ledger.

Rename or archive categories as expenses change. Existing monthly allocation labels remain unchanged after a rename. Archives preserve history. Income and expenses can be corrected; removed expenses remain as voided records and are excluded from totals. Adjust allocations at any time, or copy the previous month's allocations without overwriting existing allocations. Setting an allocation to zero stops budgeting money for it; hiding/removing a monthly allocation is not yet implemented.

## Storage and sync

Phone records and the pending-change outbox persist in SQLite. Connection credentials are saved in SecureStore. Server records are stored at `apps/server/data/budget.db` by default; set BUDGET_DATA_DIR to an absolute path to choose another location.

Sync uploads pending changes first and then fetches server records. Operation IDs prevent duplicate retries. Revision mismatches produce a conflict with explicit choices to use the other device's record or retry your local edit. After successful sync, the phone retains categories, the current month, the two prior months, and future entries. Unsynced data is never pruned. Full history remains on the computer. Browsing older server history on demand is not yet implemented. No cloud service or bank integration is used.

## Backups

The backup command loads the same `apps/server/.env` settings as the server:

```sh
pnpm --filter @budget/server exec tsx src/index.ts --backup
```

This creates a consistent timestamped SQLite backup in the data directory. Copy it to another disk. To restore, stop the server, preserve the existing database and any `-wal` / `-shm` sidecar files in a separate recovery directory, and copy the selected backup to `budget.db`. Restart the server and synchronize phones. Do not restore over a running database. Reconcile pending phone edits before restore; a restore is a recovery operation and can roll back revisions.

## Verification

```sh
pnpm typecheck
pnpm test
pnpm --filter @budget/mobile exec expo export --platform ios --platform android
```

Tests cover domain arithmetic, retention boundaries, server retries/conflicts, category history, invalid records and backup restoration. Device persistence, network permission behavior and visual layout require native testing.

## Organization

- `apps/mobile/src/screens`: screen composition.
- `apps/mobile/src/components`: shared controls, navigation, forms, record cards and tab panels, grouped by purpose.
- `apps/mobile/src/hooks`: household state and asynchronous action handling.
- `apps/mobile/src/styles` and `utils`: shared presentation styles, money/date formatting and allocation IDs.
- `apps/mobile/src/infrastructure`: phone persistence and synchronization adapters.
- `apps/server/src`: authenticated API and SQLite storage.
- `packages/contracts/src`: shared record validation and pure budgeting rules.
- `docs/requirements.md`: requirements and outstanding decisions.

Provisional defaults: calendar months, AUD, one shared household secret, three-month phone history, unlimited server history. Automatic background sync, per-person pairing, currency configuration, recurring bills, savings/transfers, rollover, receipt photos and remote access setup remain future work.

The server uses dotenv to load `.env` from its working directory (`apps/server` when launched with the documented pnpm commands). Existing environment variables take precedence. Keep the household secret only in the ignored `.env` file; `.env.example` contains no real secret.

## Expo launch mode troubleshooting

If you see “No development build (com.household.ourbudget) … is installed”, stop Metro and run `pnpm mobile` again. The default command explicitly starts Expo Go. Open the QR code in a compatible Expo Go client, or press `i` / `a` for an available simulator/emulator with Expo Go. In the Expo terminal, `s` switches launch modes; ensure it says “Using Expo Go”.

To use a custom development build instead, first install it using `pnpm --filter @budget/mobile ios` or `pnpm --filter @budget/mobile android`. Starting Metro alone does not install that build.
