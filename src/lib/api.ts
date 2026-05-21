const API_BASE = 'http://127.0.0.1:8000/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Invalid email or password';
    try {
      const data = await response.json();
      if (data.detail) errorMessage = data.detail;
    } catch { /* ignore */ }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function verifySession(userId: number, token: string) {
  const response = await fetch(`${API_BASE}/users/verify_session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, token }),
  });

  if (!response.ok) throw new Error('Session invalid');
  return response.json();
}

export async function logoutSession(sessionId: number) {
  const response = await fetch(`${API_BASE}/users/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) throw new Error('Logout failed');
  return response.json();
}

export interface AdminSession {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_department: string;
  user_role: string;
  login_at: string | null;
  logout_at: string | null;
  duration_seconds: number | null;
  ip_address: string | null;
  user_agent: string | null;
  logout_reason: string | null;
  is_active: boolean;
}

export async function getAdminSessions(filters?: {
  user_id?: number;
  status?: 'active' | 'ended';
  date_from?: string;
  date_to?: string;
}): Promise<AdminSession[]> {
  const params = new URLSearchParams();
  if (filters?.user_id) params.set('user_id', String(filters.user_id));
  if (filters?.status) params.set('status', filters.status);
  if (filters?.date_from) params.set('date_from', filters.date_from);
  if (filters?.date_to) params.set('date_to', filters.date_to);

  const url = `${API_BASE}/users/admin/sessions${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_users: number;
  active_today: number;
  total_sessions: number;
  kb_documents: number;
  active_workspaces: number;
  pending_docs: number;
  failed_queries: number;
  avg_response_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  dept_usage: { workspace: string; sessions: number; messages: number; tokens: number }[];
  model_usage: { model: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const r = await fetch(`${API_BASE}/admin/dashboard`);
  if (!r.ok) throw new Error('Failed to fetch dashboard stats');
  return r.json();
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  last_login_at: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export async function getAdminUsers(filters?: {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
}): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.department) params.set('department', filters.department);
  if (filters?.role) params.set('role', filters.role);
  if (filters?.status) params.set('status', filters.status);
  const url = `${API_BASE}/admin/users${params.toString() ? '?' + params.toString() : ''}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Failed to fetch users');
  return r.json();
}

export async function updateUserStatus(userId: number, status: string): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error('Failed to update user status');
}

export async function createAdminUser(payload: {
  name: string; email: string; password: string; department: string; role: string;
}): Promise<{ id: number; name: string; email: string }> {
  const r = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to create user');
  }
  return r.json();
}

export async function getAdminUser(userId: number): Promise<AdminUser> {
  const r = await fetch(`${API_BASE}/admin/users/${userId}`);
  if (!r.ok) throw new Error('Failed to fetch user');
  return r.json();
}

export async function updateAdminUser(userId: number, payload: {
  name: string; email: string; department: string; role: string;
}): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to update user');
  }
}

export async function resetAdminUserPassword(userId: number, newPassword: string): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!r.ok) throw new Error('Failed to reset password');
}

export async function changePassword(userId: number, newPassword: string): Promise<void> {
  const r = await fetch(`${API_BASE}/users/${userId}/change-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to change password');
  }
}


export interface Workspace {
  id: number;
  name: string;
  description: string;
  status: string;
  session_count: number;
  doc_count: number;
  updated_at: string | null;
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const r = await fetch(`${API_BASE}/admin/workspaces`);
  if (!r.ok) throw new Error('Failed to fetch workspaces');
  return r.json();
}

export async function createWorkspace(payload: { name: string; description?: string; status?: string }) {
  const r = await fetch(`${API_BASE}/admin/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to create workspace');
  }
  return r.json();
}

export async function updateWorkspace(id: number, payload: { name: string; description?: string; status: string }): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/workspaces/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to update workspace');
}

export async function deleteWorkspace(id: number): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/workspaces/${id}`, {
    method: 'DELETE',
  });
  if (!r.ok) throw new Error('Failed to delete workspace');
}

export interface KBDocument {
  id: number;
  file_name: string;
  workspace: string | null;
  uploaded_by: string | null;
  file_size: number | null;
  file_type: string | null;
  processing_status: string;
  embedding_status: string;
  chunk_count: number;
  created_at: string | null;
}

export async function getDocuments(workspace?: string): Promise<KBDocument[]> {
  const params = workspace ? `?workspace=${encodeURIComponent(workspace)}` : '';
  const r = await fetch(`${API_BASE}/admin/documents${params}`);
  if (!r.ok) throw new Error('Failed to fetch documents');
  return r.json();
}

export async function uploadDocument(
  file: File,
  workspaceName: string,
  uploaderUserId?: number,
): Promise<KBDocument> {
  const form = new FormData();
  form.append('file', file);
  form.append('workspace_name', workspaceName);
  if (uploaderUserId) form.append('uploader_user_id', String(uploaderUserId));

  const r = await fetch(`${API_BASE}/admin/documents/upload`, {
    method: 'POST',
    body: form,
  });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.detail || 'Upload failed');
  }
  return r.json();
}

export async function deleteDocument(docId: number): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/documents/${docId}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Failed to delete document');
}

export interface AnalyticsData {
  total_messages: number;
  successful: number;
  failed: number;
  avg_response_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  workspace_usage: { workspace: string; sessions: number; messages: number; tokens: number }[];
  top_users: {
    id: number; name: string; department: string;
    prompt_tokens: number; completion_tokens: number; total_tokens: number;
  }[];
  model_usage: { model: string; count: number }[];
}

export async function getAnalytics(dateRange?: string, workspace?: string, model?: string): Promise<AnalyticsData> {
  const params = new URLSearchParams();
  if (dateRange) params.set('date_range', dateRange);
  if (workspace) params.set('workspace', workspace);
  if (model) params.set('model', model);
  const r = await fetch(`${API_BASE}/admin/analytics?${params.toString()}`);
  if (!r.ok) throw new Error('Failed to fetch analytics');
  return r.json();
}

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  user: string;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  timestamp: string | null;
}

export async function getAuditLogs(filters?: {
  search?: string;
  action?: string;
  entity_type?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.action) params.set('action', filters.action);
  if (filters?.entity_type) params.set('entity_type', filters.entity_type);
  if (filters?.limit) params.set('limit', String(filters.limit));
  const r = await fetch(`${API_BASE}/admin/audit-logs?${params.toString()}`);
  if (!r.ok) throw new Error('Failed to fetch audit logs');
  return r.json();
}

export interface SystemSettingItem {
  id: number;
  key: string;
  value: string;
  type: string | null;
  description: string | null;
}

export async function getSystemSettings(): Promise<SystemSettingItem[]> {
  const r = await fetch(`${API_BASE}/admin/system-settings`);
  if (!r.ok) throw new Error('Failed to fetch system settings');
  return r.json();
}

export async function saveSystemSettings(updates: { key: string; value: string }[]): Promise<void> {
  const r = await fetch(`${API_BASE}/admin/system-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!r.ok) throw new Error('Failed to save system settings');
}

