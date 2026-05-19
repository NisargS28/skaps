-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    department VARCHAR(50),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    workspace VARCHAR(50),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CHAT MESSAGES
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('user', 'bot')),
    content TEXT,
    sources JSONB, -- RAG references / citations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_attachments (
    id SERIAL PRIMARY KEY,
    message_id INT REFERENCES chat_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    original_file_name VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    extracted_text TEXT,
    upload_status VARCHAR(50) DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Knowlegebase Documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    workspace VARCHAR(50),
    file_name VARCHAR(255),
    original_file_name VARCHAR(255),
    file_path TEXT,
    uploaded_by INT REFERENCES users(id),
    file_size BIGINT,
    file_type VARCHAR(100),
    processing_status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

