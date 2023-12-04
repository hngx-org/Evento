import { Request, Response, NextFunction, RequestHandler } from "express";
import bycript from "bcryptjs";
import prisma from "../utils/prisma";
import { BadRequestError, UnauthorizedError } from "../middlewares";
import { ResponseHandler } from "../utils/responsehandler";
import passport from "../utils/passport";
import deleteExpiredTokens from "../utils/deletetoken";
import { slugify } from "../services/slugify";
import jwt from "jsonwebtoken";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";
import crypto from "crypto";
import { emailService } from "../services/mailer";
const path = require("path");

// Assuming your current file is in a folder called "src"
const currentDir = path.resolve(__dirname, "..");

// Then you can navigate to the desired template path
const templatePath = path.join(currentDir, "views", "email", "verify.html");

interface CustomUser extends Express.User {
  userID: string;
}

export const register: RequestHandler = async (
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
        email: email,
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
      const token = jwt.sign(userWithoutPassword, process.env.JWT_SECRET, {
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
  return jwt.sign(userWithoutPassword, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
}

export const oauthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as CustomUser;
    if (req.user) {
      const token = generateToken(user);
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

// Generate a 6-digit random code
const generateRandomCode = () => {
  // Generate a random 2-byte buffer
  const buffer = crypto.randomBytes(2);

  // Convert the buffer to an integer
  const randomInt = buffer.readUInt16BE(0);

  // Map the integer to a 6-digit code
  const sixDigitCode = String(randomInt % 1000000).padStart(6, "0");

  return sixDigitCode;
};

// Function to check if a token has expired
const isTokenExpired = (creationTime: Date): boolean => {
  const expirationTime = new Date(creationTime);
  expirationTime.setMinutes(expirationTime.getMinutes() + 5); // 5 minutes expiration
  return new Date() > expirationTime;
};

// generate otp
export const generateOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.params.id;
    const { compareEmail } = req.body;

    console.log(userID);
    const user = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        userID: true,
        email: true,
        firstName: true,
        otp_enabled: true,
      },
    });

    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    if (user.email !== compareEmail) {
      throw new BadRequestError("Please use a registered email");
    }

    console.log("here");
    const token = generateRandomCode();

    console.log(token);

    await prisma.oTP.upsert({
      where: {
        userID: userID,
      },
      update: {
        otp: token,
      },
      create: {
        otp: token,
        userID: userID,
      },
    });

    const emailVariables = {
      userName: user.firstName,
      otp: token,
    };

    console.log(emailVariables);

    const emailStatus = await emailService(
      {
        to: user.email,
        subject: "Here is your OTP",
        variables: emailVariables,
      },
      templatePath
    );

    await prisma.user.update({
      where: { userID: userID },
      data: {
        otp_enabled: true,
      },
      select: {
        otp_enabled: true,
      },
    });

    console.log(emailStatus);

    if (!emailService) {
      return new BadRequestError("Error sending email");
    }

    return ResponseHandler.success(
      res,
      user.userID,
      200,
      "OTP generated successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// verify otp
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, userID } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        userID: true,
        firstName: true,
        email: true,
      },
    });
    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    const otp = await prisma.oTP.findFirst({
      where: {
        otp: token,
        userID: userID,
      },
    });

    if (!otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (isTokenExpired(otp.createdAt)) {
      deleteExpiredTokens();
      throw new BadRequestError("OTP has expired");
    }

    console.log(otp);

    if (!otp) {
      throw new BadRequestError("Invalid OTP");
    }

    const updatedUser = await prisma.user.update({
      where: { userID: userID },
      data: {
        otp_enabled: true,
        otp_verified: true,
      },
      select: {
        otp_verified: true,
      },
    });

    await prisma.oTP.delete({
      where: {
        userID: userID,
      },
    });

    return ResponseHandler.success(
      res,
      updatedUser,
      200,
      "OTP Enabled Successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// validate otp
export const validateOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, userID } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        userID: true,
        firstName: true,
        email: true,
        otp_enabled: true,
        otp_verified: true,
      },
    });

    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    if (user.otp_enabled === false && user.otp_verified === false) {
      throw new BadRequestError("OTP not enabled");
    }

    const otp = await prisma.oTP.findFirst({
      where: {
        otp: token,
        userID: userID,
      },
    });

    if (!otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (isTokenExpired(otp.createdAt)) {
      deleteExpiredTokens();
      throw new BadRequestError("OTP has expired");
    }

    console.log(otp);

    if (!otp) {
      throw new BadRequestError("Invalid OTP");
    }

    const updatedUser = await prisma.user.update({
      where: { userID: userID },
      data: {
        otp_enabled: true,
        otp_verified: true,
      },
      select: {
        otp_enabled: true,
      },
    });

    await prisma.oTP.delete({
      where: {
        userID: userID,
      },
    });

    return ResponseHandler.success(
      res,
      updatedUser,
      200,
      "Successful Validated"
    );
  } catch (error) {
    return next(error);
  }
};

// disable OTP
export const disableOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.params.id;
    const user = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        userID: true,
        otp_enabled: true,
        otp_verified: true,
      },
    });
    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    const updatedUser = await prisma.user.update({
      where: { userID: userID },
      data: {
        otp_enabled: false,
        otp_verified: false,
      },
      select: {
        userID: true,
        otp_enabled: true,
      },
    });

    return ResponseHandler.success(
      res,
      updatedUser,
      200,
      "OTP disabled successfully"
    );
  } catch (error) {
    return next(error);
  }
};
