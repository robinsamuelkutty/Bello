// File: frontend/src/store/useChatStore.js
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
  isGeminiTyping: false, // NEW

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
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
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    try {
      if (selectedUser._id === "gemini") {
        // Immediately add the user's message so it appears in the chat
        const userMessage = {
          _id: "user-" + Date.now().toString(),
          senderId: authUser._id,
          text: messageData.text,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...messages, userMessage] });
        
        // Set the flag to true immediately before making the API call
        console.log("Setting isGeminiTyping to true");
        set({ isGeminiTyping: true });
        
        // Call the Gemini API (backend endpoint)
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        
        // Once the response is received, set the flag to false
        console.log("Setting isGeminiTyping to false");
        set({ isGeminiTyping: false });
        
        // Append the AI reply
        set({ messages: [...get().messages, res.data.reply] });
      } else {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        set({ messages: [...messages, res.data] });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send/update message");
      // Ensure flag resets even if there's an error
      set({ isGeminiTyping: false });
    }
  },  

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  editMessage: async (messageId, { text, image, audio }) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { 
        text: text || "",
        image: image || null,
        audio: audio || null,
      });
      const updatedMessages = get().messages.map((message) =>
        message._id === messageId ? res.data : message
      );
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      const updatedMessages = get().messages.filter((message) => message._id !== messageId);
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
