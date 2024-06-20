import express, { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Error import
import { AppError } from "@shared/errors/AppError";

// Setup
const limiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

const lightRateLimiterMiddleware: express.RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.ip) await limiter.consume(req.ip);

    return next();
  } catch (err) {
    throw new AppError({
      key: "@security/RATE_LIMIT",
      message: "Wait a moment.",
      statusCode: 429,
    });
  }
};

export { lightRateLimiterMiddleware };
