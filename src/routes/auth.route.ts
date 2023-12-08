import express, { Router, Request, Response, NextFunction } from "express";
import {
  login,
  register,
  google,
  oauthToken,
  generateOTP,
  verifyOTP,
  validateOTP,
  disableOTP,
  resetPassword,
  confirmUserExists,
  updateUserPassword,
  generateToken,
} from "../controllers/auth.controller";

import { confirmPasswordChange } from "../controllers/user.controller";

import { authenticateJWT } from "../middlewares/auth";
import passport from "../utils/passport";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *     UserResponse:
 *       type: object
 *       properties:
 *         userID:
 *           type: string
 *         email:
 *           type: string
 *     LoginCredentials:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     AuthorizationResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/register", register);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Unauthorized - Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", login);

router.get("/login", (req, res) => {
  res.send("Login page");
});

/**
 * @swagger
 * /api/v1/google:
 *   get:
 *     summary: Redirect to Google for authentication
 *     tags: [Authentication]
 *     responses:
 *       '302':
 *         description: Redirect to Google for authentication
 *         headers:
 *           Location:
 *             description: URL to redirect for Google authentication
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized - Google authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/google", google);

router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    const token = generateToken(req.user);
    const { userID } = req.user as { userID: string };
    res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.cookie("userId", userID, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    //   res.redirect("https://evento1.vercel.app/event-dashboard");
    res.redirect("http://localhost:3000/event-dashboard");
  }
);

/**
 * @swagger
 * /api/v1/logout:
 *   delete:
 *     summary: Log out the current user
 *     tags: [Authentication]
 *     responses:
 *       '302':
 *         description: Redirect to the home page after successful logout
 *         headers:
 *           Location:
 *             description: URL to redirect after logout
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/logout", function (req, res, next) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("https://evento1.vercel.app");
    });
  }
});

/**
 * @swagger
 * /api/v1/authorize:
 *   get:
 *     summary: Generate authorization token for the current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Authorization token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorizationResponse'
 *       '401':
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/authorize", oauthToken);
router.post("/authorize", oauthToken);

router.get("/protected", authenticateJWT, (req, res) => {
  res.send({ msg: "I am protected and you are authorized" });
});

/**
 * @swagger
 * /api/v1/generate-otp/{id}:
 *   get:
 *     summary: Generate OTP for a user
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: User ID for OTP generation
 *     responses:
 *       '200':
 *         description: OTP generated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP generated successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/generate-otp/:id", generateOTP);
/**
 * @swagger
 * /api/v1/verify-otp:
 *   post:
 *     summary: Verify OTP for a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               userID:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP verified successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/verify-otp", verifyOTP);
/**
 * @swagger
 * /api/v1/validate-otp:
 *   post:
 *     summary: Validate OTP for a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OTP validated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP validated successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/validate-otp", validateOTP);
/**
 * @swagger
 * /api/v1/disable-otp/{id}:
 *   post:
 *     summary: Disable OTP for a user
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: User ID for OTP disabling
 *     responses:
 *       '200':
 *         description: OTP disabled successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP disabled successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post("/disable-otp/:id", disableOTP);

/**
 * @swagger
 * /api/v1/reset-password:
 *   post:
 *     summary: Reset password for a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset link sent successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/v1/reset-password:
 *   get:
 *     summary: Confirm user exists
 *     tags: [Authentication]
 *     responses:
 *       '200':
 *         description: User exists
 *         content:
 *           application/json:
 *             example:
 *               message: User exists
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/reset-password", confirmUserExists);

/**
 * @swagger
 * /api/v1/reset-password:
 *   patch:
 *     summary: Update user password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password updated successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/reset-password", updateUserPassword);

/**
 * @swagger
 * /api/v1/user/confirm-password:
 *   get:
 *     summary: Confirm password change
 *     tags: [Authentication]
 *     responses:
 *       '200':
 *         description: Password change confirmed
 *         content:
 *           application/json:
 *             example:
 *               message: Password change confirmed
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/user/confirm-password", confirmPasswordChange);
module.exports = router;
