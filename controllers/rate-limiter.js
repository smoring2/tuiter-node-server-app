/**
 * Simple in-memory rate limiter middleware.
 * Tracks request counts per IP within a sliding window.
 *
 * @param {Object} options
 * @param {number} options.windowMs  - Time window in milliseconds (default: 60000)
 * @param {number} options.maxRequests - Max requests per window per IP (default: 100)
 */
export function rateLimiter({ windowMs = 60_000, maxRequests = 100 } = {}) {
    const hits = new Map(); // ip -> { count, resetTime }

    // Periodically purge expired entries to prevent memory leak
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of hits) {
            if (now >= entry.resetTime) {
                hits.delete(ip);
            }
        }
    }, windowMs);
    // Allow the Node process to exit even if the interval is active
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }

    return (req, res, next) => {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();

        let entry = hits.get(ip);
        if (!entry || now >= entry.resetTime) {
            entry = { count: 0, resetTime: now + windowMs };
            hits.set(ip, entry);
        }

        entry.count += 1;

        res.set('X-RateLimit-Limit', String(maxRequests));
        res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));

        if (entry.count > maxRequests) {
            return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }

        next();
    };
}
