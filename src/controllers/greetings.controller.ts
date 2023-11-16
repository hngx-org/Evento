import { Request, RequestHandler, Response, NextFunction } from "express";
import { NotFoundError, BadRequestError } from "../middlewares";

export const sayHelloController: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = "Hello World";
    if (!data) {
      throw new NotFoundError("Data not found");
    }
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};
