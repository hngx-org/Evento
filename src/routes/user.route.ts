import express, { Router } from "express";
import {
  getUserProfileById,
  updateUserProfileById,
} from "./../controllers/user.controller";

const router: Router = express.Router();

router.get("/user/:id", getUserProfileById);

router.patch("/user/:id", updateUserProfileById);

module.exports = router;
