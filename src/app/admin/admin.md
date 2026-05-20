IMPORTANT: BEFORE starting, read all the requirements carefully and understand them completely, then check existing files and structure, if required you can modify or create new files. Do not whole in once, build in phases.

You are a senior full-stack developer. Build a professional company-grade Admin Dashboard for my internal AI chatbot web app named "SKAPS AI".

PROJECT CONTEXT:
- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Backend: FastAPI + PostgreSQL
- Existing app already has:
  - Login page
  - Chatbot page
  - User profile dropdown
  - Settings modal
  - Role-based user stored as auth_user after login
- Users have roles:
  - admin
  - manager
  - employee
- Only admin users should access the Admin Dashboard.
- For now, create the frontend admin UI with mock data, but structure it so backend APIs can be connected later.

MAIN GOAL:
Create a professional Admin Dashboard for company usage where admin can monitor users, workspaces, knowledge base documents, chat usage, token usage, system settings, audit logs, and analytics.

FOLDER STRUCTURE:
Create separate admin folders:

src/app/admin/page.tsx
src/app/admin/users/page.tsx
src/app/admin/workspaces/page.tsx
src/app/admin/knowledge-base/page.tsx
src/app/admin/analytics/page.tsx
src/app/admin/settings/page.tsx
src/app/admin/audit-logs/page.tsx

src/components/admin/AdminLayout.tsx
src/components/admin/AdminSidebar.tsx
src/components/admin/AdminHeader.tsx
src/components/admin/StatCard.tsx
src/components/admin/RecentActivity.tsx
src/components/admin/TopTokenUsers.tsx
src/components/admin/UsersTable.tsx
src/components/admin/WorkspacesGrid.tsx
src/components/admin/DocumentsTable.tsx
src/components/admin/AnalyticsPanel.tsx
src/components/admin/SystemSettingsPanel.tsx
src/components/admin/AuditLogsTable.tsx

ADMIN ACCESS CONTROL:
- Read auth_user from localStorage for now.
- If no user exists, redirect to /login.
- If user.role !== "admin", show a clean "Access Denied" page with:
  - Message: "You do not have permission to access Admin Dashboard."
  - Button: "Back to Chat"
- If user.role === "admin", show admin dashboard.
- Later backend will also protect admin APIs, but for now do frontend guard.

ADMIN LAYOUT:
Create a professional layout:
- Left sidebar fixed
- Top header
- Main content area
- Light, clean company dashboard design
- Use Tailwind CSS only
- Make responsive for laptop and desktop
- Sidebar menu items:
  - Dashboard
  - Users
  - Workspaces
  - Knowledge Base
  - Analytics
  - Audit Logs
  - System Settings
  - Back to Chat

ADMIN DASHBOARD PAGE:
Route: /admin

Show summary KPI cards:
1. Total Users
2. Active Users Today
3. Total Chat Sessions
4. Knowledge Base Documents
5. Active Workspaces
6. Pending Documents
7. Failed Queries
8. Average Response Time
9. Total Tokens Used
10. Storage Used

Use professional cards with:
- icon
- title
- value
- small trend indicator
- clean border/shadow

Also show:
- Recent Activity panel
- Top 5 Token Users panel
- Department-wise usage preview
- System Health panel

IMPORTANT DASHBOARD DESIGN DECISION:
- Keep token usage summary on dashboard.
- Move detailed token usage analysis to Analytics page.
- Show only Top 5 token users on dashboard.

USERS PAGE:
Route: /admin/users

Create a user management page with:
- Search input
- Department filter
- Role filter
- Status filter
- Add User button
- Users table columns:
  - Name
  - Email
  - Department
  - Role
  - Status
  - Last Login
  - Actions
- Actions:
  - View
  - Edit
  - Disable
  - Reset Password
- Use mock data for now.
- Status badges:
  - active
  - inactive
  - disabled

WORKSPACES PAGE:
Route: /admin/workspaces

Create workspace management UI for:
- HR
- Finance
- Exim
- IT

Each workspace card should show:
- Workspace name
- Description
- Status
- User count
- Document count
- Chat session count
- Last updated date
- Actions:
  - View
  - Edit
  - Disable

Add:
- Add Workspace button
- Workspace status badge

KNOWLEDGE BASE PAGE:
Route: /admin/knowledge-base

This page is for admin-uploaded company documents only.

Create UI with:
- Upload document card
- Workspace selector
- Drag and drop upload area
- Supported types note: PDF, DOCX, XLSX, TXT
- Documents table with columns:
  - Document Name
  - Workspace
  - Uploaded By
  - File Size
  - Processing Status
  - Embedding Status
  - Chunks
  - Uploaded Date
  - Actions

Statuses:
- processing
- completed
- failed
- deleted

Embedding statuses:
- pending
- embedded
- failed

Actions:
- View
- Reprocess
- Delete

IMPORTANT:
Knowledge Base documents are different from chat attachments.
Knowledge Base documents are uploaded by admin only and used for RAG.

ANALYTICS PAGE:
Route: /admin/analytics

Create analytics UI with:
- Date range selector
- Workspace filter
- Cards:
  - Total Queries
  - Successful Answers
  - Failed Queries
  - Average Response Time
  - Prompt Tokens
  - Completion Tokens
  - Total Tokens
  - Estimated Cost placeholder
- Top Questions list
- No-answer Queries list
- Department-wise usage bars
- Token usage by user table
- Response time trend placeholder
- Usage by workspace section

Token usage fields:
- prompt_tokens
- completion_tokens
- total_tokens

AUDIT LOGS PAGE:
Route: /admin/audit-logs

Create audit logs UI with:
- Search input
- Action filter
- Entity type filter
- Date filter
- Table columns:
  - User
  - Action
  - Entity Type
  - Entity ID
  - IP Address
  - Timestamp
  - Details
- Mock actions:
  - USER_LOGIN
  - USER_CREATED
  - USER_ROLE_UPDATED
  - DOCUMENT_UPLOADED
  - DOCUMENT_DELETED
  - WORKSPACE_CREATED
  - SYSTEM_SETTING_UPDATED
  - FAILED_LOGIN
- Details can be shown in a small expandable JSON-like preview.

SYSTEM SETTINGS PAGE:
Route: /admin/settings

Create system settings UI with sections:

1. File Upload Rules:
- Allowed file types
- Max upload size MB
- Chat attachment retention days
- Enable chat attachments toggle

2. AI / LLM Settings:
- Default LLM model
- Default embedding model
- Enable source references toggle
- Response timeout seconds
- Max context chunks

3. Security Settings:
- Require login toggle
- Admin-only KB upload toggle
- Enable audit logging toggle
- Failed login limit

4. Data Retention:
- Chat history retention days
- Chat attachment retention days
- Audit log retention days

5. System Prompt:
- Textarea for default system instruction
- Save button

Use mock state for now. Do not connect backend yet.

NAVBAR UPDATE:
Update existing main Navbar profile dropdown:
- If logged-in user role is "admin", show "Admin Dashboard" menu item.
- Clicking it should navigate to /admin.
- Employees should not see Admin Dashboard item.

UI STYLE:
- Match existing SKAPS AI design.
- Use white background, light gray borders, rounded-xl cards, subtle shadows.
- Use blue/purple/green accent colors.
- Use professional enterprise dashboard style.
- Do not make it look like a toy/demo.
- Use clean spacing and responsive grid.
- Avoid too much clutter.
- Use mock charts with progress bars/cards if chart library is not installed.

DATABASE SCHEMA:
Also create a backend SQL file or documentation section containing the recommended PostgreSQL schema for admin dashboard and analytics.

Include SQL queries for:

1. Improve users table:
- status
- last_login_at
- updated_at

2. Create workspaces table
3. Create chat_sessions table
4. Create chat_messages table with:
- sources JSONB
- prompt_tokens
- completion_tokens
- total_tokens
- response_time_ms
- status

5. Create chat_attachments table
6. Create documents table for Knowledge Base documents
7. Create document_chunks table
8. Create user_settings table
9. Create system_settings table
10. Create audit_logs table
11. Create analytics_daily_summary table

Use these SQL queries:

ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'active',
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO workspaces (name, description)
VALUES
('HR', 'Human Resources policies and employee support'),
('Finance', 'Finance, invoices, reimbursements and accounting support'),
('Exim', 'Export and import documentation and compliance support'),
('IT', 'IT support, systems, access and infrastructure support')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INT REFERENCES workspaces(id) ON DELETE SET NULL,
    title VARCHAR(255),
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('user', 'bot', 'system')),
    message TEXT,
    sources JSONB,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    response_time_ms INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_attachments (
    id SERIAL PRIMARY KEY,
    message_id INT REFERENCES chat_messages(id) ON DELETE CASCADE,
    session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    original_file_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    extracted_text TEXT,
    upload_status VARCHAR(50) DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    workspace_id INT REFERENCES workspaces(id) ON DELETE SET NULL,
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255),
    original_file_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    processing_status VARCHAR(50) DEFAULT 'processing',
    embedding_status VARCHAR(50) DEFAULT 'pending',
    chunk_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT,
    chunk_text TEXT,
    vector_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    font_size VARCHAR(20) DEFAULT 'medium',
    default_workspace VARCHAR(50) DEFAULT 'HR',
    show_source_refs BOOLEAN DEFAULT TRUE,
    auto_scroll BOOLEAN DEFAULT TRUE,
    show_suggested_questions BOOLEAN DEFAULT TRUE,
    show_uploaded_files BOOLEAN DEFAULT TRUE,
    custom_instructions_enabled BOOLEAN DEFAULT FALSE,
    saved_memories_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    updated_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
VALUES
('allowed_file_types', 'pdf,docx,xlsx,txt,png,jpg,jpeg', 'string', 'Allowed upload file types'),
('max_upload_size_mb', '10', 'number', 'Maximum upload size in MB'),
('chat_attachment_retention_days', '30', 'number', 'Retention period for chat attachments'),
('source_references_enabled', 'true', 'boolean', 'Enable source references in bot responses'),
('chat_attachments_enabled', 'true', 'boolean', 'Allow users to upload files in chat'),
('default_llm_model', 'llama3', 'string', 'Default local LLM model'),
('default_embedding_model', 'all-MiniLM-L6-v2', 'string', 'Default embedding model')
ON CONFLICT (setting_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_daily_summary (
    id SERIAL PRIMARY KEY,
    summary_date DATE NOT NULL,
    workspace_id INT REFERENCES workspaces(id) ON DELETE SET NULL,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_chat_sessions INT DEFAULT 0,
    total_messages INT DEFAULT 0,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    failed_queries INT DEFAULT 0,
    avg_response_time_ms INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(summary_date, workspace_id)
);

DASHBOARD SQL QUERIES:
Also include these queries in comments or documentation for later backend API use:

Total users:
SELECT COUNT(*) AS total_users FROM users;

Active users today:
SELECT COUNT(DISTINCT user_id) AS active_users_today
FROM chat_sessions
WHERE DATE(created_at) = CURRENT_DATE;

Total chat sessions:
SELECT COUNT(*) AS total_chat_sessions FROM chat_sessions;

KB documents:
SELECT COUNT(*) AS total_kb_documents
FROM documents
WHERE processing_status != 'deleted';

Active workspaces:
SELECT COUNT(*) AS active_workspaces
FROM workspaces
WHERE status = 'active';

Pending documents:
SELECT COUNT(*) AS pending_documents
FROM documents
WHERE processing_status IN ('processing', 'pending');

Failed queries:
SELECT COUNT(*) AS failed_queries
FROM chat_messages
WHERE sender = 'bot'
AND status = 'failed';

Average response time:
SELECT ROUND(AVG(response_time_ms), 2) AS avg_response_time_ms
FROM chat_messages
WHERE sender = 'bot'
AND response_time_ms > 0;

Total token usage:
SELECT
    COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
    COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
    COALESCE(SUM(total_tokens), 0) AS total_tokens
FROM chat_messages;

Token usage by user:
SELECT
    u.id,
    u.name,
    u.email,
    u.department,
    COALESCE(SUM(cm.prompt_tokens), 0) AS prompt_tokens,
    COALESCE(SUM(cm.completion_tokens), 0) AS completion_tokens,
    COALESCE(SUM(cm.total_tokens), 0) AS total_tokens
FROM users u
JOIN chat_sessions cs ON cs.user_id = u.id
JOIN chat_messages cm ON cm.session_id = cs.id
GROUP BY u.id, u.name, u.email, u.department
ORDER BY total_tokens DESC
LIMIT 10;

Department-wise usage:
SELECT
    w.name AS workspace,
    COUNT(DISTINCT cs.id) AS chat_sessions,
    COUNT(cm.id) AS total_messages,
    COALESCE(SUM(cm.total_tokens), 0) AS total_tokens
FROM workspaces w
LEFT JOIN chat_sessions cs ON cs.workspace_id = w.id
LEFT JOIN chat_messages cm ON cm.session_id = cs.id
GROUP BY w.name
ORDER BY total_tokens DESC;

Recent activity:
SELECT
    al.id,
    u.name AS user_name,
    al.action,
    al.entity_type,
    al.details,
    al.ip_address,
    al.created_at
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 10;

TOKEN USAGE SOURCE:
In comments/documentation explain:
- Token usage should be captured from the LLM backend response.
- If using Ollama, map:
  - prompt_eval_count to prompt_tokens
  - eval_count to completion_tokens
  - total = prompt_tokens + completion_tokens
- If token counts are unavailable, estimate tokens temporarily using word count.
- Store token usage in chat_messages for every bot response.

IP ADDRESS SOURCE:
In comments/documentation explain:
- IP address should be captured in FastAPI using Request.
- Use request.client.host for local development.
- In production behind proxy, check x-forwarded-for or x-real-ip headers.
- Store IP mainly in audit_logs and optionally in chat_sessions.

IMPORTANT:
- Do not implement real backend APIs yet unless necessary.
- Use mock data in frontend.
- Do not break existing chatbot UI.
- Keep admin UI separate from chatbot UI.
- Make the UI professional, clean, scalable, and company-ready.
