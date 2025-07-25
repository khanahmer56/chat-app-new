import { Request, Response, NextFunction, RequestHandler } from "express";
const TryCatch =
  (handler: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Something went wrong" });
      next(error);
    }
  };
export default TryCatch;
