import React from "react";
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import DOMPurify from "dompurify";

/**
 * TEXT FORMATTING
 * Converts:
 *   *text*      -> <strong>text</strong>
 *   _text_      -> <em>text</em>
 *   __text__    -> <u>text</u>
 *   ~~text~~    -> <del>text</del>
 */
function parseFormatting(text) {
  if (!text) return "";
  // Bold: *text*
  text = text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  // Italic: _text_
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
  // Underline: __text__
  text = text.replace(/__([^_]+)__/g, "<u>$1</u>");
  // Strikethrough: ~~text~~
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return text;
}

/**
 * Optional React component for rendering a single chat message.
 * Uses dangerouslySetInnerHTML to interpret HTML tags (e.g., <strong>).
 */
export function ChatMessage({ message }) {
  // Sanitize the HTML to avoid XSS
  const safeHTML = DOMPurify.sanitize(message.text || "");
  return (
    <div
      className="message"
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />
  );
}
export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isGeminiTyping: false, // NEW

  // Fetch the list of users
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

  // Fetch messages for a selected user
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

  // Send a message to the selected user
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    // Parse text formatting before sending/storing
    messageData.text = parseFormatting(messageData.text);

    try {
      if (selectedUser && selectedUser._id === "gemini") {
        // Immediately add the user's message so it appears in the chat
        const userMessage = {
          _id: "user-" + Date.now().toString(),
          senderId: authUser._id,
          text: messageData.text,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...messages, userMessage] });
        // Indicate "Gemini" is typing
        set({ isGeminiTyping: true });
        // Call the Gemini API (backend endpoint)
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        // Turn off the "typing" indicator
        set({ isGeminiTyping: false });
        // Append the AI reply
        set({ messages: [...get().messages, res.data.reply] });
      } else {
        // Normal user chat
        const res = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
        set({ messages: [...messages, res.data] });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send/update message");
      set({ isGeminiTyping: false });
    }
  },

  // Subscribe to new incoming messages via socket
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

  // Edit an existing message
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

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      const updatedMessages = get().messages.filter((message) => message._id !== messageId);
      set({ messages: updatedMessages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // Unsubscribe from the socket listener
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Set the currently selected user for chat
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
