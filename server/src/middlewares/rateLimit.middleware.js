import rateLimit from "express-rate-limit";

// General rate limiter for most routes
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for sensitive routes (login, register, password reset)
export const strictRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Limit each IP to 20 requests per windowMs
    message: "Too many attempts from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Moderate rate limiter for authenticated routes
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Lenient rate limiter for location updates (more frequent requests allowed)
export const locationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    message: "Too many location updates from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Very lenient rate limiter for read-only endpoints (car models, etc.)
export const readOnlyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
