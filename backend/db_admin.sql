-- =============================================================
-- SKAPS AI — Admin Dashboard Schema
-- Created for admin dashboard, analytics, audit logs, etc.
-- This file contains NEW tables and ALTER statements.
-- DO NOT drop or recreate existing tables.
-- =============================================================

-- =============================================================
-- 1. ALTER EXISTING TABLES (add missing columns)
-- =============================================================

-- Users: add status, last_login_at, updated_at
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Chat Messages: add token tracking and response metrics
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS prompt_tokens INT DEFAULT 0;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS completion_tokens INT DEFAULT 0;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS total_tokens INT DEFAULT 0;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS response_time_ms INT DEFAULT 0;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'success';

-- Chat Sessions: add ip_address, updated_at
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100);

ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Chat Attachments: add session_id, user_id references
ALTER TABLE chat_attachments
ADD COLUMN IF NOT EXISTS session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE;

ALTER TABLE chat_attachments
ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;

-- =============================================================
-- 2. NEW TABLES
-- =============================================================

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'active',
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default workspaces
INSERT INTO workspaces (name, description)
VALUES
('HR', 'Human Resources policies and employee support'),
('Finance', 'Finance, invoices, reimbursements and accounting support'),
('Exim', 'Export and import documentation and compliance support'),
('IT', 'IT support, systems, access and infrastructure support')
ON CONFLICT (name) DO NOTHING;

-- Knowledge Base Documents (admin-uploaded, used for RAG)
-- NOTE: This is DIFFERENT from chat_attachments (user-uploaded in chat)
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

-- Document Chunks (for RAG vector embeddings)
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT,
    chunk_text TEXT,
    vector_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Settings (personal preferences, already may exist from settings modal)
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

-- System Settings (global app-wide config, key-value store)
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

-- Seed default system settings
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

-- Audit Logs
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

-- Analytics Daily Summary (pre-aggregated metrics)
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

-- =============================================================
-- 3. DASHBOARD SQL QUERIES (for future backend API use)
-- =============================================================

-- Total users:
-- SELECT COUNT(*) AS total_users FROM users;

-- Active users today:
-- SELECT COUNT(DISTINCT user_id) AS active_users_today
-- FROM chat_sessions
-- WHERE DATE(created_at) = CURRENT_DATE;

-- Total chat sessions:
-- SELECT COUNT(*) AS total_chat_sessions FROM chat_sessions;

-- KB documents:
-- SELECT COUNT(*) AS total_kb_documents
-- FROM documents
-- WHERE processing_status != 'deleted';

-- Active workspaces:
-- SELECT COUNT(*) AS active_workspaces
-- FROM workspaces
-- WHERE status = 'active';

-- Pending documents:
-- SELECT COUNT(*) AS pending_documents
-- FROM documents
-- WHERE processing_status IN ('processing', 'pending');

-- Failed queries:
-- SELECT COUNT(*) AS failed_queries
-- FROM chat_messages
-- WHERE role = 'bot'
-- AND status = 'failed';

-- Average response time:
-- SELECT ROUND(AVG(response_time_ms), 2) AS avg_response_time_ms
-- FROM chat_messages
-- WHERE role = 'bot'
-- AND response_time_ms > 0;

-- Total token usage:
-- SELECT
--     COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
--     COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
--     COALESCE(SUM(total_tokens), 0) AS total_tokens
-- FROM chat_messages;

-- Token usage by user (Top 10):
-- SELECT
--     u.id, u.name, u.email, u.department,
--     COALESCE(SUM(cm.prompt_tokens), 0) AS prompt_tokens,
--     COALESCE(SUM(cm.completion_tokens), 0) AS completion_tokens,
--     COALESCE(SUM(cm.total_tokens), 0) AS total_tokens
-- FROM users u
-- JOIN chat_sessions cs ON cs.user_id = u.id
-- JOIN chat_messages cm ON cm.session_id = cs.id
-- GROUP BY u.id, u.name, u.email, u.department
-- ORDER BY total_tokens DESC
-- LIMIT 10;

-- Department-wise usage:
-- SELECT
--     w.name AS workspace,
--     COUNT(DISTINCT cs.id) AS chat_sessions,
--     COUNT(cm.id) AS total_messages,
--     COALESCE(SUM(cm.total_tokens), 0) AS total_tokens
-- FROM workspaces w
-- LEFT JOIN chat_sessions cs ON cs.workspace_id = w.id
-- LEFT JOIN chat_messages cm ON cm.session_id = cs.id
-- GROUP BY w.name
-- ORDER BY total_tokens DESC;

-- Recent audit activity:
-- SELECT
--     al.id, u.name AS user_name, al.action, al.entity_type,
--     al.details, al.ip_address, al.created_at
-- FROM audit_logs al
-- LEFT JOIN users u ON u.id = al.user_id
-- ORDER BY al.created_at DESC
-- LIMIT 10;

-- =============================================================
-- 4. NOTES
-- =============================================================

-- TOKEN USAGE SOURCE:
-- Token usage should be captured from the LLM backend response.
-- If using Ollama, map:
--   prompt_eval_count → prompt_tokens
--   eval_count → completion_tokens
--   total = prompt_tokens + completion_tokens
-- If token counts are unavailable, estimate using word count.
-- Store token usage in chat_messages for every bot response.

-- IP ADDRESS SOURCE:
-- Capture in FastAPI using Request object.
-- Use request.client.host for local development.
-- In production behind proxy, check x-forwarded-for or x-real-ip headers.
-- Store IP mainly in audit_logs and optionally in chat_sessions.
