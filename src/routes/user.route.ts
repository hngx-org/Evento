import express, { Router } from "express";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../middlewares";
import {
  getUserProfileById,
  updateUserProfileById,
  addSocialLinks,
  getSocialLinksByUserId,
  uploadProfileImage,
  updateUserPreferences,
  deleteUser,
  updateUserPassword,
  deleteUserProfileImage,
  uploadProfileCoverImage,
  deleteUserCoverImage,
} from "./../controllers/user.controller";

const router: Router = express.Router();

const storage = multer.memoryStorage();
const uploads = multer({ storage: storage }).single("file");
// const uploads = multer({ dest: "uploads/" }).single("file");
const uploadHandler = (req: Request, res: Response, next: NextFunction) => {
  uploads(req, res, function (err) {
    if (err) {
      const newForbbidenError = new ForbiddenError("You must upload one image");
      next(newForbbidenError);
    }
    console.log(req.file, "here");
    next();
  });
};

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         userID:
 *           type: string
 *         email:
 *           type: string
 *         bio:
 *           type: string
 *         socialLinks:
 *           type: string
 *         websiteURL:
 *           type: string
 *         profileImage:
 *           type: string
 *         googleAccountID:
 *           type: string
 *         displayName:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         slug:
 *           type: string
 *         role:
 *           type: string
 *         location:
 *           type: string
 *     SocialLinkResponse:
 *       type: object
 *       properties:
 *         platform:
 *           type: string
 *         url:
 *           type: string
 *     SocialLinkRequest:
 *       type: object
 *       properties:
 *         platform:
 *           type: string
 *         url:
 *           type: string
 *     UserProfileUpdateRequest:
 *       type: object
 *       properties:
 *         bio:
 *           type: string
 *         websiteURL:
 *           type: string
 *         displayName:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         location:
 *           type: string
 *     SocialLinkListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/SocialLinkResponse'
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 */

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get User Profile by ID
 *     description: Retrieve user profile details by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userID:
 *                   type: string
 *                 email:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 socialLinks:
 *                   type: array
 *                 items:
 *                   $ref: '#/components/schemas/SocialLinkResponse'
 *                 websiteURL:
 *                   type: string
 *                 profileImage:
 *                   type: string
 *                 googleAccountID:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 role:
 *                   type: string
 *                 location:
 *                   type: string
 */
router.get("/user/:id/profile", getUserProfileById);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   patch:
 *     summary: Update User Profile by ID
 *     description: Update user profile details by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated user profile data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 */
router.patch("/user/:id", updateUserProfileById);

/**
 * @swagger
 * /api/v1/user/{id}/social:
 *   post:
 *     summary: Add Social Links to User Profile
 *     description: Add social links to the user profile by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to add social links
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Social link data to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.post("/user/:id/social", addSocialLinks);

/**
 * @swagger
 * /api/v1/user/{id}/social:
 *   get:
 *     summary: Get Social Links by User ID
 *     description: Retrieve social links associated with the user profile by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to retrieve social links
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.get("/user/:id/social", getSocialLinksByUserId);

/**
 * @swagger
 * paths:
 *   /api/v1/user/{id}/image:
 *     post:
 *       summary: Upload a profile image for a user.
 *       description: Uploads a profile image for the specified user ID.
 *       tags: [User]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the user for whom the profile image is being uploaded.
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   type: string
 *                   format: binary
 *       responses:
 *         '200':
 *           description: Profile image uploaded successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   successful:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                   urls:
 *                     type: array
 *                     items:
 *                       type: string
 *         '400':
 *           description: Bad Request. The request is missing required parameters.
 *         '500':
 *           description: Internal Server Error. An error occurred while processing the request.
 */
router.post("/user/:id/image", uploadHandler, uploadProfileImage);

/**
 * @swagger
 * /api/v1/user/{id}/preferences:
 *   patch:
 *     summary: Update User Preferences by ID
 *     description: Update user preferences by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to update preferences
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated user preferences data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.post("/user/:id/preferences", updateUserPreferences);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Delete User by ID
 *     description: Delete user by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.delete("/user/:id", deleteUser);

/**
 * @swagger
 * /api/v1/user/{id}/password:
 *   patch:
 *     summary: Update User Password by ID
 *     description: Update user password by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to update password
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated user password data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.post("/user/:id/password", updateUserPassword);

/**
 * @swagger
 * /api/v1/user/{id}/image:
 *   delete:
 *     summary: Delete User Profile Image by ID
 *     description: Delete user profile image by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to delete profile image
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
router.delete("/user/:id/image", deleteUserProfileImage);

/**
 * @swagger
 * paths:
 *   /api/v1/user/{id}/cover:
 *     post:
 *       summary: Upload a cover image for a user.
 *       description: Uploads a cover image for the specified user ID.
 *       tags: [User]
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the user for whom the cover image is being uploaded.
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   type: string
 *                   format: binary
 *       responses:
 *         '200':
 *           description: Cover image uploaded successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   successful:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                   urls:
 *                     type: array
 *                     items:
 *                       type: string
 *         '400':
 *           description: Bad Request. The request is missing required parameters.
 *         '500':
 *           description: Internal Server Error. An error occurred while processing the request.
 */
router.post("/user/:id/cover", uploadHandler, uploadProfileCoverImage);

/**
 * @swagger
 * /api/v1/user/{id}/cover:
 *   delete:
 *     summary: Delete User Cover Image by ID
 *     description: Delete user cover image by user ID.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to delete cover image
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */

router.delete("/user/:id/cover", deleteUserCoverImage);

module.exports = router;
