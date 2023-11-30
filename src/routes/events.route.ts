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

const eventsRouter = Router();

// Upload event image route
eventsRouter.post(
  "/events/upload",
  upload.single("event-image"),
  uploadEventImageController
);

// Create a new event route
eventsRouter.post("/events/create", createEventController);

// Get a single event route
eventsRouter.get("/events/:eventID", getEventController);

// Get all events route
eventsRouter.get("/events", getAllEventsController);

// Edit an event route
eventsRouter.put("/events/edit/:eventID", editEventController);

// Delete an event route
eventsRouter.delete("/events/delete/:eventID", deleteEventController);

// Register for an event route
eventsRouter.post("/events/register", registerForEventController);

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
 *
 * /api/v1/events/upload:
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
 *
 * /api/v1/events/create:
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
 *
 * /api/v1/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
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
 *
 * /api/v1/events/edit/{eventID}:
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
 *
 * /api/v1/events/delete/{eventID}:
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
 * /api/v1/events/register:
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
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *               entranceFee:
 *                 type: number
 *               eventType:
 *                 type: string
 *               organizerID:
 *                 type: number
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
 *             title: "Event 1"
 *             description: "Event 1 description"
 *             imageURL: "https://example.com/image.jpg"
 *             startDate: "2021-01-01"
 *             endDate: "2021-01-01"
 *             time: "12:00:00"
 *             location: "Event 1 location"
 *             capacity: 100
 *             entranceFee: 1000
 *             eventType: "Event 1 type"
 *             organizerID: 1
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
 *         time:
 *           type: string
 *           format: time
 *           description: The event time
 *         location:
 *           type: string
 *           description: The event location
 *         capacity:
 *           type: number
 *           description: The event capacity
 *         entranceFee:
 *           type: number
 *           description: The event entrance fee
 *         eventType:
 *           type: string
 *           description: The event type
 *         organizerID:
 *           type: number
 *           description: The event organizer ID
 *         categoryID:
 *           type: number
 *           description: The event category ID
 *       example:
 *         title: "Event 1"
 *         description: "Event 1 description"
 *         imageURL: "https://example.com/image.jpg"
 *         startDate: "2023-11-19T12:30:00.000Z"
 *         endDate: "2023-11-22T01:00:00.000Z"
 *         time: "2023-11-19T12:00:00.000Z"
 *         location: "Event 1 location"
 *         capacity: 100
 *         entranceFee: 1000
 *         eventType: "Event 1 type"
 *         organizerID: "ab73f292-9267-4167-81f2-d85e9bd950d3"
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
