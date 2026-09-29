const isProduction = process.env.NODE_ENV === "production";

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return value === "true";
};

const refreshCookieOptions = () => {
  const sameSite = process.env.COOKIE_SAMESITE || (isProduction ? "none" : "lax");
  const secure = parseBoolean(process.env.COOKIE_SECURE, isProduction);

  return {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
};

const clearRefreshCookieOptions = () => {
  const { maxAge, ...options } = refreshCookieOptions();
  return options;
};

module.exports = {
  refreshCookieOptions,
  clearRefreshCookieOptions,
};
