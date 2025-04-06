// File: frontend/src/components/ChatContainer.jsx
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
import WaveSurfer from "wavesurfer.js";
import { franc } from "franc";
import summarizeText from "../lib/summarizer";
import DOMPurify from "dompurify";

// Helper function to parse Discord-like formatting.
// Converts:
//   *text*      -> <strong>text</strong>
//   _text_      -> <em>text</em>
//   __text__    -> <u>text</u>
//   ~~text~~    -> <del>text</del>
function parseFormatting(text) {
  if (!text) return "";
  text = text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
  text = text.replace(/__([^_]+)__/g, "<u>$1</u>");
  text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return text;
}

const AudioMessage = ({ message, isSender, senderName, onActionClick, showDropdown, onAction }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());

  const getAudioUrl = (base64String) => {
    if (!base64String) return null;
    const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, '');
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error converting base64 to blob:", e);
      return null;
    }
  };

  useEffect(() => {
    if (typeof WaveSurfer === 'undefined') {
      console.error("WaveSurfer not loaded. Add it to your index.html or install via npm");
      return;
    }
    const audioUrl = getAudioUrl(message.audio);
    if (!audioUrl || !waveformRef.current) return;
    const containerWidth = containerRef.current?.clientWidth || 200;
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
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
      width: containerWidth - 80,
    });
    wavesurferRef.current = wavesurfer;
    const abortSignal = abortControllerRef.current.signal;
    wavesurfer.load(audioUrl, null, abortSignal);
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
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    };
  }, [message.audio]);

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
        className={`flex items-center p-3 rounded-lg ${isSender ? 'bg-primary text-white' : 'bg-neutral text-white'}`}
      >
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
        <div className="flex-1 mr-2">
          <div ref={waveformRef} className="w-full"></div>
        </div>
        <div className="text-xs whitespace-nowrap min-w-10 text-right">
          {formatTime(isPlaying ? currentTime : (duration || 0))}
        </div>
        <Mic className="size-3 ml-2 opacity-50 flex-shrink-0" />
        <button
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={onActionClick}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
      {showDropdown && (
        <div className={`absolute ${isSender ? 'right-full mr-2' : 'left-full ml-2'} top-0 z-10`}>
          <MessageActions
            message={message}
            onAction={onAction}
            isSender={isSender}
          />
        </div>
      )}
      {message.text && (
        <div className={`mt-1 px-3 py-2 rounded-lg ${isSender ? 'bg-primary text-white' : 'bg-neutral text-white'}`}>
          <div 
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(parseFormatting(message.displayText || message.text))
            }}
          />
          {message.isTranslated && (
            <div className="text-xs mt-1 opacity-70">
              Translated from {message.originalLanguage || 'original language'}
            </div>
          )}
        </div>
      )}
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
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded-full"
          onClick={onActionClick}
        >
          <ChevronDown className="size-4 text-white" />
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
      {message.text && (
        <div className={`mt-1 px-3 py-2 rounded-lg ${isSender ? 'bg-primary text-white' : 'bg-neutral text-white'}`}>
          <div 
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(parseFormatting(message.displayText || message.text))
            }}
          />
          {message.isTranslated && (
            <div className="text-xs mt-1 opacity-70">
              Translated from {message.originalLanguage || 'original language'}
            </div>
          )}
        </div>
      )}
      <div className="text-xs opacity-50 mt-1">
        {formatMessageTime(message.createdAt)}
      </div>
    </div>
  );
};

const TextMessage = ({
  message,
  isSender,
  senderName,
  onActionClick,
  showDropdown,
  onAction,
  summarizedText,
  showOriginal,
  onToggle,
}) => {
  return (
    <div className={`relative group max-w-xs ${isSender ? 'ml-auto' : 'mr-auto'}`}>
      <ReplyPreview message={message} isSender={isSender} senderName={senderName} />
      <div className={`chat-bubble relative flex items-center ${isSender ? 'bg-primary text-white' : 'bg-neutral text-white'} p-3 rounded-lg max-w-[100%]`}>
        <div className="flex flex-col w-full">
          {summarizedText && !showOriginal ? (
            <>
              <div 
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(parseFormatting(summarizedText))
                }}
              />
              <button
                onClick={onToggle}
                className="text-xs text-gray-300 underline mt-1"
              >
                Show Original
              </button>
            </>
          ) : (
            <>
              <div 
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(parseFormatting(message.displayText || message.text))
                }}
              />
              {summarizedText && (
                <button
                  onClick={onToggle}
                  className="text-xs text-gray-300 underline mt-1"
                >
                  Show Summary
                </button>
              )}
            </>
          )}
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
    isGeminiTyping,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [summarizedMessages, setSummarizedMessages] = useState({});
  const [showOriginal, setShowOriginal] = useState({});
  
  // Create a ref for auto-scrolling to the bottom
  const messageEndRef = useRef(null);
  
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);
  
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayMessages, isGeminiTyping]);
  
  useEffect(() => {
    if (messages) {
      setDisplayMessages(messages.map((msg) => ({ ...msg })));
    }
  }, [messages]);
  
  const translateMessage = async (messageId, targetLanguage) => {
    try {
      const messageIndex = displayMessages.findIndex(m => m._id === messageId);
      if (messageIndex === -1) return;
      const message = displayMessages[messageIndex];
      console.log("Target Language link", targetLanguage);
      const detectedLanguage = franc(message.text);
      const languageMap = {
        arb: 'ar', eng: 'en', spa: 'es', fra: 'fr', deu: 'de',
        ita: 'it', por: 'pt', rus: 'ru', zho: 'zh', jpn: 'ja',
        kor: 'ko', hin: 'hi',
      };
      const sourceLanguage = languageMap[detectedLanguage] || 'en';
      console.log("Translating message:", message, "from", sourceLanguage, "to", targetLanguage);
      if (sourceLanguage === targetLanguage) {
        alert("Source and target languages are the same. Please select a different target language.");
        return;
      }
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(message.text)}&langpair=${sourceLanguage}|${targetLanguage}`
      );
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!data.responseData || !data.responseData.translatedText) {
        throw new Error("Invalid API response");
      }
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
  
  const handleMessageAction = async (action, message) => {
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
        console.log("Translate message in handle message action", message);
        break;
      case 'readAloud':
        handleReadAloud(message.displayText || message.text || message.content);
        break;
      case 'summarize':
        console.log("Summarizing message:", message.text);
        try {
          const summary = await summarizeText(message.text);
          console.log("Summarized text:", summary);
          setSummarizedMessages((prev) => ({
            ...prev,
            [message._id]: summary,
          }));
          setShowOriginal((prev) => ({
            ...prev,
            [message._id]: false,
          }));
        } catch (error) {
          console.error("Error summarizing message:", error);
        }
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
              className={`chat group relative ${isSender ? "chat-end" : "chat-start"}`}
              ref={isLastMessage ? messageEndRef : null}
            >
              {message.isTyping ? (
                // Do not render temporary message; overlay spinner handles indication
                null
              ) : message.audio ? (
                <AudioMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() =>
                    setActiveDropdown(activeDropdown === message._id ? null : message._id)
                  }
                  showDropdown={activeDropdown === message._id}
                  onAction={(action) => handleMessageAction(action, message)}
                />
              ) : message.image ? (
                <ImageMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() =>
                    setActiveDropdown(activeDropdown === message._id ? null : message._id)
                  }
                  showDropdown={activeDropdown === message._id}
                  onAction={(action, msg) => handleMessageAction(action, msg)}
                />
              ) : (
                <TextMessage
                  message={message}
                  isSender={isSender}
                  senderName={selectedUser.fullName}
                  onActionClick={() =>
                    setActiveDropdown(activeDropdown === message._id ? null : message._id)
                  }
                  showDropdown={activeDropdown === message._id}
                  onAction={(action, msg) => handleMessageAction(action, msg)}
                  summarizedText={summarizedMessages[message._id]}
                  showOriginal={showOriginal[message._id]}
                  onToggle={() =>
                    setShowOriginal((prev) => ({
                      ...prev,
                      [message._id]: !prev[message._id],
                    }))
                  }
                />
              )}
            </div>
          );
        })}
  
        {/* Dummy element for auto-scroll */}
        <div ref={messageEndRef} />
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
