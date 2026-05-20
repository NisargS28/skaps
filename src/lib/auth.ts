export interface UserData {
  id: string | number;
  name: string;
  email: string;
  department: string;
  role: string;
}

export function setAuth(token: string, user: UserData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export function getUser(): UserData | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem("auth_user");
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    // Also remove the old 'user' key just in case it's lingering
    localStorage.removeItem("user");
  }
}
