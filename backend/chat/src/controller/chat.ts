import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import Chat from "../models/chat.js";
import Messages from "../models/Messages.js";

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
          `${process.env.USER_SERVICE}/user/${othersUserId}`
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
      }
    })
  );
  res.status(200).json(chats);
});
