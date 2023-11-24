import express, { Router } from "express";
import {
  getUserProfileById,
  updateUserProfileById,
  addSocialLinks,
  getSocialLinksByUserId,
} from "./../controllers/user.controller";

const router: Router = express.Router();

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
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SocialLinkResponse'
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
 *
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     SocialLinkResponse:
 *       type: object
 *       properties:
 *         platform:
 *           type: string
 *         url:
 *           type: string
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
 *
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
 *             $ref: '#/components/schemas/UserProfileUpdateRequest'
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
 *             $ref: '#/components/schemas/SocialLinkRequest'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialLinkResponse'
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
 *               $ref: '#/components/schemas/SocialLinkListResponse'
 */
router.get("/user/profile/social/:id", getSocialLinksByUserId);

module.exports = router;
