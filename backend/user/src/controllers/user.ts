import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  const rateLimitKey = `otp:ratelimit:${email}`;

  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    res
      .status(429)
      .json({ message: "Too many requests. Please try again later" });
  } else {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, { EX: 300 });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    const message = {
      to: email,
      subject: "OTP for login",
      body: `Your OTP for login is: ${otp}`,
    };
    await publishToQueue("send-otp", message as any);
    res.status(200).json({ message: "OTP sent to your emai" });
  }
});
export const verifyOtp = TryCatch(async (req, res) => {
  const { email, otp } = req.body;
  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (storedOtp === otp) {
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
      const name = email.split("@")[0];
      user = new User({ name, email });
      await user.save();
    }
    const token = generateToken(user);
    res.json({ message: "OTP verified successfully", user, token });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});
export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  res.json(req.user);
});

export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.name = req.body.name;
  await user.save();
  const token = generateToken(user);
  res.json({ message: "Name updated successfully", user, token });
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find();
  res.json(users);
});

export const getUserById = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});
