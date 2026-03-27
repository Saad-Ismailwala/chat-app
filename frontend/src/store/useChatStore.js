import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  unreadCounts: {},

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
      set({
        messages: [],
        error: error.response?.data?.message || "Failed to fetch messages",
      });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Failed to send message", error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? res.data : m,
        ),
      }));
    } catch (error) {
      toast.error("Could not delete message", error);
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text });
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? res.data : m,
        ),
      }));
    } catch (error) {
      toast.error("Could not edit message", error);
    }
  },

  markMessagesAsRead: async (senderId) => {
    try {
      await axiosInstance.put(`/messages/read/${senderId}`);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.senderId === senderId ? { ...m, isRead: true } : m,
        ),
      }));
    } catch (error) {
      console.log("Read receipt error", error);
    }
  },

  clearUnread: (userId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
    })),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageEdited");
    socket.off("messagesRead");

    socket.on("newMessage", (newMessage) => {
      const currentSelected = get().selectedUser;
      const { authUser } = useAuthStore.getState();

      // if message is from me -> ignore
      if (newMessage.senderId === authUser._id) return;

      // if chat open -> push message
      if (currentSelected && newMessage.senderId === currentSelected._id) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        get().markMessagesAsRead(currentSelected._id);
      } else {
        // 🔴 increase unread counter
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [newMessage.senderId]:
              (state.unreadCounts[newMessage.senderId] || 0) + 1,
          },
        }));
      }
    });

    socket.on("messageDeleted", (deletedMsg) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === deletedMsg._id ? deletedMsg : m,
        ),
      }));
    });

    socket.on("messageEdited", (editedMsg) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === editedMsg._id ? editedMsg : m,
        ),
      }));
    });

    socket.on("messagesRead", ({ readerId }) => {
      if (readerId === selectedUser?._id) {
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, isRead: true })),
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
      socket.off("messageEdited");
      socket.off("messagesRead");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) get().clearUnread(selectedUser._id);
  },
}));
