# ChatGPT App (Next.js + Gemini APIs + Supabase/Firebase)
## Next.js


## Gemini
- API Key which is created on Google Cloud Console where billing account is created

NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDcFmEWWjr_NR6I4bThBTI9PbEssLF1Dvw

## Supabase
```sql
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);
```

```sql
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text check (role in ('user', 'assistant')),
  content text,
  title text,
  created_at timestamp with time zone default now()
);
```

```sql
CREATE POLICY "Allow authenticated select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads');
```

## Firebase
- `Create New Project` on Firebase. Then, go to `Project Settings` and scroll to `Your apps`. Click `Add app` button when there is no app yet, then copy below.

```json
const firebaseConfig = {
    apiKey: "AIzaSyCrYQ57QhdFf0WefHMn0Fuz4f3xWxh3bH0",
    authDomain: "chatgptapp-f3eac.firebaseapp.com",
    projectId: "chatgptapp-f3eac",
    storageBucket: "chatgptapp-f3eac.firebasestorage.app",
    messagingSenderId: "629408539540",
    appId: "1:629408539540:web:a77f420478a22dabb0a581",
    measurementId: "G-66990FX4DQ"
};
```

- Build `Authentication` for managing users, `Firestore Database` for managing chat history, `Storage` for managing uploaded files

To upgrade your project to use `Storage`, consider you're using gmail which has already Billing account as using Gemini.