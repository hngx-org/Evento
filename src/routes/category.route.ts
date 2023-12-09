import { Router } from "express";
import {
  getAllCategoriesController,
  getEventsByCategoryController,
} from "../controllers/category.controller";

const categoryRouter = Router();

// Get all categories
categoryRouter.get("/categories", getAllCategoriesController);

// Get events by category
categoryRouter.get(
  "/categories/:categoryID/events",
  getEventsByCategoryController
);

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       '200':
 *         description: Categories found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryResponse'
 *               description: The list of all categories
 *         example:
 *           - categoryID: "123e4567-e89b-12d3-a456-426614174000"
 *             name: "Category 1"
 *             description: "Description of Category 1"
 *           - categoryID: "123e4567-e89b-12d3-a456-426614174001"
 *             name: "Category 2"
 *             description: "Description of Category 2"
 *       '500':
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'

 * /api/v1/categories/{categoryID}/events:
 *   get:
 *     summary: Get events by category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the category to get events for
 *     responses:
 *       '200':
 *         description: Category with its events found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryWithEventsResponse'
 *         example:
 *           categoryID: "123e4567-e89b-12d3-a456-426614174000"
 *           name: "Category 1"
 *           description: "Description of Category 1"
 *           events:
 *             - eventID: "123e4567-e89b-12d3-a456-426614174100"
 *               title: "Event 1"
 *               description: "Description of Event 1"
 *               startDate: "2023-01-01T12:00:00.000Z"
 *               endDate: "2023-01-01T14:00:00.000Z"
 *               location: "Location 1"
 *               capacity: 100
 *               entranceFee: 10
 *               eventType: "Type 1"
 *               organizerID: "123e4567-e89b-12d3-a456-426614174999"
 *       '404':
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       '500':
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         categoryID:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         description:
 *           type: string
 *           description: The description of the category
 *       example:
 *         categoryID: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Category 1"
 *         description: "Description of Category 1"
 *
 *     CategoryWithEventsResponse:
 *       type: object
 *       properties:
 *         categoryID:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         description:
 *           type: string
 *           description: The description of the category
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryEventResponse'
 *           description: The events associated with the category
 *       example:
 *         categoryID: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Category 1"
 *         description: "Description of Category 1"
 *         events:
 *           - eventID: "123e4567-e89b-12d3-a456-426614174100"
 *             title: "Event 1"
 *             description: "Description of Event 1"
 *             startDate: "2023-01-01T12:00:00.000Z"
 *             endDate: "2023-01-01T14:00:00.000Z"
 *             location: "Location 1"
 *             capacity: 100
 *             entranceFee: 10
 *             eventType: "Type 1"
 *             organizerID: "123e4567-e89b-12d3-a456-426614174999"
 *
 *     NotFoundErrorResponse:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The date and time of the response in ISO 8601 format
 *         status:
 *           type: number
 *           description: The status code of the response
 *         error:
 *           type: string
 *           description: The error message
 *         message:
 *           type: string
 *           description: A message describing the response
 *       example:
 *         timestamp: "2021-01-01T00:00:00.000Z"
 *         status: 404
 *         error: "Not Found"
 *         message: "Category not found."
 *
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The date and time of the response in ISO 8601 format
 *         status:
 *           type: number
 *           description: The status code of the response
 *         error:
 *           type: string
 *           description: The error message
 *         message:
 *           type: string
 *           description: A message describing the response
 *       example:
 *         timestamp: "2021-01-01T00:00:00.000Z"
 *         status: 500
 *         error: "Internal Server Error"
 *         message: "Some server error"
 *
 *     CategoryEventResponse:
 *       type: object
 *       properties:
 *         eventID:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the event
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           description: The description of the event
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The start date of the event
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The end date of the event
 *         location:
 *           type: string
 *           description: The location of the event
 *         capacity:
 *           type: number
 *           description: The capacity of the event
 *         entranceFee:
 *           type: number
 *           description: The entrance fee for the event
 *         eventType:
 *           type: string
 *           description: The type or category of the event
 *         organizerID:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the event organizer
 *       example:
 *         eventID: "123e4567-e89b-12d3-a456-426614174100"
 *         title: "Event 1"
 *         description: "Description of Event 1"
 *         startDate: "2023-01-01T12:00:00.000Z"
 *         endDate: "2023-01-01T14:00:00.000Z"
 *         location: "Location 1"
 *         capacity: 100
 *         entranceFee: 10
 *         eventType: "Type 1"
 *         organizerID: "123e4567-e89b-12d3-a456-426614174999"
 */

module.exports = categoryRouter;
