import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { useAuthStore } from "../store/useAuthStore";

const MessageInput = ({
  replyingMessage, 
  setReplyingMessage, 
  editingMessage,
  setEditingMessage,
  onEditComplete,
}) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, editMessage,selectedUser } = useChatStore();
  const {authUser}= useAuthStore()
 

  // Pre-fill the input fields when editing a message
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      setImagePreview(editingMessage.image || null);
    } else {
      setText("");
      setImagePreview(null);
    }
  }, [editingMessage]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const compressedFile = await imageCompression(file, options);
      if (compressedFile.size > 100 * 1024) {
        toast.error("Image could not be compressed to less than 100 KB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to compress image");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    console.log("replyingmessage",selectedUser)
    try {
      const newMessage = {
        text: text.trim(),
        image: imagePreview,
        replyTo: replyingMessage
          ? {
              _id: replyingMessage._id,
              text: replyingMessage.text,
              image:replyingMessage ? replyingMessage._id : null,
            }
          : null,
      };

      if (editingMessage) {
        await editMessage(editingMessage._id, newMessage);
        onEditComplete();
      } else {
        await sendMessage(newMessage);
      }

      // Clear inputs
      setText("");
      setImagePreview(null);
      setReplyingMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send/update message:", error);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null); // Clear the editing state
    setText("");
    setImagePreview(null);
  };

  return (
    <div className="p-4 w-full">
      {/* Edit Message Section */}
      {editingMessage && (
        <div className="mb-4 p-2 bg-base-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Edit Message</span>
            <button onClick={cancelEdit} className="btn btn-ghost btn-sm">
              <X className="size-4" />
            </button>
          </div>
          <p className="text-xs opacity-70 mt-1">
            {editingMessage.text || "Image message"}
          </p>
        </div>
      )}
      {replyingMessage && (
        <div className="mb-4 p-2 bg-base-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Replying to{" "}
              {replyingMessage.senderId === authUser._id ? "You" : selectedUser.fullName}
            </span>
            <button
              onClick={() => setReplyingMessage(null)}
              className="btn btn-ghost btn-sm"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="text-xs opacity-70 mt-1">
            {replyingMessage.text || "Image message"}
          </p>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-md sm:input-md"
            placeholder={
              editingMessage ? "Edit your message..." : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-black-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-md btn-square bg-primary text-white"
          disabled={!text.trim() && !imagePreview}
        >
          {editingMessage ? <Check size={22} /> : <Send size={22} />}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
