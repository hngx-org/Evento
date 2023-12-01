import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../middlewares";
import { ResponseHandler } from "../utils";

const { category } = new PrismaClient();

// Controller for getting all categories
const getAllCategoriesController: RequestHandler = async (req, res, next) => {
  try {
    // Get all categories from the database
    const categories = await category.findMany();

    // Return the categories as the response
    ResponseHandler.success(res, categories, 200, "Categories found.");
  } catch (error) {
    next(error);
  }
};

// Controller for getting events that belong to a category
const getEventsByCategoryController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // Get the category name from the request parameters
    const { categoryID } = req.params;

    // Get the category from the database
    const foundCategory = await category.findUnique({
      where: {
        categoryID,
      },
      include: {
        events: {
          include: {
            participants: {
              select: {
                userID: true,
                email: true,
                profileImage: true,
                firstName: true,
                lastName: true,
              },
            },
            Category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // If the category is not found, throw an error
    if (!foundCategory) {
      throw new NotFoundError("Category not found.");
    }

    // Return the found category as the response
    ResponseHandler.success(
      res,
      foundCategory,
      200,
      "Category with it's events found."
    );
  } catch (error) {
    next(error);
  }
};

export { getAllCategoriesController, getEventsByCategoryController };
