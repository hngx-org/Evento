import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import generateSecretKey from "../services/generateSecretKey";
import {
  CustomError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
} from "./index"; // Replace with the correct path

require("dotenv").config();

// Check if JWT_SECRET environment variable exists
const jwtSecret = process.env.JWT_SECRET;

// check commandline for Secret Key and add to environment variable
const secretKey = jwtSecret || generateSecretKey();

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

    //req.user = user;
    next();
  });
}

const generateToken = (userId: string): string => {
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
