// Access token gardé en mémoire uniquement (jamais persisté sur disque).
// Le refresh token vit dans un cookie httpOnly posé par le backend, invisible à ce JS.
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}
