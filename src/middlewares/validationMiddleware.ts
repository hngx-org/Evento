import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError, ZodIssue } from "zod";
import { BadRequestError } from "./errorhandler";

export const validationMiddleware = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = mapZodErrorToValidationError(error);
        next(new BadRequestError(validationError));
      } else {
        next(error);
      }
    }
  };
};

// Utility function to map ZodError to a more readable validation error
const mapZodErrorToValidationError = (error: ZodError): string => {
  const issues = error.issues.map(mapZodIssue);
  const issuesCount = issues.length;
  const issuesMessage = issues
    .map(
      (issue, index) => `Issue ${index + 1}: ${issue.message} in ${issue.path}`
    )
    .join(", ");

  return `validationError: "issues": ${issuesCount}, ${issuesMessage}`;
};

// Utility function to map ZodIssue to a more readable format
const mapZodIssue = (issue: ZodIssue): any => {
  return {
    message: issue.message,
    path: issue.path.join("."),
  };
};
