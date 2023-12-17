import { validationMiddleware } from "../validationMiddleware";
import { RequestHandler } from "express";

import { z } from "zod";

// Define shared schemas
const uuidSchema = z
  .string()
  .refine(
    (value) =>
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        value
      ),
    {
      message: "Invalid UUID format",
    }
  );

const socialLinksSchema = z.object({
  websiteURL: z.string().optional(),
  twitterURL: z.string().optional(),
  facebookURL: z.string().optional(),
  instagramURL: z.string().optional(),
});

const preferencesSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  regionalSettings: z.string().optional(),
  timeZone: z.string().optional(),
});

// Controller-specific schemas

// getUserProfileById
const getUserProfileByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// updateUserProfileById
const updateUserProfileByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
  }),
});

// addSocialLinks
const addSocialLinksSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: socialLinksSchema,
});

// getSocialLinksByUserId
const getSocialLinksByUserIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// uploadProfileImage
const uploadProfileImageSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    service: z.string(),
  }),
});

// updateContactInformationByUserId
const updateContactInformationByUserIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    email: z.string().optional(),
  }),
});

// updateUserPreferences
const updateUserPreferencesSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: preferencesSchema,
});

// deleteUser
const deleteUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// updateUserPassword
const updateUserPasswordSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
  }),
});

// confirmPasswordChange
const confirmPasswordChangeSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
});

// deleteUserProfileImage
const deleteUserProfileImageSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// uploadProfileCoverImage
const uploadProfileCoverImageSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    service: z.string(),
  }),
});

// deleteUserCoverImage
const deleteUserCoverImageSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export {
  getUserProfileByIdSchema,
  updateUserProfileByIdSchema,
  addSocialLinksSchema,
  getSocialLinksByUserIdSchema,
  uploadProfileImageSchema,
  updateContactInformationByUserIdSchema,
  updateUserPreferencesSchema,
  deleteUserSchema,
  updateUserPasswordSchema,
  confirmPasswordChangeSchema,
  deleteUserProfileImageSchema,
  uploadProfileCoverImageSchema,
  deleteUserCoverImageSchema,
};
