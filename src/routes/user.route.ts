import express, { Router } from "express";
import {
  getUserProfileById,
  updateUserProfileById,
  addSocialLinks,
} from "./../controllers/user.controller";

const router: Router = express.Router();

router.get("/user/profile/:id", getUserProfileById);

router.patch("/user/profile/edit/:id", updateUserProfileById);

router.post("/user/profile/social/add/:id", addSocialLinks);

module.exports = router;
