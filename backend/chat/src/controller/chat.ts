import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import Chat from "../models/chat.js";
import Messages from "../models/Messages.js";
import chat from "../models/chat.js";

export const createNewChat = TryCatch(async (req: any, res) => {
  const userId = req.user?._id;
  const { otherUserId } = req.body;
  const existingChat = await Chat.findOne({
    users: { $all: [userId, otherUserId] },
  });
  if (existingChat) {
    return res.status(200).json({
      message: "Chat already exists",
      chatId: existingChat._id,
    });
  }
  const newChat = new Chat({ users: [userId, otherUserId] });
  const savedChat = await newChat.save();
  res.status(200).json(savedChat);
});

export const getAllChats = TryCatch(async (req: any, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const chats = await Chat.find({ users: { $in: [userId] } }).sort({
    updatedAt: -1,
  });
  const chatWithUsers = await Promise.all(
    chats.map(async (chat) => {
      const othersUserId = chat.users.filter((user) => user !== userId);
      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $in: userId },
        seenBy: false,
      });
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/user/${othersUserId}`
        );
        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage,
            unseenCount,
          },
        };
      } catch (error) {
        console.log(error);
        return {
          user: { _id: othersUserId, name: "Unknown" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage,
            unseenCount,
          },
        };
      }
    })
  );
  res.status(200).json({
    chats: chatWithUsers,
  });
});
export const sendMessage = TryCatch(async (req: any, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imageFile = req.file;
  if (!senderId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!chatId || !text)
    return res.status(400).json({ message: "Missing required fields" });

  const chats = await chat.findById(chatId);
  if (!chats) {
    return res.status(404).json({ message: "Chat not found" });
  }
  const isUserInChat = chats.users.some(
    (user) => user.toString() === senderId.toString()
  );
  if (!isUserInChat) {
    return res.status(401).json({ message: "You are not in this chat" });
  }
  const othersUserId = chats.users.find((user) => user != senderId);
  if (!othersUserId) {
    res.status(401).json({ message: "No other User" });
  }
  //socket setup
  let messagedata: any = {
    chatId: chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };
  if (imageFile) {
    messagedata.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };
    messagedata.messageType = "image";
    messagedata.text = text || "";
  } else {
    messagedata.text = text;
    messagedata.messageType = "text";
  }
  const message = new Messages(messagedata);
  const savedMessage = await message.save();
  const latestMessageText = imageFile ? "image" : text;
  await chat.findById(
    chatId,
    {
      latestMessage: {
        text: latestMessageText,
        sender: senderId,
      },
      //   updatedAt: new Date(),
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    message: savedMessage,
    sender: senderId,
  });
});

export const getMessagesbyChat = TryCatch(async (req: any, res) => {
  const userId = req.user?._id;
  const { chatId } = req.params;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!chatId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const chats = await chat.findById(chatId);
  if (!chats) {
    return res.status(404).json({ message: "Chat not found" });
  }
  const isUserInChat = chats.users.some(
    (user: any) => user.toString() === userId.toString()
  );
  if (!isUserInChat) {
    return res.status(401).json({ message: "You are not in this chat" });
  }
  const messagesToMarkSeen = await Messages.find({
    chatId,
    seenBy: false,
    sender: { $in: userId },
  });
  await Messages.updateMany(
    { chatId, seenBy: false, sender: { $in: userId } },
    { seenBy: true, seenAt: new Date() }
  );

  const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });
  res.status(200).json({
    messages,
  });

  const othersUserId = chats.users.find((user: any) => user != userId);
  if (!othersUserId) {
    res.status(400).json({ message: "No other User" });
    return;
  }
  try {
    const { data } = await axios.get(
      `http://localhost:5000/api/v1/user/${othersUserId}`
    );
    res.json({
      messages,
      user: data,
    });
  } catch (error) {
    res.status(400).json({ message: "User not found" });
    console.log(error);
  }
});
