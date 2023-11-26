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

import {
  userInterface,
  socialInterface,
  contactInterface,
} from "../interfaces/user.interface";

import { uploadProfileImageService } from "../services/profileimage";
import { cloudinaryService } from "../services/imageupload";

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

// Add Social Links to User Profile
const addSocialLinks = async (
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
    const { websiteURL, twitterURL, facebookURL, instagramURL } =
      req.body as socialInterface;

    // update the social links table
    const sociallink = await prisma.socialLink.create({
      data: {
        userID,
        websiteURL,
        twitterURL,
        facebookURL,
        instagramURL,
      },
    });

    if (!sociallink) {
      throw new NotFoundError("Social link not added");
    }

    //

    ResponseHandler.success(
      res,
      sociallink,
      200,
      "Social link Added successfully"
    );
  } catch (error) {
    //   check for prisma errors
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

    ResponseHandler.success(
      res,
      socialLinks,
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
  console.log("start");
  if (!req.file) {
    throw new BadRequestError("Please add a Profile Image");
  }

  console.log(req.file);

  const userID = req.params.id;
  const file = req.file as any;
  const { service } = req.body;

  try {
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

// upload profile picture controller
export {
  getUserProfileById,
  updateUserProfileById,
  addSocialLinks,
  getSocialLinksByUserId,
  uploadProfileImage,
  updateContactInformationByUserId,
};
