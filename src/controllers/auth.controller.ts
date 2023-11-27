import { Request, Response, NextFunction } from "express";
import bycript from "bcryptjs";
import prisma from "../utils/prisma";
import { BadRequestError, UnauthorizedError } from "../middlewares";
import { ResponseHandler } from "../utils/responsehandler";
import passport from "../utils/passport";
import { slugify } from "../services/slugify";
import jwt from "jsonwebtoken";
interface CustomUser extends Express.User {
  userID: string;
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const requiredFields = ["email", "password", "firstName", "lastName"];

    const fieldDisplayNames = {
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
    };

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const errorMessage =
        missingFields.length === 1
          ? `${fieldDisplayNames[missingFields[0]]} is required`
          : `${missingFields
              .map((field) => fieldDisplayNames[field])
              .join(", ")} are required`;

      throw new BadRequestError(errorMessage);
    }

    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    const hashedPassword = await bycript.hash(password, 10);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      throw new BadRequestError("User already exists");
    }

    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        slug: await slugify(`${firstName} ${lastName}`),
      },
    });
    const userWithoutPassword = {
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      slug: createdUser.slug,
    };

    ResponseHandler.success(
      res,
      userWithoutPassword,
      201,
      "User created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }
    req.logIn(user, function (err) {
      const userWithoutPassword = {
        id: user.userID,
      };
      const token = jwt.sign(userWithoutPassword, "your_secret_key", {
        expiresIn: "1h",
      });
      if (err) {
        return next(err);
      }
      return ResponseHandler.success(
        res,
        { userId: userWithoutPassword.id, token },
        200,
        "Login successful"
      );
    });
  })(req, res, next);
};

export const google = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "google",
    {
      accessType: "offline",
      prompt: "consent",
      scope: ["profile", "email"],
    },
    async function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new UnauthorizedError("Google auth error"));
      }

      try {
        await loginUser(req, user);
        const token = generateToken(user);
        return ResponseHandler.success(
          res,
          { userId: user.userID, token },
          200,
          "Login successful"
        );
      } catch (error) {
        return next(error);
      }
    }
  )(req, res, next);
};

async function loginUser(req: Request, user: any) {
  return new Promise((resolve, reject) => {
    req.logIn(user, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

function generateToken(user: any): string {
  const userWithoutPassword = {
    id: user.userID,
  };
  return jwt.sign(
    userWithoutPassword,
    (process.env.JWT_SECRET_KEY as string) || "secret",
    { expiresIn: "1h" }
  );
}

export const oauthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as CustomUser;
    if (req.user) {
      const token = generateToken(user.userID);
      return ResponseHandler.success(
        res,
        { userId: user.userID, token },
        200,
        "Token generated successfully"
      );
    } else {
      return next(new UnauthorizedError("User not logged in"));
    }
  } catch (error) {
    return next(error);
  }
};

// otp verification
