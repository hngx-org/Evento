import express, { Router } from "express";
import {
  getUserProfileById,
  updateUserProfileById,
} from "./../controllers/user.controller";

const router: Router = express.Router();

router.get("/user/profile/:id", getUserProfileById);

router.patch("/user/profile/edit/:id", updateUserProfileById);

module.exports = router;
