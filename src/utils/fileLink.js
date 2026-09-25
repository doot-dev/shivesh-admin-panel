import api from '../services/api';
import { localStorageKeys } from '../constant/constant';

/**
 * Link to an uploaded file (/uploads/...). Carries the sign-in token as ?token=
 * because a new tab can't send the Authorization header — needed once the
 * backend runs with UPLOADS_REQUIRE_AUTH=true (P1.9).
 */
export const fileLink = (url) => {
  if (!url) return null;
  const token = localStorage.getItem(localStorageKeys.accessToken);
  return `${api.defaults.baseURL}${url}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
};

export const openFile = (url) => window.open(fileLink(url), '_blank', 'noopener,noreferrer');
