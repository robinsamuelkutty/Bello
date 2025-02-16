import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { ReplyPreview } from "../lib/ReplyPreview";
import { MessageActions } from "../lib/MessageActions"
import { useThemeStore } from "../store/useThemeStore";
import { ChevronDown } from "lucide-react";




const ImageMessage = ({ message, isSender, senderName, onActionClick, showDropdown, onAction }) => {
  return (
    <div className={`relative group max-w-xs ${isSender ? 'ml-auto' : 'mr-auto'}`}>
       <ReplyPreview message={message} isSender={isSender} senderName={senderName} />
      <div className="relative">
        <img
          src={message.image}
          alt="Attachment"
          className="rounded-lg object-cover h-64 w-full"
        />
        
        {/* Actions Button */}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                     bg-black/50 p-1 rounded-full"
          onClick={onActionClick}
        >
          <ChevronDown className="size-4 text-white" />
        </button>
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className={`absolute ${isSender ? 'right-full mr-2' : 'left-full ml-2'} top-0`}>
            <MessageActions 
              message={message} 
              onAction={onAction}
              isSender={isSender}
            />
          </div>
        )}
      </div>
      
      {/* Message Text (if any) */}
      {message.text && (
        <div className={`mt-1 px-3 py-2 rounded-lg ${
          isSender ? 'bg-primary text-white' : 'bg-neutral text-white'
        }`}>
          <p>{message.text}</p>
        </div>
      )}
      
      {/* Timestamp */}
      <div className="text-xs opacity-50 mt-1">
        {formatMessageTime(message.createdAt)}
      </div>
    </div>
  );
};

const TextMessage = ({ message, isSender, senderName, onActionClick, showDropdown, onAction }) => {
  return (
    <div className={`relative group max-w-xs ${isSender ? 'ml-auto' : 'mr-auto'}`}>
       <ReplyPreview message={message} isSender={isSender} senderName={senderName} />
       <div className={`chat-bubble relative flex items-center ${
        isSender ? 'bg-primary text-white' : 'bg-neutral text-white'
      } p-3 rounded-lg max-w-[100%]`}>

      <div className="flex flex-col w-full">
        <p>{message.text}</p>
      </div>

      <button
        className={`${isSender ? 'mr-2' : 'ml-2'} opacity-0 group-hover:opacity-100 transition-opacity`}
        onClick={onActionClick}
      >
        <ChevronDown className="size-4" />
      </button>

      {showDropdown && (
        <div className={`absolute ${isSender ? 'right-full mr-2' : 'left-full ml-2'} top-0`}>
          <MessageActions 
            message={message} 
            onAction={onAction}
            isSender={isSender}
          />

        </div>
      )}
    </div>
    </div>
  );
};

// ChatContainer.jsx

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const { theme } = useThemeStore();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null);


  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMessageAction = (action, message) => {
    switch (action) {
      case 'reply':
        setReplyingMessage(message);
        console.log("user",message)
        break;
      case 'copy':
        navigator.clipboard.writeText(message.text);
        break;
      case 'forward':
        console.log('Forward message:', message);
        break;
      case 'edit':
        setEditingMessage(message);
        break;
      case 'delete':
        setDeletingMessage(message);
        break;
      default:
        break;
    }
    setActiveDropdown(null);
  };

  const handleDeleteMessage = async () => {
    if (deletingMessage) {
      await deleteMessage(deletingMessage._id);
      setDeletingMessage(null);
    }
  };

  const handleEditComplete = () => {
    setEditingMessage(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput 
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          onEditComplete={handleEditComplete}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto" data-theme={theme}>
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isSender = message.senderId === authUser._id;
          
          return (
            <div
              key={message._id}
              className={`chat group relative ${
                isSender ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              {message.image ? (
                <ImageMessage 
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                  showDropdown={activeDropdown === message._id}
                  onAction={handleMessageAction}
                />
              ) : (
                <>
                  <TextMessage 
                    message={message}
                    isSender={isSender}
                    senderName={selectedUser.fullName}
                    onActionClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                    showDropdown={activeDropdown === message._id}
                    onAction={handleMessageAction}
                  />
                  <div className="chat-footer text-xs opacity-50 mt-1">
                    {formatMessageTime(message.createdAt)}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <MessageInput 
      replyingMessage={replyingMessage} 
      setReplyingMessage={setReplyingMessage} 
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
        onEditComplete={handleEditComplete}
      />

      {deletingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-base-200 p-6 rounded-lg">
            <p>Delete Message?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeletingMessage(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleDeleteMessage} className="btn btn-error">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;