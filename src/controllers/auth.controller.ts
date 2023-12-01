import { Request, Response, NextFunction, RequestHandler } from "express";
import bycript from "bcryptjs";
import prisma from "../utils/prisma";
import { BadRequestError, UnauthorizedError } from "../middlewares";
import { ResponseHandler } from "../utils/responsehandler";
import passport from "../utils/passport";
import { slugify } from "../services/slugify";
import jwt from "jsonwebtoken";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";
import crypto from "crypto";
import { emailService } from "../services/mailer";

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
    //  send email
    const emailContent = {
      to: email,
      subject: "Welcome to Evento!",
      userName: firstName,
      additionalContent: `Thank you for registering with Evento!`,
    };
    await emailService(emailContent)(req, res, next);

    if (!emailService) {
      return new BadRequestError("Error sending email");
    }
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

// otp verification
const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};
// generate otp
export const generateOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.params.id;
    console.log(userID);
    const user = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        userID: true,
        email: true,
      },
    });
    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    console.log("here");
    const base32_secret = generateRandomBase32();
    const otp = new OTPAuth.TOTP({
      issuer: "Evento",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    });

    console.log(otp.toString());

    let otpauth_url = otp.toString();

    await prisma.user.update({
      where: { userID: user.userID },
      data: {
        otp_auth_url: otpauth_url,
        otp_base32: base32_secret,
      },
    });

    return ResponseHandler.success(
      res,
      otpauth_url,
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
        otp_auth_url: true,
        otp_base32: true,
      },
    });
    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    const otpauth_url = user.otp_auth_url;
    const base32_secret = user.otp_base32;

    const otpObj = new OTPAuth.TOTP({
      issuer: "Evento",
      label: otpauth_url,
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    });

    const isValid = otpObj.validate({ token: token });
    if (!isValid) {
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

    // return data to the user
    const validatedUser = await prisma.user.findUnique({
      where: {
        userID,
      },
      select: {
        userID: true,
        displayName: true,
        email: true,
        otp_enabled: true,
        otp_verified: true,
      },
    });

    return ResponseHandler.success(
      res,
      validatedUser,
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
    const { userID, token } = req.body;

    if (!userID || !token) {
      throw new BadRequestError("User ID and token are required");
    }

    console.log(userID, token);

    const user = await prisma.user.findUnique({
      where: {
        userID: userID,
      },
      select: {
        otp_auth_url: true,
        otp_base32: true,
      },
    });

    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    let otp = new OTPAuth.TOTP({
      issuer: "Evento",
      label: user.otp_auth_url,
      algorithm: "SHA1",
      digits: 6,
      secret: user.otp_base32,
    });

    const isValid = otp.validate({ token, window: 1 });
    if (!isValid) {
      throw new BadRequestError("Invalid OTP");
    }

    const otp_valid = await prisma.user.update({
      where: { userID: userID },
      data: {
        otp_enabled: true,
        otp_verified: true,
      },
      select: {
        userID: true,
        displayName: true,
        email: true,
        otp_enabled: true,
        otp_verified: true,
      },
    });

    return ResponseHandler.success(
      res,
      otp_valid,
      200,
      "OTP validated successfully"
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
