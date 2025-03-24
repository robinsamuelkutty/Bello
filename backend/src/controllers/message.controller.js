import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { sendGeminiMessage } from "../lib/gemini.js";
import { GEMINI_USER_ID } from "../config.js"; // e.g., new ObjectId("64e7...")
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // Fetch all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Filter out any user that has the same ID as the AI user (GEMINI_USER_ID)
    const filteredUsers = users.filter(
      (user) => user._id.toString() !== GEMINI_USER_ID.toString()
    );

    // Ensure the AI user exists in the database
    let geminiUser = await User.findById(GEMINI_USER_ID);
    if (!geminiUser) {
      geminiUser = new User({
        _id: GEMINI_USER_ID,
        email: "gemini@chatapp.com",
        fullName: "Bello AI", // or Gemini AI; use your chosen name
        profilePic: "/Screenshot_20250322-220004~3.png",
        password: "12345678", // dummy password
        isAI: true, // flag to identify AI on the frontend
      });
      await geminiUser.save();
    }

    // Return the AI user first, then the rest of the users (with duplicates removed)
    return res.status(200).json([geminiUser, ...filteredUsers]);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // If the chat is with Gemini, treat it the same as any user
    // Just fetch messages between the user and GEMINI_USER_ID
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).populate("replyTo");

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------------------------
//  Send message (supports text, image, and audio)
// ----------------------------------------------------------------------------
export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if sending to Gemini
    const isGemini = receiverId === GEMINI_USER_ID.toString();

    if (isGemini) {
      // 1) Save the user's message first
      let userImageUrl = null;
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        userImageUrl = uploadResponse.secure_url;
      }

      const userMessage = new Message({
        senderId,
        receiverId: GEMINI_USER_ID,
        text,
        image: userImageUrl,
        audio, // store audio as Base64 or raw string
        replyTo: replyTo || null,
      });
      await userMessage.save();

      // Optional: emit the user message to Gemini socket (if needed)
      const geminiSocketId = getReceiverSocketId(GEMINI_USER_ID.toString());
      if (geminiSocketId) {
        io.to(geminiSocketId).emit("newMessage", userMessage);
      }

      // 2) Call Gemini API for a response
      const geminiReplyText = await sendGeminiMessage(text);

      // 3) Save Gemini's reply
      const geminiReply = new Message({
        senderId: GEMINI_USER_ID,
        receiverId: senderId,
        text: geminiReplyText,
      });
      await geminiReply.save();

      // 4) Emit Gemini's reply to the user
      setTimeout(() => {
        const userSocketId = getReceiverSocketId(senderId);
        if (userSocketId) {
          io.to(userSocketId).emit("newMessage", geminiReply);
        }
      }, 100);

      // Return the user’s message so it appears immediately on the client
      return res.status(201).json(userMessage);
    }

    // Normal user-to-user flow
    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio,
      replyTo: replyTo || null,
    });
    await newMessage.save();

    // Notify receiver via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------------------------
//  Edit message (supports text, image, and audio updates)
// ----------------------------------------------------------------------------
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, image, audio } = req.body;

    let imageUrl = null;
    let audioUrl = audio;

    // Upload new image if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // If you want to handle audio uploading to Cloudinary:
    // if (audio && !audio.startsWith("data:")) {
    //   const uploadResponse = await cloudinary.uploader.upload(audio, { resource_type: "video" });
    //   audioUrl = uploadResponse.secure_url;
    // }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text, image: imageUrl, audio: audioUrl },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Notify receiver
    const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
    }

    return res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error in editMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------------------------
//  Delete message
// ----------------------------------------------------------------------------
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Notify receiver
    const receiverSocketId = getReceiverSocketId(deletedMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------------------------
//  Summarize message (uses Gemini, if desired)
// ----------------------------------------------------------------------------
export const summarizeMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided for summarization" });
    }

    // You can define a separate function in ../lib/gemini.js for summarizing
    // or reuse sendGeminiMessage with a prompt like "Summarize: <text>"
    const summary = await sendGeminiMessage(`Summarize: ${text}`);
    return res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in summarizeMessage:", error.message);
    return res.status(500).json({ error: "Failed to summarize text" });
  }
};
