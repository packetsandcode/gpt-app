# ChatGPT App (Next.js + Gemini APIs + Supabase/Firebase)
## Next.js

### Tailwindcss
```cmd
npm install -D tailwindcss@3.3.2 postcss autoprefixer @tailwindcss/postcss

npm exec tailwindcss3.3.2 init -p
```
To generate tailwind.config.js file, have to use tailwindcss version 3.3.2, not latest version like 4.1.10.

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

- When you show below error while handling Storage in Firebase
Error: Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/chatgptapp-f3eac.firebasestorage.app/o?name=uploads%2FMartinSingerResume.pdf' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
uploadFileToFirebase.ts:8 

1. install GoogleCloudSDKInstaller.exe
2. gsutil cors set cors.json gs://your-storage-bucket-name
* Storage → Files → Bucket Details

- Build `Authentication` for managing users, `Firestore Database` for managing chat history, `Storage` for managing uploaded files

To upgrade your project to use `Storage`, consider you're using gmail which has already Billing account as using Gemini.


# Broker
https://docs.google.com/document/d/1Mhz0N_pys1_8zFduKwIZOaHjFehgGMNHMH5EjwnKeM8/edit?usp=sharing

# Tech Experience
- git ls-remote https://github.com/icons8/line-awesome.git
- Even if the HTTP request completes successfully (status 200), there might be a problem with a catch-all error handler or with a response interceptor in Angular.
- If you have any HTTP interceptors set up (common in Angular apps for handling tokens, logging, etc.), verify that the logic inside them is not causing an issue.
  -> Error Code: undefined Message : Failed to execute 'opn' on 'XMLHttpRequest': Invalid URL
- When handling CSRF token or Cookies, have to consider 'Cookies' of 'Application' tab - Chrome DevTool
  -> 403 Forbidden Error
- PathLocationStrategy (not hash routing)
  not use hash mode
- ?access=...&refresh=... exposes sensitive data like tokens in server logs, browser history, and potentially in network proxies. That's why OAuth best practices recommend using URL fragments (#), not query strings (?), for client-side token delivery
- when implementing ChatGPT(including Auth) throw Supabase, it muse need to do phone verify on Gmail account. But it's not necessary for Firebase.
- CORS configuration and file uploads (via Firebase Storage) can be annoying unless you're on a Blaze (paid) plan.
- when integrate with GPT-4 or GPT-4o, it must need payment credential on OpenAI's API. But it's not necessary for GPT-3.5.
  https://gemini.google.com/u/2/app
- there's time when have to change variable name in .env file
- APIs for ChatGPT
  OpenAI's GPT (ChatGPT API), Google Gemini/Generative Language API, Hugging Fae Inference API, Open Source Models(Self-hosted)

- framework : Inversion of Control - flow of control and flow of data is managed by it
- library : collection of related functionality
- module : 
it only provides a single piece of functionality - library contain module
implementation and interface (abstract interface with explicit exports and imports) are separate

- .tsx : Supports JSX syntax
it makes it easier to quickly identify files that contain UI components ( lets us to write HTML-like code inside TS )
it improves code organization, readability in larger projects
- .ts : pure TS logic, types/interfaces, utilities, configs, helpers

- node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Data Science
1. Define the Problem
2. Collect the Data
3. Clean and Explore
4. Model and Analyze
5. Visualize and Report
6. Deploy or Share Insights

# Job Types
Full-time
Part-time
Temporary
Internship
Non-tenure
Contract
Freelance
Permanent
Temp-to-hire
PRN

- if there's a mutual fit, ...

# Telegram
+1 615 559 8727

# English Words
leisure time
insufficient privileges
grant
stock market
concise and casual words