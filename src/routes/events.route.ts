import { Router } from "express";
import {
  uploadEventImageController,
  createEventController,
  getEventController,
  getAllEventsController,
  editEventController,
  deleteEventController,
  registerForEventController,
} from "../controllers/events.controller";
import { upload } from "../services/events.service";
import { authenticateJWT } from "../middlewares";

const eventsRouter = Router();

// Upload event image route
eventsRouter.post(
  "/events/image",
  upload.single("event-image"),
  uploadEventImageController
);

// Create a new event route
eventsRouter.post("/events", authenticateJWT, createEventController);

// Get a single event route
eventsRouter.get("/events/:eventID", getEventController);

// Get all events route
eventsRouter.get("/events", getAllEventsController);

// Edit an event route
eventsRouter.put("/events/:eventID", authenticateJWT, editEventController);

// Delete an event route
eventsRouter.delete("/events/:eventID", authenticateJWT, deleteEventController);

// Register for an event route
eventsRouter.post(
  "/events/registration",
  authenticateJWT,
  registerForEventController
);

/**
 * @swagger
 * components:
 *   schemas:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Events Endpoints
 */

/**
 * @swagger
 * /api/v1/events/image:
 *   post:
 *     summary: Upload an event image
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               event-image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageURL:
 *                   type: string
 *                   format: uri
 *                   description: The URL of the uploaded image
 *               example:
 *                 imageURL: "https://example.com/image.jpg"
 */

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventRequest'
 *     responses:
 *       '201':
 *         description: The event was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       '200':
 *         description: The list of all events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *
 * /api/v1/events/{eventID}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The event ID
 *     responses:
 *       '200':
 *         description: The event description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       '404':
 *         description: The event was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 */

/**
 * @swagger
 * /api/v1/events/{eventID}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventRequest'
 *     responses:
 *       '200':
 *         description: The event was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time of the response in ISO 8601 format
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful or not
 *                 status:
 *                   type: number
 *                   description: The status code of the response
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventID:
 *                       type: number
 *                       description: The event ID
 *                     title:
 *                       type: string
 *                       description: The event title
 *                     description:
 *                       type: string
 *                       description: The event description
 *                 message:
 *                   type: string
 *                   description: A message describing the response
 *       '404':
 *         description: The event was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 */

/**
 * @swagger
 * /api/v1/events/{eventID}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the event to be deleted
 *     responses:
 *       '200':
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time of the response in ISO 8601 format
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful or not
 *                 status:
 *                   type: number
 *                   description: The status code of the response
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventID:
 *                       type: number
 *                       description: The event ID
 *                     title:
 *                       type: string
 *                       description: The event title
 *                     description:
 *                       type: string
 *                       description: The event description
 *                 message:
 *                   type: string
 *                   description: A message describing the response
 *       '404':
 *         description: The event was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 */

/**
 * @swagger
 * /api/v1/events/registration:
 *   post:
 *     summary: Register for an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventID:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the event to register for
 *               userID:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user registering for the event
 *     responses:
 *       '200':
 *         description: User registered for the event successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventID:
 *                   type: string
 *                   format: uuid
 *                   description: The ID of the event
 *                 title:
 *                   type: string
 *                   description: The title of the event
 *                 description:
 *                   type: string
 *                   description: The description of the event
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userID:
 *                         type: string
 *                         format: uuid
 *                         description: The ID of the registered user
 *                 message:
 *                   type: string
 *                   description: A message describing the response
 *               example:
 *                 eventID: "123e4567-e89b-12d3-a456-426614174001"
 *                 title: "Sample Event"
 *                 description: "This is a sample event."
 *                 participants: [{ userID: "98765432-abcdef-1234-5678-fedcba987654" }]
 *                 message: "You have been registered for this event."
 *       '404':
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       '409':
 *         description: Conflict - User already registered for the event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictErrorResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EventResponse:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The date and time of the response in ISO 8601 format
 *         success:
 *           type: boolean
 *           description: Whether the request was successful or not
 *         status:
 *           type: number
 *           description: The status code of the response
 *         data:
 *           type: array | object
 *           items:
 *             type: object | any
 *             properties:
 *               eventID:
 *                 type: number
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageURL:
 *                 type: string
 *                 format: uri
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               locationType:
 *                 type: string
 *               location:
 *                 type: string
 *               virtualLocationLink:
 *                 type: string
 *                 format: uri
 *               capacity:
 *                 type: number
 *               organizer:
 *                 type: object
 *               category:
 *                 type: object
 *               tickets:
 *                 type: array
 *                 items:
 *                   type: object
 *           description: The data returned by the request
 *         message:
 *           type: string
 *           description: A message describing the response
 *       example:
 *         timestamp: "2021-01-01T00:00:00.000Z"
 *         success: true
 *         status: 200
 *         data:
 *           - eventID: 1
 *             title: "Event"
 *             description: "Event description"
 *             imageURL: "https://example.com/image.jpg"
 *             startDate: "2021-01-01"
 *             endDate: "2021-01-01"
 *             locationType: "Physical"
 *             location: "Event location"
 *             virtualLocationLink: "https://example.com"
 *             capacity: 100
 *             organizerID: ab73f292-9267-4167-81f2-d85e9bd950d3
 *             categoryCategoryID: 213af030-f7a5-46da-9cd7-6ecb8c0736b6
 *             organizer:
 *               userID: ab73f292-9267-4167-81f2-d85e9bd950d3
 *               email: "test@mail.com"
 *               profileImageURL: "https://example.com/image.jpg"
 *               firstName: "John"
 *               lastName: "Doe"
 *             Category:
 *               categoryID: 213af030-f7a5-46da-9cd7-6ecb8c0736b6
 *               name: "Tech"
 *             tickets:
 *               - ticketID: 1
 *                 ticketType: "Free"
 *                 ticketPrice: 0
 *         message: "Sample success message"
 *     EventRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The event title
 *         description:
 *           type: string
 *           description: The event description
 *         imageURL:
 *           type: string
 *           format: uri
 *           description: The event image URL
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The event start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The event end date
 *         locationType:
 *           type: string
 *           description: The event location type
 *         location:
 *           type: string
 *           description: The event location
 *         virtualLocationLink:
 *           type: string
 *           format: uri
 *           description: The event virtual location link
 *         capacity:
 *           type: number
 *           description: The event capacity
 *         organizerID:
 *           type: number
 *           description: The event organizer ID
 *         categoryName:
 *           type: string
 *           description: The event category name
 *         ticketType:
 *           type: string
 *           description: The event ticket type
 *         ticketPrice:
 *           type: number
 *           description: The event ticket price
 *       example:
 *         title: "Event"
 *         description: "Event description"
 *         imageURL: "https://example.com/image.jpg"
 *         startDate: "2023-11-19T12:30:00.000Z"
 *         endDate: "2023-11-22T01:00:00.000Z"
 *         locationType: "Physical"
 *         location: "Event location"
 *         virtualLocationLink: "https://example.com"
 *         capacity: 100
 *         organizerID: "ab73f292-9267-4167-81f2-d85e9bd950d3"
 *         categoryName: "Tech"
 *         ticketType: "Free"
 *         ticketPrice: 0
 *     NotFoundErrorResponse:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The date and time of the response in ISO 8601 format
 *         success:
 *           type: boolean
 *           description: Whether the request was successful or not
 *         status:
 *           type: number
 *           description: The status code of the response
 *         message:
 *           type: string
 *           description: A message describing the response
 *       example:
 *         timestamp: "2021-01-01T00:00:00.000Z"
 *         success: false
 *         status: 404
 *         message: "Sample error message"
 *     ConflictErrorResponse:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The date and time of the response in ISO 8601 format
 *         success:
 *           type: boolean
 *           description: Whether the request was successful or not
 *         status:
 *           type: number
 *           description: The status code of the response
 *         message:
 *           type: string
 *           description: A message describing the response
 *       example:
 *         timestamp: "2021-01-01T00:00:00.000Z"
 *         success: false
 *         status: 409
 *         message: "Sample error message"
 */

module.exports = eventsRouter;
