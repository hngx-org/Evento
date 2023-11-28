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
 */

/**
 * @swagger
 * /api/v1/user/profile/{id}:
 *   get:
 *     summary: Get User Profile by ID
 *     description: Retrieve user profile details by user ID.
 *     tags: [User]
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
router.get("/user/profile/:id", getUserProfileById);

/**
 * @swagger
 * /api/v1/user/profile/edit/{id}:
 *   patch:
 *     summary: Update User Profile by ID
 *     description: Update user profile details by user ID.
 *     tags: [User]
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
router.patch("/user/profile/edit/:id", updateUserProfileById);

/**
 * @swagger
 * /api/v1/user/profile/social/add/{id}:
 *   post:
 *     summary: Add Social Links to User Profile
 *     description: Add social links to the user profile by user ID.
 *     tags: [User]
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
router.post("/user/profile/social/add/:id", addSocialLinks);

/**
 * @swagger
 * /api/v1/user/profile/social/{id}:
 *   get:
 *     summary: Get Social Links by User ID
 *     description: Retrieve social links associated with the user profile by user ID.
 *     tags: [User]
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
router.get("/user/profile/social/:id", getSocialLinksByUserId);

/**
 * @swagger
 * paths:
 *   /api/v1/user/profile/image/upload/{id}:
 *     post:
 *       summary: Upload a profile image for a user.
 *       description: Uploads a profile image for the specified user ID.
 *       tags: [User]
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
router.post(
  "/user/profile/image/upload/:id",
  uploadHandler,
  uploadProfileImage
);

module.exports = router;
