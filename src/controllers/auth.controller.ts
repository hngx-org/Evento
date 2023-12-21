import { Request, Response, NextFunction, RequestHandler } from "express";
import bycript from "bcryptjs";
import prisma from "../utils/prisma";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from "../middlewares";
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
const generateOTPPath = path.join(currentDir, "views", "email", "otp.mjml");

const passwordResetPath = path.join(
  currentDir,
  "views",
  "email",
  "passwordreset.mjml"
);

const passwordResetConfirmationPath = path.join(
  currentDir,
  "views",
  "email",
  "passwordresetconfirmation.mjml"
);

const signupverified = path.join(
  currentDir,
  "views",
  "email",
  "signupverified.mjml"
);

const signUpVerificationEmailPath = path.join(
  currentDir,
  "views",
  "email",
  "signupverification.mjml"
);

// Assuming you have a secret for JWT signing
const jwtSecret = process.env.JWT_SECRET;

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

    //send confirmation email

    sendSignUpVerificationEmail(createdUser);

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
        expiresIn: "3 days",
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


export const signWithGoogle: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, image } = req.body;
    const requiredFields = ["email", "name"];
    

    const fieldDisplayNames = {
      email: "Email",
      name: "Name",
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


    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        userID: true,
        email: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        slug: true,
      },
    });

    if (user) {
      return ResponseHandler.success(
        res,
        user,
        200,
        "User retrieved successfully"
      );
    }

    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || "";
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: "",
        firstName,
        lastName,
        slug: await slugify(`${firstName} ${lastName}`),
      },
    });

    //send confirmation email

    sendSignUpVerificationEmail(createdUser);

    const userWithoutPassword = {
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      slug: createdUser.slug,
    };

    return ResponseHandler.success(
      res,
      userWithoutPassword,
      201,
      "User created successfully: proceed with verification"
    );
  } catch (error) {
    next(error);
  }
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

const sendSignUpVerificationEmail = async (user: any) => {
  try {
    //if user is already verified

    const confirmationToken = generateConfirmationToken(user.userID);

    //   if token exists, delete it
    await prisma.verification.upsert({
      where: { userID: user.userID },
      update: {
        verificationCode: confirmationToken,
        status: "pending",
      },
      create: {
        userID: user.userID,
        verificationCode: confirmationToken,
        status: "pending",
      },
    });

    const mailedToken = `https://evento-qo6d.onrender.com/api/v1/verify?token=${confirmationToken}`;

    const emailVariables = {
      userName: user.firstName,
      verificationLink: mailedToken,
    };

    emailService(
      {
        to: user.email,
        subject: "Verify Your Evento Account",
        variables: emailVariables,
      },
      signUpVerificationEmailPath
    );
  } catch (error) {
    console.log(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    // Verify the token
    const decodedToken = jwt.verify(token, jwtSecret);

    if (!decodedToken) {
      throw new BadRequestError("Invalid token");
    }

    const { userID } = decodedToken;

    //   check if the token hasnt expired
    const tokenExists = await prisma.verification.findUnique({
      where: { userID },
      select: {
        verificationCode: true,
        timestamp: true,
      },
    });

    if (!tokenExists) {
      throw new BadRequestError("Invalid token");
    }

    //   check if the token hasnt not exceeded 1 hour
    if (isPasswordTokenExpired(tokenExists.timestamp)) {
      throw new BadRequestError("Token has expired");
    }

    //   compare the token with the one in the database
    if (tokenExists.verificationCode !== token) {
      throw new BadRequestError("Invalid token");
    }

    // Update the user password
    const updatedUser = await prisma.user.update({
      where: { userID },
      data: {
        isVerified: true,
      },
    });

    if (!updatedUser) {
      throw new InternalServerError("User could not be verified");
    }

    if (tokenExists) {
      // Delete the verification token
      await prisma.verification.delete({
        where: { userID },
      });
    }

    //   send password updated email
    const emailVariables = {
      userName: updatedUser.firstName,
    };

    const emailStatus = await emailService(
      {
        to: updatedUser.email,
        subject: "Account Verified Successfully",
        variables: emailVariables,
      },
      signupverified
    );

    if (!emailStatus) {
      throw new InternalServerError(
        "Error sending password change confirmation email"
      );
    }
    res.redirect("https://evento1.vercel.app/dashboard");
    // return ResponseHandler.success(
    //   res,
    //   updatedUser,
    //   200,
    //   "User verified successfully"
    // );
  } catch (error) {
    return next(error);
  }
};

export const sendSignUpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        userID: userID,
      },
    });
    if (!user) {
      throw new BadRequestError("User does not exist");
    }

    sendSignUpVerificationEmail(user);

    return ResponseHandler.success(
      res,
      user.userID,
      200,
      "Verification email sent successfully"
    );
  } catch (error) {
    return next(error);
  }
};

export function generateToken(user: any): string {
  const userWithoutPassword = {
    id: user.userID,
  };
  return jwt.sign(userWithoutPassword, process.env.JWT_SECRET as string, {
    expiresIn: "168h",
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
    const { email } = req.body;

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

    const compareEmail = email;

    if (user.email !== compareEmail) {
      throw new BadRequestError("Please use a registered email");
    }

    const token = generateRandomCode();

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
      otpCode: token,
    };

    const emailStatus = await emailService(
      {
        to: user.email,
        subject: "Here is your OTP",
        variables: emailVariables,
      },
      generateOTPPath
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

// Generate a JWT token for confirmation link
const generateConfirmationToken = (userID) => {
  const token = jwt.sign({ userID }, jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    // Verify the user id
    const validUser = await prisma.user.findUnique({
      where: { email },
      select: {
        userID: true,
        displayName: true,
        password: true,
        email: true,
      },
    });

    if (!validUser) {
      throw new NotFoundError("User not found");
    }

    // Generate a confirmation token
    const confirmationToken = generateConfirmationToken(validUser.userID);

    //   if token exists, delete it
    const tokenExists = await prisma.verification.findUnique({
      where: { userID: validUser.userID },
    });

    if (tokenExists) {
      const tokenExists = await prisma.verification.delete({
        where: { userID: validUser.userID },
      });
    }

    // Save the confirmation token in the database
    await prisma.verification.create({
      data: {
        userID: validUser.userID,
        verificationCode: confirmationToken,
        status: "pending",
      },
    });

    const mailedToken = `https://evento-qo6d.onrender.com/api/v1/reset-password?token=${confirmationToken}`;

    // Send the confirmation email
    const emailVariables = {
      userName: validUser.displayName,
      verificationLink: mailedToken,
    };

    const emailStatus = await emailService(
      {
        to: validUser.email,
        subject: "Password Reset",
        variables: emailVariables,
      },
      passwordResetPath
    );

    if (!emailStatus) {
      throw new InternalServerError("Error sending email");
    }

    // Respond with success
    return ResponseHandler.success(
      res,
      emailStatus,
      200,
      "Password reset link sent successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Function to check if a token has expired
const isPasswordTokenExpired = (creationTime: Date): boolean => {
  const expirationTime = new Date(creationTime);
  expirationTime.setMinutes(expirationTime.getMinutes() + 60); // 5 minutes expiration
  return new Date() > expirationTime;
};

// confirm User Exists
export const confirmUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, jwtSecret);

    if (!decodedToken) {
      throw new BadRequestError("Invalid token");
    }

    const { userID } = decodedToken;

    //   check if the token hasnt expired
    const tokenExists = await prisma.verification.findUnique({
      where: { userID },
      select: {
        verificationCode: true,
        timestamp: true,
      },
    });

    if (!tokenExists) {
      throw new BadRequestError("Invalid token");
    }

    //   check if the token hasnt not exceeded 1 hour
    if (isPasswordTokenExpired(tokenExists.timestamp)) {
      throw new BadRequestError("Token has expired");
    }

    //   compare the token with the one in the database
    if (tokenExists.verificationCode !== token) {
      throw new BadRequestError("Invalid token");
    }

    // send the userid and token to the frontend with a redirect

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          throw new BadRequestError("Cannot Redirect User");
        }
        return res.redirect(
          `https://evento1.vercel.app/resetpassword/${userID}/${token}`
        );
      });
    }
  } catch (error) {
    return next(error);
  }
};

// confirm password change
export const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token, userID, newPassword } = req.body;

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, jwtSecret);

    if (!decodedToken) {
      throw new BadRequestError("Invalid token");
    }

    const { userID } = decodedToken;

    //   check if the token hasnt expired
    const tokenExists = await prisma.verification.findUnique({
      where: { userID },
      select: {
        verificationCode: true,
        timestamp: true,
      },
    });

    if (!tokenExists) {
      throw new BadRequestError("Invalid token");
    }

    //   check if the token hasnt not exceeded 1 hour
    if (isPasswordTokenExpired(tokenExists.timestamp)) {
      throw new BadRequestError("Token has expired");
    }

    //   compare the token with the one in the database
    if (tokenExists.verificationCode !== token) {
      throw new BadRequestError("Invalid token");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    const hashedNewPassword = await bycript.hash(newPassword, 10);

    // Update the user password
    const updatedUser = await prisma.user.update({
      where: { userID },
      data: {
        password: hashedNewPassword,
      },
    });

    if (!updatedUser) {
      throw new InternalServerError("Password could not be updated");
    }

    if (tokenExists) {
      // Delete the verification token
      await prisma.verification.delete({
        where: { userID },
      });
    }

    //   send password updated email
    const emailVariables = {
      userName: updatedUser.displayName,
    };

    const emailStatus = await emailService(
      {
        to: updatedUser.email,
        subject: "Password Reset Successfully",
        variables: emailVariables,
      },
      passwordResetConfirmationPath
    );

    if (!emailStatus) {
      throw new InternalServerError(
        "Error sending password change confirmation email"
      );
    }

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          throw new BadRequestError("Cannot Redirect User");
        }
        return res.redirect("https://evento1.vercel.app");
      });
    }
  } catch (error) {
    return next(error);
  }
};
