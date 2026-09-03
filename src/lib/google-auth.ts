export function openGoogleOAuthPopup(authUrl: string): Window | null {
  if (typeof window === 'undefined') return null;

  const width = 500;
  const height = 650;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'GoogleOAuthPopup',
    `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
  );

  if (popup) {
    try {
      popup.focus();
    } catch {
      // Ignora restrição de Cross-Origin-Opener-Policy do Google
    }
  }

  return popup;
}
