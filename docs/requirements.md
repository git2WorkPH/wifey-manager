# Household budget app — requirements draft

Status: draft for discussion, 4 October 2026. Source: initial user request in this chat. The workspace initially contained only an empty Git repository on main. Initial implementation now exists; see [implementation status](implementation-status.md) for current evidence and gaps. The tables below preserve the original assessment.

## Goal and confirmed constraints

When salary arrives, distribute it across monthly expense categories and track actual spending against those allocations. Use TypeScript, Expo and React Native. Run the server and store its data on the user's own computer. Keep mobile storage bounded, with approximately three months of data as the initial target. Use maintainable application architecture.

User follow-up: expenses must be customizable because they change over time. This includes user-defined expense categories and adjustable monthly allocations; categories must not be hard-coded.

## Proposed first release

The following behavior is proposed, pending the decisions below:

| ID | Requirement | Acceptance example | Current evidence |
| --- | --- | --- | --- |
| B01 | Record income with amount, received date and budget period. Allow multiple income entries per period. | Two salary entries of 2,000 give period income of 4,000. | Missing implementation |
| B02 | Create a monthly plan with named categories and allocated amounts; optionally copy the previous plan. | Allocate 1,500 to rent and 500 to groceries; from 4,000 income, show 2,000 unallocated. | Missing implementation |
| B03 | Record an expense with amount, category, occurrence date and optional note. Allow corrections and explicit deletion. | A 75 grocery expense appears in history and reduces grocery remaining by 75. | Missing implementation |
| B04 | Show budget, actual spending and remaining amount per category and for the period. | With a 500 budget and 575 spent, show remaining −75 and an overspent indicator. | Missing implementation |
| B05 | Preserve each period's plan independently. Changing a future plan must not alter past plans. | Copy October into November, change November rent, and October stays unchanged. | Missing implementation |
| B06 | Save entries locally and queue synchronization while offline. Show pending, synced and failed status. | With the server off, an expense survives restarting the app and syncs after reconnection. | Missing implementation |
| B07 | Synchronize with a server on the user's computer without creating duplicate entries on retries. | Retrying the same operation twice produces one expense and the same total. | Missing implementation |
| B08 | Bound mobile history using a configurable recent-period window, provisionally current month plus two prior months. | Older synchronized records leave the local cache; pending edits are retained until safely synced. | Missing implementation; retention decision open |
| B09 | Protect household data through device authorization and server access checks. | An unpaired device cannot retrieve or edit the household ledger. | Missing implementation |
| B10 | Support server backups and a documented restore procedure. | A restored backup reproduces the income, budgets and expense totals. | Missing implementation |
| B11 | Let users create and rename expense categories, choose which categories to include each period, and adjust their allocated amounts. Propose archiving categories that are no longer needed. | Add “Car repairs” mid-month with a 300 allocation; rename it for future use; next month omit it and increase groceries. Previous period records remain intact. | Customization requested; missing implementation; archiving behavior proposed |

## Calculation and data rules

- Store money as integer minor units, such as cents; never use floating-point arithmetic for totals. One household currency is proposed for the first release; the actual currency is undecided.
- Period income = sum of income assigned to that period. Allocated = sum of category budgets. Unallocated = income − allocated. Category remaining = category budget − expenses assigned to that category and period.
- Keep unallocated income separate from unspent category budgets. Flag allocation exceeding income without silently changing amounts.
- Use occurrence dates and household timezone to select the expense period, rather than synchronization time. Preserve dates across devices.
- Budget edits must not change expenses. Whether unused allocations roll forward is an open decision; no automatic rollover is proposed initially.
- Categories have stable IDs independent of their names. Propose storing the category label on each period's budget so renaming a category does not rewrite historical reports.
- Users may add categories and change allocations during the active period; recalculate remaining and unallocated amounts immediately. Reducing an allocation below spending shows overspending and preserves recorded expenses.
- Propose archiving unused categories so they are unavailable for new allocations or expenses but remain visible in history. Existing expenses remain editable. Do not cascade-delete expenses when a category is archived; permanent category deletion behavior remains undecided.
- Local cache eviction is separate from user deletion. Never evict unsynchronized changes. Permanent server history deletion requires an explicit retention decision.
- Give records stable IDs, revision numbers and timestamps. Concurrent changes to the same record must produce a visible conflict for resolution rather than silently losing an edit.

## Proposed architecture

Use a TypeScript monorepo with `apps/mobile`, `apps/server` and `packages/contracts`. The mobile app uses Expo and React Native; the local server uses Node.js and a REST API. Use SQLite on the server and `expo-sqlite` on each phone. Server data is the authoritative shared history; mobile SQLite supplies offline reads, writes and a synchronization outbox.

Organize by features such as income, budgets, expenses, household and synchronization. Within each feature, keep React screens/components in presentation, operations in application services, money/budget rules in domain modules, and database/network adapters in infrastructure. Keep pure budget calculations independent of React and database code. Share validated API contracts, not database access or UI code, between mobile and server. This is a proposed feature-based layered architecture, not a mandated React Native standard.

Keep temporary UI state in React. Keep persisted financial records in SQLite. Route screens through Expo Router if selected during implementation. Avoid introducing a global state library until a concrete need is established.

Synchronization needs an outbox, idempotent operations, server revisions, conflict handling and deletion tombstones. Cache pruning must not erase pending operations or cause deleted records to reappear.

## Local server and storage behavior

Start with connection over home Wi-Fi using a configured computer hostname/address. A phone cannot reach the computer through the phone's `localhost`. The computer must be running and reachable for synchronization. Access away from home is an open requirement; if needed, propose a private VPN and authenticated encrypted transport rather than exposing the API directly to the internet.

Keep full history on the computer as a proposal and only recent periods on mobile. Older history could be retrieved while connected if requested. Do not choose retention based on an assumed SQLite capacity: measure database size and define a storage target before adding size-driven pruning. Receipt photos are outside the initial scope and would need a separate storage policy.

## Open decisions

1. One phone or two phones sharing a household ledger?
2. Calendar months or periods beginning at each payday?
3. Full server history with a three-month mobile cache, or three-month retention everywhere?
4. Household currency, target devices (iOS/Android/both), and salary frequency?
5. Home Wi-Fi only or synchronization away from home?
6. Should savings, money transfers, refunds, recurring bills, rollover and split-category purchases be included in the first release? Proposed initial scope is manual income, category budgets and expenses; these additions remain undecided.

## Verification plan

Verify money calculations and period boundaries with domain tests. Verify database persistence and schema migrations with integration tests. Exercise offline entry, restart, reconnect, duplicate retries, two-device conflicts if applicable, and pruning with pending edits. Demonstrate a full salary → allocation → expense → remaining workflow on the chosen phone platforms. Verify unauthorized access is denied and backup restoration preserves totals. The original assessment preceded implementation. Current verification results are recorded in implementation-status.md.

For B11, verify adding a category during a period, editing its allocation below actual spending, renaming without rewriting prior reports, and excluding a category from a future period. If archiving is accepted, verify it preserves historical expenses and totals.

## Reference material

- Expo local-first guide: https://docs.expo.dev/guides/local-first/
- Expo SQLite documentation: https://docs.expo.dev/versions/latest/sdk/sqlite/
- React Native TypeScript guidance: https://reactnative.dev/docs/typescript

Package and SDK versions must be checked when scaffolding; none are pinned by this draft.

## Accepted component organization update

The user requested that components be split and moved out of `features/budget`. Mobile presentation now uses `screens`, `components` grouped by purpose, `hooks`, `styles` and `utils`; SQLite/network access remains in `infrastructure` and shared domain rules remain in `packages/contracts`. This supersedes the proposed feature-folder layout for mobile presentation.
