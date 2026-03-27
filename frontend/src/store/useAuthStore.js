import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:10000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  onlineUsers: [],
  typingUser: null,
  lastSeen: {},
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({
        authUser: null,
        error: error.response?.data?.message || "Auth check failed",
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    set({ authUser: null });
    get().disconnectSocket();
  },
  updateProfile: async (data) => {
    try {
      set({ isUpdatingProfile: true });

      const res = await axiosInstance.put("/auth/update-profile", data);

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
      transports: ["websocket"],
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    // 🟢 online users
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // ⌨️ typing
    newSocket.on("typing", ({ senderId }) => {
      set({ typingUser: senderId });
    });

    newSocket.on("stopTyping", () => {
      set({ typingUser: null });
    });

    // 🕒 last seen
    newSocket.on("userLastSeen", ({ userId, lastSeen }) => {
      set((state) => ({
        lastSeen: { ...state.lastSeen, [userId]: lastSeen },
      }));
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
