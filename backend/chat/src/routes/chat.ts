import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  createNewChat,
  getAllChats,
  getMessagesbyChat,
  sendMessage,
} from "../controller/chat.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();
router.post("/create-chat", isAuth, createNewChat);
router.get("/get-all-chats", isAuth, getAllChats);
router.post("/message", isAuth, upload.single("image"), sendMessage);
router.get("/message/:chatId", isAuth, getMessagesbyChat);

export default router;
