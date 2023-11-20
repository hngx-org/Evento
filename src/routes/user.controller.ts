import express, { Router } from "express";
import { getUserProfileById } from "./../controllers/user.controller";

const router: Router = express.Router();

router.get("/user/:id", getUserProfileById);

module.exports = router;
