import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { ReplyPreview } from "../lib/ReplyPreview";
import { MessageActions } from "../lib/MessageActions";
import ForwardMessageModal from "./ForwardMessageModel";
import { ChevronDown, Play, Pause, Mic } from "lucide-react";
import WaveSurfer from 'wavesurfer.js';
import { franc } from 'franc';

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
  
    // Remove the prefix if present
    const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, '');
  
    try {
      // Decode base64 string
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
  
      let decompressedData;
      try {
        // Attempt to decompress with pako (for gzip)
        decompressedData = pako.ungzip(byteArray);
      } catch (decompressionError) {
        console.warn("Data might not be compressed, using raw byte array.");
        decompressedData = byteArray;
      }
  
      console.log("Base64 Length:", base64String.length);
      console.log("Base64 Preview:", base64String.slice(0, 100));
  
      // Create a blob with the (decompressed or original) data
      const blob = new Blob([decompressedData], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error converting base64 to decompressed blob:", e); // Line 44
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
          <p>{message.displayText || message.text}</p>
          {message.isTranslated && (
            <div className="text-xs mt-1 opacity-70">
              Translated from {message.originalLanguage || 'original language'}
            </div>
          )}
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
          <p>{message.displayText || message.text}</p>
          {message.isTranslated && (
            <div className="text-xs mt-1 opacity-70">
              Translated from {message.originalLanguage || 'original language'}
            </div>
          )}
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
  // Function to detect URLs in text and convert them to JSX elements
  const renderTextWithLinks = (text) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // If no URLs found, return the text as is
    if (!urlRegex.test(text)) {
      return text;
    }
    
    // Split the text by URLs and create an array of text and link elements
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex) || [];
    
    return parts.map((part, index) => {
      // If this part is a URL (it matches with a URL from matches array)
      if (matches.includes(part)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline hover:text-blue-100 break-all"
            onClick={(e) => e.stopPropagation()} // Prevent dropdown from opening when clicking the link
          >
            {part}
          </a>
        );
      }
      // Return regular text
      return part;
    });
  };

  return (
    <div className={`relative group max-w-xs ${isSender ? 'ml-auto' : 'mr-auto'}`}>
      <ReplyPreview message={message} isSender={isSender} senderName={senderName} />
      <div className={`chat-bubble relative flex items-center ${
        isSender ? 'bg-primary text-white' : 'bg-neutral text-white'
      } p-3 rounded-lg max-w-[100%]`}>

        <div className="flex flex-col w-full">
          <p>{renderTextWithLinks(message.displayText || message.text)}</p>
          {message.isTranslated && (
            <div className="text-xs mt-1 opacity-70">
              Translated from {message.originalLanguage || 'original language'}
            </div>
          )}
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
      <div className="text-xs opacity-50 mt-1">
        {formatMessageTime(message.createdAt)}
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
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [displayMessages, setDisplayMessages] = useState([]);

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

  useEffect(() => {
    if (messages) {
      setDisplayMessages(messages.map(msg => ({ ...msg })));
    }
  }, [messages]);

  const translateMessage = async (messageId, targetLanguage) => {
    try {
      // Find the message in display messages
      const messageIndex = displayMessages.findIndex(m => m._id === messageId);
      if (messageIndex === -1) return;
  
      const message = displayMessages[messageIndex];
      console.log("Target Language link",targetLanguage)
      
  
      // Detect the source language using franc
      const detectedLanguage = franc(message.text);
  
      // Map 3-letter ISO codes to 2-letter ISO codes
      const languageMap = {
        arb: 'ar', // Arabic
        eng: 'en', // English
        spa: 'es', // Spanish
        fra: 'fr', // French
        deu: 'de', // German
        ita: 'it', // Italian
        por: 'pt', // Portuguese
        rus: 'ru', // Russian
        zho: 'zh', // Chinese
        jpn: 'ja', // Japanese
        kor: 'ko', // Korean
        hin: 'hi', // Hindi
        // Add more mappings as needed
      };
  
      // Convert the detected language to a 2-letter ISO code
      const sourceLanguage = languageMap[detectedLanguage] || 'en'; // Fallback to 'en' if the language is not mapped
  
      console.log("Translating message:", message, "from", sourceLanguage, "to", targetLanguage);
  
      // Check if the source and target languages are the same
      if (sourceLanguage === targetLanguage) {
        alert("Source and target languages are the same. Please select a different target language.");
        return;
      }
  
      // Call the MyMemory Translation API
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(message.text)}&langpair=${sourceLanguage}|${targetLanguage}`
      );
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
  
      // Check if the translation is available
      if (!data.responseData || !data.responseData.translatedText) {
        throw new Error("Invalid API response");
      }
  
      // Update the message in our display messages array
      const updatedMessages = [...displayMessages];
      updatedMessages[messageIndex] = {
        ...message,
        displayText: data.responseData.translatedText,
        originalText: message.originalText || message.text,
        originalLanguage: sourceLanguage,
        isTranslated: true,
        translatedLanguage: targetLanguage
      };
  
      setDisplayMessages(updatedMessages);
  
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed. Please try again later.");
    }
  };

  const handleReadAloud = (messageContent) => {
    if (!messageContent) {
      console.error("No message content to read aloud.");
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.error("Text-to-speech is not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(messageContent);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  const handleMessageAction = (action, message) => {
    switch (action) {
      case 'reply':
        setReplyingMessage(message);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.displayText || message.text);
        break;
      case 'forward':
        setForwardingMessage(message);
        break;
      case 'edit':
        setEditingMessage(message);
        break;
      case 'delete':
        setDeletingMessage(message);
        break;
      case 'translate':
        translateMessage(message._id, message.targetLanguage);
        console.log("Translate message in handle message action",message)
        break;
      case 'readAloud':
        handleReadAloud(message.displayText || message.text || message.content);
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
        {displayMessages.map((message, index) => {
          const isSender = message.senderId === authUser._id;
          const isLastMessage = index === displayMessages.length - 1;

          return (
            <div
              key={message._id}
              className={`chat group relative ${
                isSender ? "chat-end" : "chat-start"
              }`}
              ref={isLastMessage ? messageEndRef : null}
            >
              {message.audio ? (
                <AudioMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                  showDropdown={activeDropdown === message._id}
                  onAction={(action) => handleMessageAction(action, message)}
                />
              ) : message.image ? (
                <ImageMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                  showDropdown={activeDropdown === message._id}
                  onAction={(action,msg) => handleMessageAction(action, msg)}
                />
              ) : (
                <TextMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                  showDropdown={activeDropdown === message._id}
                  onAction={(action,msg) => handleMessageAction(action, msg)}
                />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
      
      {forwardingMessage && (
        <ForwardMessageModal 
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
        />
      )}
    </div>
  );
};

export default ChatContainer;