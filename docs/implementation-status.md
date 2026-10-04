# Initial implementation status

Implemented 4 October 2026, following the user's implementation request and pnpm preference. Requirements remain a draft wherever product decisions are unanswered.

| Criteria | Implementation | Verification |
| --- | --- | --- |
| B01–B05 | Income with received date, category allocations, copying a prior month, editable/voidable expenses, totals and historical labels | Domain arithmetic and server history tests pass; native workflow not yet exercised |
| B06 | Mobile SQLite records and persistent pending-change outbox; manual sync and visible errors | iOS/Android bundles build; restart/offline behavior requires device verification |
| B07 | Server operation IDs, revision conflicts and mobile resolution choices | Server retry/conflict tests pass; multi-phone end-to-end test outstanding |
| B08 | Post-sync pruning to current and two prior months, preserving future entries; uploads finish before pruning | Retention boundary test passes; on-device database pruning unverified |
| B09 | Shared household bearer secret, SecureStore credentials, authenticated API | HTTP unauthorized-access integration test passes; device pairing/per-person access is deferred and initial authentication uses a manually configured secret |
| B10 | Consistent SQLite backup command and restore instructions | Backup/restored records equality test passes |
| B11 | Custom categories, rename/archive/restore and monthly amount edits | Server label-history test passes; UI verification outstanding |

Provisional decisions: calendar-month budgeting, AUD, full server history, manual LAN synchronization. Older history retrieval, hiding monthly allocation rows, automatic synchronization and pairing UI are not implemented. Budgets can be set to zero without erasing expense history. Income deletion is not included; correction is available.

Validation commands and setup are in README.md. Next action: launch on a target phone, configure the computer URL and shared secret, and verify salary → allocations → expenses → offline restart → sync; then test a second phone and conflicting edits.

Component organization updated at the user's request: mobile screen composition is in `src/screens/BudgetScreen.tsx`; presentation components are in `src/components`, controller state in `src/hooks`, and shared styles/helpers in `src/styles` and `src/utils`. No component source remains under `features/budget`. TypeScript, unused-symbol checks, existing tests and iOS/Android exports pass after extraction.
