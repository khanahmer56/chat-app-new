import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../model/User.js";
import jwt, { JwtPayload } from "jsonwebtoken";
export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    if (!decoded || !decoded.user) {
      res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
