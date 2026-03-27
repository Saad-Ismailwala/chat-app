import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteMessage,
  editMessage,
  markMessagesAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();

// 1. Specific string routes MUST come first
router.get("/users", protectRoute, getUsersForSidebar);
router.put("/read/:id", protectRoute, markMessagesAsRead);

// 2. Dynamic ID routes come after
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.put("/:id", protectRoute, editMessage);

export default router;
