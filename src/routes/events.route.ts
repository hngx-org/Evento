import { Router } from "express";
import {
  createEventController,
  editEventController,
} from "../controllers/events.controller";

const eventsRouter = Router();

eventsRouter.post("/events/create", createEventController);

eventsRouter.put("/events/edit/:eventID", editEventController);

module.exports = eventsRouter;
