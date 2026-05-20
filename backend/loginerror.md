You are a senior full-stack developer. I have a Next.js chatbot application. Currently, when I run npm run dev, the app opens the chatbot page directly before login because it is using user data from localStorage. This is wrong.

I want to fix the authentication flow properly.

PROJECT CONTEXT:
- Frontend: Next.js with TypeScript
- Components are inside src/components
- App routes are inside src/app
- Backend will be FastAPI
- Database is PostgreSQL
- users table already exists with:
  - id
  - name
  - email
  - department
  - role
  - password_hash
  - created_at

IMPORTANT REQUIREMENT:
Do NOT authenticate user directly from localStorage.
Do NOT trust localStorage as logged-in user source.
User must be authenticated only through backend/database login API.

GOAL:
Implement proper login flow:
1. User opens application
2. If user is not authenticated, redirect to /login
3. User enters email and password
4. Frontend sends credentials to backend API
5. Backend validates user from PostgreSQL
6. If login is successful, backend returns user data and auth token
7. Frontend stores token only, not fake user object
8. Frontend redirects user to /chat
9. Chatbot page should be protected
10. If token is missing or invalid, redirect to /login

FRONTEND REQUIREMENTS:

1. Create /login page:
- Path: src/app/login/page.tsx
- Add login form with:
  - email input
  - password input
  - submit button
  - error message area
- On submit, call backend:
  POST http://localhost:8000/auth/login
- Request body:
  {
    "email": "admin@company.com",
    "password": "admin123"
  }

2. Create protected chatbot route:
- If current chatbot is at src/app/page.tsx, modify it so it checks authentication.
- Better approach:
  - /login for login page
  - /chat for chatbot page
  - / should redirect:
    - to /chat if authenticated
    - to /login if not authenticated

3. Remove old localStorage user login logic:
- Search all files where localStorage stores or reads "user"
- Remove logic that directly logs user in from localStorage
- Only allow token/session based access

4. Token storage:
- For now, store backend token in localStorage as:
  localStorage.setItem("auth_token", token)
- Store user data only after successful backend response if needed:
  localStorage.setItem("auth_user", JSON.stringify(user))
- But never use hardcoded/fake localStorage user as authentication source.

5. Add auth utility file:
Create:
src/lib/auth.ts

It should include:
- getToken()
- getUser()
- isAuthenticated()
- logout()

Example behavior:
- isAuthenticated() returns true only if auth_token exists
- logout() clears auth_token and auth_user

6. Add protected route behavior:
On /chat page:
- Check auth_token on component mount
- If token does not exist, redirect to /login
- If token exists, show chatbot UI

7. Update Navbar:
- Show logged-in user name/email from auth_user only after login
- Add Logout button
- Logout should:
  - clear auth_token
  - clear auth_user
  - redirect to /login

8. API call structure:
Create:
src/lib/api.ts

Add login function:
async function login(email: string, password: string) {
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json();
}

BACKEND EXPECTED RESPONSE:
Assume backend returns:
{
  "access_token": "jwt_or_dummy_token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@company.com",
    "department": "IT",
    "role": "admin"
  }
}

9. Login success flow:
- Save access_token as auth_token
- Save user object as auth_user
- Redirect to /chat

10. Login failure:
- Show message:
  "Invalid email or password"

11. UI:
- Use existing design style
- Use Tailwind CSS
- Make login page clean and centered
- Do not break existing chatbot UI

12. Important:
- Do not implement Microsoft SSO yet
- Do not implement RAG yet
- Do not implement real JWT validation in frontend yet
- Only fix frontend auth flow and prepare it for backend database-based login

OUTPUT:
Generate/modify the required files:
- src/app/login/page.tsx
- src/app/page.tsx
- src/app/chat/page.tsx if needed
- src/lib/auth.ts
- src/lib/api.ts
- Update Navbar.tsx
- Update chatbot page protection
- Remove fake localStorage login usage

Make sure after running npm run dev:
- User first sees login page
- User cannot access chatbot without login
- After valid login response, user redirects to chatbot
- Logout returns user to login page