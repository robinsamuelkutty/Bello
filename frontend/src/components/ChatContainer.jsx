import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { ReplyPreview } from "../lib/ReplyPreview";
import { MessageActions } from "../lib/MessageActions";
import { useThemeStore } from "../store/useThemeStore";
import { ChevronDown,Play, Pause,Mic  } from "lucide-react";
import WaveSurfer from 'wavesurfer.js';

const AudioMessage = ({ message, isSender, senderName, onActionClick, showDropdown, onAction }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const containerRef = useRef(null);

  // Convert base64 to Blob and create an object URL
  const getAudioUrl = (base64String) => {
    if (!base64String) return null;

    // Remove the data URL prefix if present
    const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, '');
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error converting base64 to blob:", e);
      return null;
    }
  };

  // Initialize WaveSurfer
  useEffect(() => {
    // Make sure WaveSurfer is available
    if (typeof WaveSurfer === 'undefined') {
      console.error("WaveSurfer not loaded. Add it to your index.html or install via npm");
      return;
    }

    const audioUrl = getAudioUrl(message.audio);
    if (!audioUrl || !waveformRef.current) return;

    // Get the container width for responsive waveform
    const containerWidth = containerRef.current?.clientWidth || 200;
    
    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 255, 255, 0.3)',
      progressColor: 'rgba(255, 255, 255, 0.8)',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 32,
      normalize: true,
      responsive: true,
      width: containerWidth - 80 // Adjust width based on container minus buttons/icons
    });

    // Load audio
    wavesurfer.load(audioUrl);
    wavesurferRef.current = wavesurfer;

    // Set up event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsLoaded(true);
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    // Cleanup on unmount
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (wavesurfer) wavesurfer.destroy();
    };
  }, [message.audio]);

  // Handle window resize for responsive waveform
  useEffect(() => {
    const handleResize = () => {
      if (wavesurferRef.current && containerRef.current) {
        wavesurferRef.current.setWidth(containerRef.current.clientWidth - 80);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePlayPause = () => {
    if (!wavesurferRef.current || !isLoaded) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={`relative group max-w-xs ${isSender ? 'ml-auto' : 'mr-auto'}`}>
      <ReplyPreview message={message} isSender={isSender} senderName={senderName} />
      
      <div 
        ref={containerRef}
        className={`flex items-center p-3 rounded-lg ${
          isSender ? 'bg-primary text-white' : 'bg-neutral text-white'
        }`}
      >
        {/* Play/Pause Button */}
        <button 
          onClick={togglePlayPause}
          disabled={!isLoaded}
          className={`flex-shrink-0 bg-white rounded-full p-2 mr-3 ${!isLoaded && 'opacity-50'}`}
        >
          {isPlaying ? (
            <Pause className="size-4 text-primary" />
          ) : (
            <Play className="size-4 text-primary" />
          )}
        </button>
        
        {/* Waveform */}
        <div className="flex-1 mr-2">
          <div ref={waveformRef} className="w-full"></div>
        </div>
        
        {/* Duration */}
        <div className="text-xs whitespace-nowrap min-w-10 text-right">
          {formatTime(isPlaying ? currentTime : (duration || 0))}
        </div>
        
        {/* Mic Icon (optional) */}
        <Mic className="size-3 ml-2 opacity-50 flex-shrink-0" />
        
        {/* Actions Button */}
        <button
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={onActionClick}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
      
      {/* Dropdown Menu */}
      {showDropdown && (
        <div className={`absolute ${isSender ? 'right-full mr-2' : 'left-full ml-2'} top-0 z-10`}>
          <MessageActions
            message={message}
            onAction={onAction}
            isSender={isSender}
          />
        </div>
      )}

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

// TextMessage Component (unchanged)
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

// ChatContainer Component
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
              {message.audio ? (
                <AudioMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                  showDropdown={activeDropdown === message._id}
                  onAction={handleMessageAction}
                />
              ) : message.image ? (
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