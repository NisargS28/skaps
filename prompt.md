You are a senior full-stack developer helping me build a Phase 1 MVP of an internal company chatbot web application.

CONTEXT:
This is Phase 1 of a RAG-based chatbot system. For now, DO NOT implement real AI or backend logic. Only build the frontend UI and simulate responses with mock data.

TECH STACK:
- Next.js (App Router)
- React with TypeScript
- Tailwind CSS
- Use modern component-based architecture

GOAL:
Build a fully functional chat UI that simulates a chatbot.

FEATURES REQUIRED:

1. Layout:
- Full-page layout with:
  - Top Navbar
  - Left Sidebar
  - Main Chat Area
  - Bottom Input Box

2. Navbar:
- App name/logo (e.g., "SKAPS AI")
- Workspace dropdown (HR, Finance, Exim, IT)
- User profile icon (dummy)

3. Sidebar:
- Button: "+ New Chat"
- List of workspaces (HR, Finance, Exim, IT)
- Chat history list (dummy items)
- Highlight active workspace

4. Chat Area:
- Display messages in conversation format
- User messages aligned right (blue bubble)
- Bot messages aligned left (gray bubble)
- Messages stored in React state
- Scrollable chat container

5. Message Input:
- Text input field
- Send button
- Press Enter to send message

6. Mock Chat Logic:
- When user sends message:
  - Add user message to state
  - Simulate bot response with delay (setTimeout)
  - Bot replies with:
    "This is a simulated response for: <user message>"
- Show "Bot is typing..." while waiting

7. Suggested Questions:
- Show clickable suggestions like:
  - "Leave policy"
  - "Salary structure"
  - "Export rules"

8. Clean UI:
- Use Tailwind styling
- Good padding, spacing, and responsive layout
- Make sure it looks modern (like ChatGPT-style UI)

9. Component Structure:
Break code into components:
- Navbar.tsx
- Sidebar.tsx
- ChatWindow.tsx
- MessageBubble.tsx
- ChatInput.tsx

10. State Management:
- Use React useState for messages
- Each message:
  {
    id: string,
    role: "user" | "bot",
    text: string
  }

11. Folder Structure:
app/
  page.tsx
components/
  Navbar.tsx
  Sidebar.tsx
  ChatWindow.tsx
  ChatInput.tsx
  MessageBubble.tsx

12. Make sure:
- Code is clean and readable
- Fully functional (no placeholders)
- Fully responsive (desktop + mobile basic support)

DO NOT:
- Do not add real backend
- Do not add database
- Do not add authentication yet

OUTPUT:
Generate the full working Next.js frontend code for this Phase 1 MVP.