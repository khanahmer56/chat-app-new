import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createNewChat } from "../controller/chat.js";

const router = express.Router();
router.post("/create-chat", isAuth, createNewChat);

export default router;
