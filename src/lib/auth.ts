export interface UserData {
  id: string | number;
  name: string;
  email: string;
  department: string;
  role: string;
}

export function setAuth(
  token: string,
  user: UserData,
  rememberMe: boolean = false,
  sessionId?: number,
) {
  if (typeof window !== 'undefined') {
    const store = rememberMe ? localStorage : sessionStorage;
    const clear = rememberMe ? sessionStorage : localStorage;

    store.setItem('auth_token', token);
    store.setItem('auth_user', JSON.stringify(user));
    if (sessionId !== undefined) {
      store.setItem('auth_session_id', String(sessionId));
    }

    clear.removeItem('auth_token');
    clear.removeItem('auth_user');
    clear.removeItem('auth_session_id');
    clear.removeItem('user');
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }
  return null;
}

export function getUser(): UserData | null {
  if (typeof window !== 'undefined') {
    const userStr =
      sessionStorage.getItem('auth_user') || localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function getSessionId(): number | null {
  if (typeof window !== 'undefined') {
    const raw =
      sessionStorage.getItem('auth_session_id') ||
      localStorage.getItem('auth_session_id');
    return raw ? parseInt(raw, 10) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function logout() {
  if (typeof window !== 'undefined') {
    // Tell the backend to close the session record
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await fetch('http://localhost:8000/api/users/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch {
        // Ignore network errors during logout
      }
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session_id');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_session_id');
    sessionStorage.removeItem('user');
  }
}
