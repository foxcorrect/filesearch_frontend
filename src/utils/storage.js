// Security note: localStorage is vulnerable to XSS. Consider migrating to
// httpOnly cookies (requires backend cooperation — Set-Cookie with HttpOnly + SameSite).
const TOKEN_KEY = 'resume_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
