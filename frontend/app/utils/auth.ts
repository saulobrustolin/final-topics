import Cookies from "js-cookie";

const TOKEN_KEY = "music_platform_token";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY);
};

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1 }); // 1 day
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
