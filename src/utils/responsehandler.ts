import { Response } from "express";

class ResponseHandler {
  static success(res: Response, data: any, statusCode = 200, message?: string) {
    const responseObject: Record<string, any> = {
      timestamp: new Date().toISOString(),
      status: statusCode,
      data: data,
      success: true,
    };

    if (message) {
      responseObject.message = message;
    }

    res.status(statusCode).json(responseObject);
  }
}

export { ResponseHandler };
