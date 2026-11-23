/**
 * Google Identity Services & OAuth Integration
 * Malenadu Roast Co.
 */

export const GOOGLE_CLIENT_ID = '245452559409-21kcols1a3ji31a9qv54u8h5chl036no.apps.googleusercontent.com';

// Decode JWT token from Google Identity Services without third-party dependencies
export const parseGoogleJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT:', e);
    return null;
  }
};

// Check if user has an active Google Client ID configured
export const getGoogleClientId = () => {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
    GOOGLE_CLIENT_ID
  );
};

export const isIpAddressOrigin = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return /^\d+\.\d+\.\d+\.\d+$/.test(host) || host === '0.0.0.0';
};

// Launch Google's official native OAuth Popup window to select Google Account & fetch profile + photo
export const launchGoogleOAuthPopup = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }

    // Google OAuth 2.0 strictly blocks raw IP origins (e.g. 192.168.0.4) by policy with Error 400 origin_mismatch
    if (isIpAddressOrigin()) {
      return reject(new Error('ip_origin_unsupported'));
    }

    const clientId = getGoogleClientId();

    // Method 1: Google OAuth2 Token Client (Opens Google Native Popup)
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              return reject(new Error(tokenResponse.error_description || tokenResponse.error));
            }
            try {
              // Fetch user profile and official photo using Google access token
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await userInfoRes.json();
              resolve({
                name: profile.name || profile.given_name || 'Customer',
                email: profile.email,
                picture: profile.picture,
                sub: profile.sub
              });
            } catch (err) {
              reject(err);
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('OAuth2 client init fallback:', e);
      }
    }

    // Method 2: Google Identity Services (GSI) prompt fallback
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              const payload = parseGoogleJwt(response.credential);
              if (payload) {
                resolve({
                  name: payload.name || payload.given_name || 'Customer',
                  email: payload.email,
                  picture: payload.picture,
                  sub: payload.sub
                });
              } else {
                reject(new Error('Invalid Google credential token'));
              }
            } else {
              reject(new Error('No credential returned from Google'));
            }
          }
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google prompt suppressed: ' + notification.getNotDisplayedReason?.()));
          }
        });
        return;
      } catch (e) {
        return reject(e);
      }
    }

    reject(new Error('Google Identity Services SDK not loaded yet. Please wait a moment and try again.'));
  });
};

// Generate authentic avatar fallback for demo/simulated accounts if needed
export const getGoogleAvatarForEmail = (email, name) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const seed = encodeURIComponent(name || cleanEmail.split('@')[0] || 'CoffeeLover');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0f2214,1e3a29,2d1810,7c4a26,b45309&textColor=ffffff,fef3c7&bold=true`;
};
