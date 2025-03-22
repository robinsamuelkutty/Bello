import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get users for sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).populate("replyTo");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Send message (Supports text, image, and audio)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, replyTo } = req.body; // `audio` is a Base64 string
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    // Upload image if provided (only images go to Cloudinary)
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    console.log("audio",audio)
    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Store image URL (if uploaded)
      audio, // Store Base64 string directly
      replyTo: replyTo ? replyTo : null,
    });

    // Save the message to the database
    await newMessage.save();

    // Notify the receiver in real-time (if online)
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Send the saved message back to the client
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
// Edit message (Supports text, image, and audio updates)
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, image, audio } = req.body;

    let imageUrl, audioUrl;

    // Upload new image if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Upload new audio if provided
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video",
      });
      audioUrl = uploadResponse.secure_url;
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text, image: imageUrl, audio: audioUrl },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Emit update event via WebSocket
    const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Emit delete event via WebSocket
    const receiverSocketId = getReceiverSocketId(deletedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const summarizeMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided for summarization" });
    }

    // Call an external AI API to summarize (Replace with your AI service)
    const summary = await getSummary(text);

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in summarizeMessage:", error.message);
    res.status(500).json({ error: "Failed to summarize text" });
  }
};

// Function to summarize text (Using OpenAI API as an example)
const getSummary = async (text) => {
  const API_KEY = "your-api-key-here"; // Replace with your API key

  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      model: "text-davinci-003",
      prompt: `Summarize this: ${text}`,
      max_tokens: 50,
    },
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
    }
  );

  return response.data.choices[0].text.trim();
};