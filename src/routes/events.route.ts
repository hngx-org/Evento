import { Router } from "express";
import { createEventController } from "../controllers/events.controller";

const eventsRouter = Router();

eventsRouter.post("/events/create", createEventController);

module.exports = eventsRouter;
