import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected to send message to.");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      console.warn(
        "subscribeToMessages: No selected user, skipping subscription."
      );
      return;
    }

    const { socket } = useAuthStore.getState();
    if (!socket) {
      console.error("Socket is not initialized in useAuthStore.");
      toast.error("Chat connection error. Please refresh.");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const isMessageForSelectedChat =
        (newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === useAuthStore.getState().authUser?._id) ||
        (newMessage.receiverId === selectedUser._id &&
          newMessage.senderId === useAuthStore.getState().authUser?._id);

      const isDuplicate = get().messages.some(
        (msg) => msg._id === newMessage._id
      );

      if (isMessageForSelectedChat && !isDuplicate) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
