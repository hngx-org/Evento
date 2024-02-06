import { RequestHandler } from "express";
import { z } from "zod";

// Events validation schemas
const urlRegex = /^(http|https):\/\/.*/;

export const eventIdSchema = z.object({
  params: z.object({
    eventID: z
      .string({
        required_error: "Please provide an event ID in the url parameter.",
        invalid_type_error: "Event ID must be a string.",
      })
      .trim()
      .uuid({ message: "Event ID must be a valid UUID." }),
  }),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Please provide a title for the event.",
        invalid_type_error: "Title must be a string.",
      })
      .min(5, { message: "Title must be at least 5 characters long." })
      .max(50, { message: "Title must be at most 50 characters long." })
      .trim(),
    description: z
      .string({
        required_error: "Please provide a description for the event.",
        invalid_type_error: "Description must be a string.",
      })
      .min(5, { message: "Description must be at least 5 characters long." })
      .max(3000, { message: "Description must be at most 3000 characters long." })
      .trim(),
    imageURL: z
      .string({
        required_error: "Please provide an image URL for the event.",
        invalid_type_error: "Image URL must be a string.",
      })
      .url({ message: "Image URL must be a valid URL." }),
    startDate: z
      .string({
        required_error: "Please provide a start date for the event.",
        invalid_type_error: "Start date must be a string.",
      })
      .datetime({ message: "Start date must be in valid ISO date format." }),
    endDate: z
      .string({
        required_error: "Please provide an end date for the event.",
        invalid_type_error: "End date must be a string.",
      })
      .datetime({ message: "End date must be in valid ISO date format." }),
    locationType: z
      .string({
        required_error: "Please provide a location type for the event.",
        invalid_type_error: "Location type must be a string.",
      })
      .trim()
      .min(5, { message: "Location type must be at least 5 characters long." }),
    location: z
      .string({
        invalid_type_error: "Location must be a string.",
      })
      .refine((value) => value === "" || value.trim().length >= 5, {
        message: "Location must be at least 5 characters long.",
      }),
    virtualLocationLink: z
      .string({
        required_error: "Please provide a virtual location link for the event.",
        invalid_type_error: "Virtual location link must be a string.",
      })
      .refine((value) => value === "" || urlRegex.test(value), {
        message: "Virtual location link must be a valid URL.",
      }),
    capacity: z.number({
      required_error: "Please provide a capacity for the event.",
      invalid_type_error: "Capacity must be a number.",
    }),
    organizerID: z
      .string({
        required_error: "Please provide an organizer ID for the event.",
        invalid_type_error: "Organizer ID must be a string.",
      })
      .trim()
      .uuid({ message: "Organizer ID must be a valid UUID." }),
    categoryName: z
      .string({
        required_error: "Please provide a category name for the event.",
        invalid_type_error: "Category name must be a string.",
      })
      .trim(),
    ticketType: z
      .string({
        required_error: "Please provide a ticket type for the event.",
        invalid_type_error: "Ticket type must be a string.",
      })
      .trim(),
    ticketPrice: z.number({
      required_error: "Please provide a ticket price for the event.",
      invalid_type_error: "Ticket price must be a number.",
    }),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({ ...eventIdSchema.shape.params.shape }),
  body: createEventSchema.shape.body.extend({
    ticketID: z
      .string({
        required_error: "Please provide a ticket ID for the event.",
        invalid_type_error: "Ticket ID must be a string.",
      })
      .trim()
      .uuid({ message: "Ticket ID must be a valid UUID." }),
  }),
});

export const registerForEventSchema = z.object({
  body: z.object({
    eventID: z
      .string({
        required_error: "Please provide an event ID in the url parameter.",
        invalid_type_error: "Event ID must be a string.",
      })
      .trim()
      .uuid({ message: "Event ID must be a valid UUID." }),
    userID: z
      .string({
        required_error: "Please provide a user ID in the url parameter.",
        invalid_type_error: "User ID must be a string.",
      })
      .trim()
      .uuid({ message: "User ID must be a valid UUID." }),
  }),
});
