# FarmProfit — Fixes & New Features

## How to run
**Easiest:** double-click / run the startup script — it builds the backend (first run only), starts it, and opens the frontend in your browser automatically.

- Windows: `start.bat`
- Mac/Linux: `./start.sh`

Demo login: `farmer@farmprofit.com` / `password123`

Manual alternative:
```
./mvnw clean package -DskipTests
java -jar target/farmprofit-1.0.0.jar
```
Then open `frontend/index.html` directly in your browser.

The backend runs on `http://localhost:8080` with context path `/api`.

---

## Root-cause bugs fixed

1. **JWT filter was never registered** (`SecurityConfig.java`) — the filter was `@Autowired` but never added to the security filter chain, so the `Authorization: Bearer <token>` header was never actually validated. Every request to `/farmer/expenses`, `/farmer/profit/calculate`, etc. hit the backend as "anonymous" and failed with "User not found," even with a valid token. **This was the #1 cause of Expenses/Profit/Reports not working.**

2. **`requireAuth()` checked the wrong localStorage key** (`frontend/js/api.js`) — it looked for `localStorage.getItem('user')`, a key that is never set anywhere. Login stores `token`/`userName`/`userEmail`/`userRole` instead. This meant visiting Expenses, Profit, or Reports immediately bounced you back to the login page even right after logging in successfully.

3. **Missing `/api` context path** (`frontend/js/api.js`) — `API_BASE_URL` was `http://localhost:8080` but the backend's context path is `/api` (see `application.properties`). Every call from Expenses/Profit/Reports 404'd.

4. **`apiRequest()` never sent the Authorization header** — even once the URL and auth-check were fixed, requests still went out with no token, so the backend still saw them as anonymous.

5. **Profit calculation silently showed 0 expenses.** Expenses were never linked to crops (the Add Expense form had no crop field), so the per-crop expense lookup in `ProfitController` always summed to 0 — meaning profit always equaled revenue exactly. Fixed by:
   - Adding an optional "Crop" dropdown to the Add/Edit Expense forms.
   - Making the backend fold *unassigned* ("General") expenses into the grand total instead of dropping them.

6. **`ddl-auto=create` + `data.sql` wiped all real data on every restart.** `data.sql` ran `DELETE FROM users/crops/expenses/government_schemes` on every startup (`spring.sql.init.mode=always`), destroying any real farmer's account and data and replacing it with just the demo accounts. Fixed by switching to `ddl-auto=update` and rewriting `data.sql` to use `MERGE INTO` (idempotent upsert) instead of destructive deletes.

7. **Expense date was always forced to "today"** on the backend regardless of what the client sent, making it impossible to log a backdated expense.

8. **Insecure fallback in `CropController`** — if no authenticated user was found, it silently returned the *first user in the whole database's* crops. Removed now that real authentication works.

9. **NaN/undefined crashes in Reports & Profit pages** — `.toFixed()` / `.toLocaleString()` called on `undefined` when margin or revenue was 0/missing. All guarded now with `Number(x || 0)`.

10. **Inefficient profit calculation** — re-fetched the *entire* expense list from the DB once per crop in a loop. Now fetched once and filtered in memory.

11. **H2 identity-counter collision** — all tables use `GenerationType.IDENTITY`, and the seed data (`data.sql`) inserted rows with hardcoded ids (1, 2, 3...). H2's internal identity counter isn't reliably advanced past explicitly-inserted ids, so the *next* real user to register (or crop/expense added) could be assigned a colliding id, causing a duplicate-key failure at save time — this silently broke registration and "Add Expense" with a generic/cryptic error. Fixed with `ALTER TABLE ... RESTART WITH (SELECT MAX(id)+1 ...)` after seeding, computed dynamically so it stays correct on every future restart too.

12. **Email case-sensitivity broke login for valid accounts** — `"User@Gmail.com"` at registration vs `"user@gmail.com"` at login were treated as different accounts, since email lookups were case-sensitive. Both register and login now normalize the email to lowercase before checking/storing it.

13. **A bad/expired JWT could 500 every request** — `JwtAuthenticationFilter` had no try/catch around token parsing; a malformed or expired token threw an uncaught exception that failed the *entire* request (not just auth) with a 500 error. Now it degrades gracefully to "not authenticated."

14. **Hung requests could leave the UI looking permanently stuck** — `apiRequest()` had no timeout, so if the backend wasn't running or a request hung, the page just sat there with the modal open and no feedback. Added a 15s timeout with a clear error message.

---

## Extra features added

- **Edit Expense** — previously you could only add or delete an expense, never correct one.
- **Link expenses to a crop** — optional dropdown when adding/editing an expense.
- **Expense category summary** (`/farmer/expenses/summary`) — breakdown badge showing totals per category on the Expenses page.
- **Date-range / crop filters** on `GET /farmer/expenses`.
- **Profit history & trend chart** (`/farmer/profit/history`) — the backend was already saving a `Profit` record on every calculation but nothing ever displayed it; now there's a line chart of profit over time on the Profit page.
- **"General" expense tracking** — the Profit page now separately shows unassigned/general costs vs. crop-specific costs.
- **Full Farm Report** — a new combined report (crops + expenses + profit) in one document, in addition to the existing three separate reports.
- **One-command startup scripts** (`start.sh` / `start.bat`) that build, run the backend, wait for it to be healthy, and open the frontend automatically.

---

## Notes
- This sandbox has no network access to Maven Central, so the project could not be compiled/packaged here — `./mvnw clean package` will do it the first time you run `start.sh`/`start.bat` (needs an internet connection once, to download dependencies).
- Stale local H2 database files and a corrupted `error.txt` from a previous run were removed; the app will create a fresh `farmprofitdb.mv.db` on first run.
