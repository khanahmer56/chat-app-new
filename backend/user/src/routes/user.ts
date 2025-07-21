import express from "express";
import {
  getAllUsers,
  loginUser,
  myProfile,
  updateName,
  verifyOtp,
} from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.put("/update-name", isAuth, updateName);
router.get("/me", isAuth, myProfile);
router.get("/all", getAllUsers);

export default router;
