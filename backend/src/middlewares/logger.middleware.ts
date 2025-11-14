import { Request, Response, NextFunction } from "express";

export const logger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Skip logging in test environment
  if (process.env.NODE_ENV !== "test") {
    console.log(`${new Date().toISOString()} | ${req.method} | ${req.url}`);
  }
  next();
};
