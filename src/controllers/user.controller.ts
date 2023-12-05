import { Response, Request, NextFunction, RequestHandler } from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} from "../middlewares";
import { ResponseHandler } from "../utils";
import { v4 as uuidv4 } from "uuid";

import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";
const path = require("path");
import "dotenv/config";
import bcript from "bcryptjs";
import { emailService } from "../services/mailer";
import jwt from "jsonwebtoken";

// Assuming you have a secret for JWT signing
const jwtSecret = process.env.JWT_SECRET;

// Generate a JWT token for confirmation link
const generateConfirmationToken = (userID, hashedNewPassword) => {
  const token = jwt.sign({ userID, hashedNewPassword }, jwtSecret, {
    expiresIn: "1h",
  });
  return token;
};

// Assuming your current file is in a folder called "src"
const currentDir = path.resolve(__dirname, "..");

// Then you can navigate to the desired template path
const templatePath = path.join(currentDir, "views", "email", "verify.html");
const verifyPasswordTemplate = path.join(
  currentDir,
  "views",
  "email",
  "verifypassword.html"
);

console.log(templatePath);

import {
  userInterface,
  socialInterface,
  contactInterface,
  preferencesInterface,
} from "../interfaces/user.interface";

import { uploadProfileImageService } from "../services/profileimage";
import { cloudinaryService, deleteImage } from "../services/imageupload";

// validate id
const validateId = (id: string): string | null => {
  return uuidv4(id);
};

// get user profile by id
const getUserProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    if (!id) {
      throw new BadRequestError("User id is required");
    }

    const isValidId: string | null = validateId(id);

    if (!isValidId) {
      throw new BadRequestError("Invalid user id format");
    }

    const user = await prisma.user.findUnique({
      where: { userID: id },
      select: {
        userID: true,
        email: true,
        bio: true,
        socialLinks: true,
        profileImage: true,
        displayName: true,
        firstName: true,
        lastName: true,
        slug: true,
        role: true,
        location: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const requestingUserId = req.params.id; // Assuming you have a user object in the request
    if (requestingUserId !== user.userID) {
      throw new UnauthorizedError(
        "You do not have permission to view this profile"
      );
    }

    ResponseHandler.success(
      res,
      user,
      200,
      "User profile fetched successfully"
    );
  } catch (error) {
    //   check for prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email"
        );
      }
      console.log(error.message);
    }

    next(error);
  }
};

const updateUserProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  // destructuring the request body

  try {
    const { firstName, lastName, displayName, bio, location } =
      req.body as userInterface;

    // find the user by id
    const user = await prisma.user.findUnique({
      where: { userID: id },
      select: {
        userID: true,
        bio: true,
        profileImage: true,
        displayName: true,
        firstName: true,
        lastName: true,
        location: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // check if the user is the same as the one updating the profile
    const requestingUserId = req.params.id; // Assuming you have a user object in the request
    if (requestingUserId !== user.userID) {
      throw new UnauthorizedError(
        "You do not have permission to view this profile"
      );
    }

    // update the user profile
    const updatedUser = await prisma.user.update({
      where: { userID: id },
      data: {
        firstName,
        lastName,
        displayName,
        bio,
        location,
      },
    });

    ResponseHandler.success(
      res,
      updatedUser,
      200,
      "User profile updated successfully"
    );
  } catch (error) {
    //   check for prisma errors
    next(error);
  }
};

const addSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.id;

  // Verify the user id
  const validUser = await prisma.user.findUnique({
    where: { userID },
    select: {
      userID: true,
    },
  });

  if (!validUser) {
    throw new NotFoundError("User not found");
  }

  try {
    const { websiteURL, twitterURL, facebookURL, instagramURL } =
      req.body as socialInterface;

    // Check if the user already has social links
    const existingSocialLink = await prisma.socialLink.findMany({
      where: { userID },
      select: {
        linkID: true,
      },
    });

    console.log(existingSocialLink);

    if (existingSocialLink && existingSocialLink.length > 0) {
      // User has existing social links, update them
      const socialLinkID = existingSocialLink[0].linkID;
      const updatedSocialLink = await prisma.socialLink.update({
        where: { linkID: socialLinkID },
        data: {
          websiteURL,
          twitterURL,
          facebookURL,
          instagramURL,
        },
      });

      ResponseHandler.success(
        res,
        updatedSocialLink,
        200,
        "Social links updated successfully"
      );
    } else {
      // User doesn't have existing social links, create new ones
      const newSocialLink = await prisma.socialLink.create({
        data: {
          userID: userID,
          websiteURL,
          twitterURL,
          facebookURL,
          instagramURL,
        },
      });

      ResponseHandler.success(
        res,
        newSocialLink,
        200,
        "Social links added successfully"
      );
    }
  } catch (error) {
    // Check for Prisma errors
    next(error);
  }
};

// get social links by user id
const getSocialLinksByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.id;

  try {
    const socialLinks = await prisma.socialLink.findMany({
      where: { userID },
      select: {
        linkID: true,
        userID: true,
        websiteURL: true,
        twitterURL: true,
        facebookURL: true,
        instagramURL: true,
      },
    });

    if (!socialLinks) {
      throw new NotFoundError("Social links not found");
    }

    //   return the social links as an array of objects
    const socialLinksArray = {
      websiteURL: socialLinks[0]?.websiteURL,
      twitterURL: socialLinks[0]?.twitterURL,
      facebookURL: socialLinks[0]?.facebookURL,
      instagramURL: socialLinks[0]?.instagramURL,
    };

    ResponseHandler.success(
      res,
      socialLinksArray,
      200,
      "Social links fetched successfully"
    );
  } catch (error) {
    //   check for prisma errors
    next(error);
  }
};

const uploadProfileImage: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("start");

    if (!req.file) {
      throw new BadRequestError("Please add a Profile Image");
    }

    console.log(req.file);

    const userID = req.params.id;
    console.log(userID);
    const file = req.file as any;
    const { service } = req.body;

    // verify the user id
    const validUser = await prisma.user.findUnique({
      where: { userID: userID },
      select: {
        userID: true,
      },
    });

    console.log(validUser);

    if (!validUser) {
      throw new NotFoundError("User not found");
    }

    // call the cloudinary service
    const { urls } = await cloudinaryService(file, service);
    console.log(urls);
    const data = await uploadProfileImageService(userID, urls);

    // extract the url from the data response
    const profileImage = data;

    ResponseHandler.success(
      res,
      profileImage,
      200,
      "User profile picture updated successfully"
    );
  } catch (error) {
    // check for prisma errors
    next(error);
  }
};

// // upload profile picture controller
// const uploadProfileImage = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.files) return new BadRequestError(res, "add event image", 400);
//   const userID = req.params.id;
//   const files = req.files as any;
//   const { service, userId } = req.body;

//   try {
//     const imagesRes = await cloudinaryService(files, req.body.service);

//     // verify the user id
//     const validUser = await prisma.user.findUnique({
//       where: { userID },
//       select: {
//         userID: true,
//       },
//     });

//     if (!validUser) {
//       throw new NotFoundError("User not found");
//     }

//     // call the cloudinary service
//     const { urls } = await cloudinaryService(files, service);
//     const data = await uploadProfileImageService(userID, urls);

//     //   extract the url from the data response
//     const profileImage = data;

//     ResponseHandler.success(
//       res,
//       profileImage,
//       200,
//       "User profile picture updated successfully"
//     );
//   } catch (error) {
//     //   check for prisma errors
//     next(error);
//   }
// };

// update contact information by user id
const updateContactInformationByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.id;
  // destructuring the request body

  // verify the user id
  const validUser = await prisma.user.findUnique({
    where: { userID },
    select: {
      userID: true,
    },
  });

  if (!validUser) {
    throw new NotFoundError("User not found");
  }

  try {
    const { email } = req.body as contactInterface;

    // update the user profile
    const updatedUser = await prisma.user.update({
      where: { userID },
      data: {
        email,
      },
    });

    ResponseHandler.success(
      res,
      updatedUser,
      200,
      "User contact information updated successfully"
    );
  } catch (error) {
    //   check for prisma errors
    next(error);
  }
};

// user preferences update controller
const updateUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.id;

  try {
    // Verify the user id
    const validUser = await prisma.user.findUnique({
      where: { userID },
      select: {
        userID: true,
        email: true,
        firstName: true,
      },
    });

    if (!validUser) {
      throw new NotFoundError("User not found");
    }
    const emailVariables = {
      userName: validUser.firstName,
      verify: "www.verify.com",
    };

    const emailStatus = await emailService(
      {
        to: validUser.email,
        subject: "Preferences Updated Successfully",
        variables: emailVariables,
      },
      templatePath
    );

    console.log(emailStatus);

    //  send email
    // const emailContent = {
    //   to: validUser.email,
    //   subject: "Welcome to Evento!",
    //   userName: validUser.firstName,
    //   additionalContent: `Preferences Updated Successfully`,
    // };
    // await emailService(emailContent)(req, res, next);

    if (!emailService) {
      return new BadRequestError("Error sending email");
    }

    const { theme, language, regionalSettings, timeZone } =
      req.body as preferencesInterface;

    if (!theme && !language && !regionalSettings && !timeZone) {
      throw new BadRequestError("One or more fields are required");
    }

    // Check if preferences already exist for the user
    const existingPreferences = await prisma.preferences.findMany({
      where: { userID },
      select: { userID: true },
    });

    // Preferences data
    const preferencesData = {
      theme,
      language,
      regionalSettings,
      timeZone,
    };

    let updatedPreferences;

    if (existingPreferences.length > 0) {
      // Preferences exist, update them
      updatedPreferences = await prisma.preferences.update({
        where: { userID },
        data: preferencesData,
      });
    } else {
      // Preferences don't exist, create new ones
      updatedPreferences = await prisma.preferences.create({
        data: {
          userID,
          ...preferencesData,
        },
      });
    }

    if (!updatedPreferences) {
      throw new InternalServerError("Preferences could not be updated");
    }

    ResponseHandler.success(
      res,
      updatedPreferences,
      200,
      "User preferences updated successfully"
    );
  } catch (error) {
    // Check for Prisma errors
    // if (
    //   error instanceof Prisma.PrismaClientKnownRequestError ||
    //   Prisma.PrismaClientUnknownRequestError
    // ) {
    //   // Assuming error.message contains the provided string
    //   const match = error.message.match(/Argument[^]+$/);

    //   // Extracted substring
    //   const extractedSubstring = match ? match[0] : null;
    //   error = new InternalServerError(
    //     "Invalid Update Data: " + extractedSubstring
    //   );
    // }
    next(error);
  }
};

// delete user controller
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userID = req.params.id;

  try {
    // Verify the user id
    const validUser = await prisma.user.findUnique({
      where: { userID },
      select: {
        userID: true,
        displayName: true,
        myEvents: true,
      },
    });

    if (!validUser) {
      throw new NotFoundError("User not found");
    }

    //   delete user preferences
    await prisma.preferences.delete({
      where: { userID },
    });

    // Delete user events
    // await Promise.all(
    //   validUser.myEvents.map(async (eventID) => {
    //     await prisma.event.delete({
    //       where: { eventID },
    //     });
    //   })
    // );

    // delete users social links
    await prisma.socialLink.deleteMany({
      where: { userID: userID },
    });

    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { userID },
    });

    if (!deletedUser) {
      throw new InternalServerError("User could not be deleted");
    }

    ResponseHandler.success(
      res,
      validUser.displayName,
      200,
      "User deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

// update userpassword controller
const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.id;
  const { oldPassword, newPassword } = req.body;

  try {
    // Verify the user id
    const validUser = await prisma.user.findUnique({
      where: { userID },
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

    if (!oldPassword || !newPassword) {
      throw new BadRequestError("Old password and new password are required");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    // Compare old password with the stored hashed password
    const passwordMatch = await bcript.compare(oldPassword, validUser.password);

    if (!passwordMatch) {
      throw new BadRequestError("Old password is incorrect");
    }

    // Hash the new password
    const hashedPassword = await bcript.hash(newPassword, 10);

    // Generate a confirmation token
    const confirmationToken = generateConfirmationToken(userID, hashedPassword);

    //   if token exists, delete it
    const tokenExists = await prisma.verification.findUnique({
      where: { userID },
    });

    if (tokenExists) {
      const tokenExists = await prisma.verification.delete({
        where: { userID },
      });
    }

    // Save the confirmation token in the database
    await prisma.verification.create({
      data: {
        userID: userID,
        verificationCode: confirmationToken,
        status: "pending",
      },
    });

    const mailedToken = `https://evento-qo6d.onrender.com/api/v1/user/password/confirm?token=${confirmationToken}`;

    // Send the confirmation email
    const emailVariables = {
      userName: validUser.displayName,
      verify: mailedToken,
    };

    const emailStatus = await emailService(
      {
        to: validUser.email,
        subject: "Password Reset",
        variables: emailVariables,
      },
      verifyPasswordTemplate
    );

    if (!emailStatus) {
      throw new InternalServerError("Error changing password");
    }

    // Respond with success
    return ResponseHandler.success(
      res,
      emailStatus,
      200,
      "Password updated successfully"
    );
  } catch (error) {
    return next(error);
  }
};

// Function to check if a token has expired
const isTokenExpired = (creationTime: Date): boolean => {
  const expirationTime = new Date(creationTime);
  expirationTime.setMinutes(expirationTime.getMinutes() + 60); // 5 minutes expiration
  return new Date() > expirationTime;
};

// confirm password change
const confirmPasswordChange = async (
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

    const { userID, hashedNewPassword } = decodedToken;

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
    if (isTokenExpired(tokenExists.timestamp)) {
      throw new BadRequestError("Token has expired");
    }

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

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          throw new BadRequestError("Cannot Redirect User");
        }
        console.log("session destroyed");
        return res.redirect("https://evento1.vercel.app");
      });
    }
  } catch (error) {
    return next(error);
  }
};

// delete user profile image controller
const deleteUserProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userID = req.params.id;

  try {
    // Verify the user id
    const validUser = await prisma.user.findUnique({
      where: { userID },
      select: {
        userID: true,
        profileImage: true,
      },
    });

    if (!validUser) {
      throw new NotFoundError("User not found");
    }

    // call the cloudinary service to delete the image
    await deleteImage(validUser.profileImage);

    if (!validUser.profileImage) {
      throw new BadRequestError("User does not have a profile image");
    }

    // Delete the profile image
    const deletedProfileImage = await prisma.user.update({
      where: { userID },
      data: {
        profileImage: null,
      },
    });

    if (!deletedProfileImage) {
      throw new InternalServerError("Profile image could not be deleted");
    }

    ResponseHandler.success(
      res,
      deletedProfileImage.profileImage,
      200,
      "Profile image deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

// upload profile picture controller
export {
  getUserProfileById,
  updateUserProfileById,
  addSocialLinks,
  getSocialLinksByUserId,
  uploadProfileImage,
  updateContactInformationByUserId,
  updateUserPreferences,
  deleteUser,
  updateUserPassword,
  confirmPasswordChange,
  deleteUserProfileImage,
};
