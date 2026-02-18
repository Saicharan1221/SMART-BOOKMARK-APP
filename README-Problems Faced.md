## ⚠️ Problems Faced & How I Solved Them

This project involved several real-world debugging challenges.

---

### 1️⃣ Supabase URL DNS Error

#### ❌ Problem
While implementing Google login, I encountered:

```
DNS_PROBE_FINISHED_NXDOMAIN
```

#### 🔎 Root Cause
I manually constructed the Supabase project URL using the Project ID instead of using the correct REST URL.

#### ✅ Solution
Navigated to:

```
Supabase → Settings → Data API
```

Copied the correct REST URL and updated `.env.local`.

After restarting the development server, authentication worked correctly.

---

### 2️⃣ Google OAuth Redirect URI Mismatch

#### ❌ Problem
Google OAuth login failed with redirect mismatch errors.

#### 🔎 Root Cause
The Supabase callback URL was not added correctly in Google Cloud Console.

#### ✅ Solution
In Google Cloud:

```
APIs & Services → Credentials → OAuth Client
```

Added:

- Authorized JavaScript Origin → `http://localhost:3000`
- Authorized Redirect URI → Supabase callback URL

This fixed the OAuth issue.

---

### 3️⃣ React Form Reset Error

#### ❌ Problem
After inserting bookmarks, I received:

```
Cannot read properties of null (reading 'reset')
```

#### 🔎 Root Cause
React synthetic events are pooled. After `await`, `e.currentTarget` became null.

#### ✅ Solution
Stored the form reference before awaiting:

```ts
const form = e.currentTarget
await supabase.from(...).insert(...)
form.reset()
```

---

### 4️⃣ Realtime Not Updating

#### ❌ Problem
Bookmarks did not update in another tab automatically.

#### 🔎 Root Cause
Realtime was not enabled for the table.

#### ✅ Solution
Enabled Realtime in:

```
Supabase → Table Editor → bookmarks → Enable Realtime
```

Then added a Supabase channel subscription in the frontend to listen for database changes.
