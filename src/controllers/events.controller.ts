import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { createEventsInterface } from "../interfaces/events.interface";
// import { createEventsService } from "../services/events.service";
import { BadRequestError } from "../middlewares";
import { ResponseHandler } from "../utils";

const { event } = new PrismaClient();

// Controller for creating events
const createEventController: RequestHandler = async (req, res, next) => {
  try {
    // Destructure payload from the request body
    const {
      title,
      description,
      startDate,
      endDate,
      time,
      location,
      capacity,
      entranceFee,
      eventType,
      organizerID,
      categoryID,
    } = req.body as createEventsInterface;

    // Check if there is an existing event with the same title as in the request title payload
    const existingEvent = await event.findFirst({
      where: {
        title,
      },
    });

    // If there is an existing event with the same title, throw an error
    if (existingEvent) {
      throw new BadRequestError("An event with this title already exists.");
    }

    // Create an event
    const newEvent = await event.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        time,
        location,
        capacity,
        entranceFee,
        eventType,
        organizerID,
        categoryID,
      },
    });

    // Return the new event as the response
    ResponseHandler.success(res, newEvent, 201, "Event created successfully.");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export { createEventController };
