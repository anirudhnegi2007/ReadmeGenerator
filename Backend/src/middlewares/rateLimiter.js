import rateLimit from 'express-rate-limit';

// Global/General rate limiter for all endpoints (100 requests per 15 minutes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Stricter rate limiter for heavy or sensitive endpoints (15 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 15 requests per window (e.g. for AI generation, login, register)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests for sensitive operations from this IP, please try again after 15 minutes.'
  }
});
