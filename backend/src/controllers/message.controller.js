import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { sendGeminiMessage } from "../lib/gemini.js";
import { GEMINI_USER_ID } from "../config.js"; // e.g., new ObjectId("64e7...")
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    
    const filteredUsers = users.filter(
      (user) => user._id.toString() !== GEMINI_USER_ID.toString()
    );


    let geminiUser = await User.findById(GEMINI_USER_ID);
    if (!geminiUser) {
      geminiUser = new User({
        _id: GEMINI_USER_ID,
        email: "gemini@chatapp.com",
        fullName: "Bello AI", 
        profilePic: "/Screenshot_20250322-220004~3.png",
        password: "12345678", 
        isAI: true, 
      });
      await geminiUser.save();
    }

   
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


export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    
    const isGemini = receiverId === GEMINI_USER_ID.toString();

    if (isGemini) {
    
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
        audio, 
        replyTo: replyTo || null,
      });
      await userMessage.save();

      
      const geminiSocketId = getReceiverSocketId(GEMINI_USER_ID.toString());
      if (geminiSocketId) {
        io.to(geminiSocketId).emit("newMessage", userMessage);
      }

      
      const geminiReplyText = await sendGeminiMessage(text);

      
      const geminiReply = new Message({
        senderId: GEMINI_USER_ID,
        receiverId: senderId,
        text: geminiReplyText,
      });
      await geminiReply.save();

      
      setTimeout(() => {
        const userSocketId = getReceiverSocketId(senderId);
        if (userSocketId) {
          io.to(userSocketId).emit("newMessage", geminiReply);
        }
      }, 100);

      
      return res.status(201).json(userMessage);
    }

    
    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio,
      replyTo: replyTo || null,
    });
    await newMessage.save();

    
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


export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, image, audio } = req.body;

    let imageUrl = null;
    let audioUrl = audio;

    
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


export const summarizeMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided for summarization" });
    }


    const summary = await sendGeminiMessage(`Summarize: ${text}`);
    return res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in summarizeMessage:", error.message);
    return res.status(500).json({ error: "Failed to summarize text" });
  }
};
