import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

// Sidebar users
router.get("/users", protectRoute, getUsersForSidebar);

// Messages with a specific user
router.get("/:id", protectRoute, getMessages);

// Send message to a user
router.post("/:id", protectRoute, sendMessage);

export default router;
