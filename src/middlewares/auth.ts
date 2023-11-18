import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  CustomError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
} from "./index"; // Replace with the correct path

const secretKey = process.env.JWT_SECRET || "yourFallbackSecretKey"; // Use the fallback key if environment variable is not set

function authToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization");

  if (!token) {
    return next(new UnauthorizedError("Unauthorized"));
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      // Handle specific JWT errors
      if (err.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Token expired"));
      } else if (err.name === "JsonWebTokenError") {
        return next(new ForbiddenError("Invalid token"));
      } else {
        return next(new CustomError("JWT Verification Error", err.message));
      }
    }

    req.user = user;
    next();
  });
}

const generateToken = (userId: string): string => {
  const secretKey = process.env.JWT_SECRET || "yourFallbackSecretKey";

  const payload = {
    userId: userId,
  };

  const options = {
    expiresIn: "1h",
  };

  // Generate the token
  const token = jwt.sign(payload, secretKey, options);

  return token;
};

export { authToken, generateToken };
