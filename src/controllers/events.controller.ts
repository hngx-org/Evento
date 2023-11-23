import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import {
  createEventsInterface,
  editEventsInterface,
} from "../interfaces/events.interface";
// import { createEventsService } from "../services/events.service";
import { BadRequestError, NotFoundError } from "../middlewares";
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
    next(error);
  }
};

// Controller for getting a single event
const getEventController: RequestHandler = async (req, res, next) => {
  try {
    // Destructure the event ID from the request params
    const { eventID } = req.params;

    // Get the event
    const foundEvent = await event.findFirst({
      where: {
        eventID,
      },
    });

    // If the event is not found, throw an error
    if (!foundEvent) {
      throw new NotFoundError("Event not found.");
    }

    // Return the found event as the response
    ResponseHandler.success(res, foundEvent, 200, "Event found.");
  } catch (error) {
    next(error);
  }
};

// Controller for getting all events
const getAllEventsController: RequestHandler = async (req, res, next) => {
  try {
    // Get all events
    const events = await event.findMany();

    // Return the events as the response
    ResponseHandler.success(res, events, 200, "Events found.");
  } catch (error) {
    next(error);
  }
};

// Controller for editing events
const editEventController: RequestHandler = async (req, res, next) => {
  try {
    // Destructure the event ID from the request params
    const { eventID } = req.params;

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
    } = req.body as editEventsInterface;

    // Check if there is an existing event with the same title as in the request title payload
    // const existingEvent = await event.findFirst({
    //   where: {
    //     title,
    //   },
    // });

    // If there is an existing event with the same title, throw an error
    // if (existingEvent) {
    //   throw new BadRequestError("An event with this title already exists.");
    // }

    // Update the event
    const updatedEvent = await event.update({
      where: { eventID },
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
      select: {
        eventID: true,
        title: true,
        description: true,
      },
    });

    // Return the updated event as the response
    ResponseHandler.success(
      res,
      updatedEvent,
      201,
      "Event updated successfully."
    );
  } catch (error) {
    next(error);
  }
};

export {
  createEventController,
  getEventController,
  getAllEventsController,
  editEventController,
};
