import { Router } from "express";
import {
  createEventController,
  getEventController,
  editEventController,
} from "../controllers/events.controller";

const eventsRouter = Router();

// Create a new event route
eventsRouter.post("/events/create", createEventController);

// Get a single event route
eventsRouter.get("/events/:eventID", getEventController);

// Edit an event route
eventsRouter.put("/events/edit/:eventID", editEventController);

module.exports = eventsRouter;
