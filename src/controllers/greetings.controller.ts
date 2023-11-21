import { Request, RequestHandler, Response, NextFunction } from "express";
import { NotFoundError, BadRequestError } from "../middlewares";
import { ResponseHandler } from "../utils";

export const sayHelloController: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = "Hello World 🌍";
    if (!data) {
      // throw the error to the error handler, check src/middlewares/errorhandler.ts to see the definitions of the errors
      throw new NotFoundError("Data not found");
    }
    // you can pass in a message as the fourth argument, if you want to override the default status code pass in a number as the third argument
    // ResponseHandler.success(the response object, the data, the status code, the message)
    ResponseHandler.success(res, data, 200, "Hello Nigeria 🌍");
  } catch (err) {
    // tell express to pass the error to the error handler
    next(err);
  }
};
