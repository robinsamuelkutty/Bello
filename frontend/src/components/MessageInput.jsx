import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Check, Mic, Trash2, StopCircle, Play, Pause } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import pako from "pako";
import WaveSurfer from "wavesurfer.js";

const MessageInput = ({
  replyingMessage,
  setReplyingMessage,
  editingMessage,
  setEditingMessage,
  onEditComplete,
}) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, editMessage, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);

  // Utility function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const compressToBase64 = (buffer) => {
    const compressed = pako.deflate(buffer);
    return btoa(String.fromCharCode(...compressed));
  };

  const handleSendVoice = (voiceBlob) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const base64Compressed = compressToBase64(new Uint8Array(arrayBuffer));
  
      // Send compressed Base64 data to backend or database
      sendMessageToBackend({
        voiceData: base64Compressed,
        // other message data
      });
    };
  
    reader.readAsArrayBuffer(voiceBlob);
  };

  // Pre-fill the input fields when editing a message
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      setImagePreview(editingMessage.image || null);
      setAudioBlob(editingMessage.audio || null);
    } else {
      setText("");
      setImagePreview(null);
      setAudioBlob(null);
    }
  }, [editingMessage]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      // Start the timer if recording is active
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      // Clear the timer when recording stops
      clearInterval(timer);
    }

    // Cleanup function to clear the timer when component unmounts or recording stops
    return () => clearInterval(timer);
  }, [isRecording]);

  // Initialize WaveSurfer when audio blob changes
  useEffect(() => {
    if (audioBlob && waveformRef.current) {
      // Destroy previous instance if exists
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4f46e5',
        progressColor: '#818cf8',
        cursorColor: 'transparent',
        barWidth: 2,
        barRadius: 3,
        barGap: 3,
        height: 48,
        responsive: true,
      });

      wavesurfer.on('ready', () => {
        wavesurferRef.current = wavesurfer;
        setDuration(Math.floor(wavesurfer.getDuration()));
      });

      wavesurfer.on('audioprocess', () => {
        setCurrentTime(Math.floor(wavesurfer.getCurrentTime()));
      });

      wavesurfer.on('finish', () => {
        setIsPlaying(false);
      });

      // Load audio blob
      wavesurfer.loadBlob(audioBlob);

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, [audioBlob]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60); // Get minutes
    const secs = seconds % 60; // Get remaining seconds
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  // Handle image file selection and compression
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

  // Remove the selected image
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const audioChunks = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        console.log("audioBlob", audioBlob);
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop()); // Stop the microphone stream
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setTime(0);
    }
  };

  // Remove the recorded audio
  const removeAudio = () => {
    setAudioBlob(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  // Handle sending or updating a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;

    try {
      // Convert audio Blob to Base64
      const audioBase64 = audioBlob ? await blobToBase64(audioBlob) : null;
    
      const newMessage = {
        text: text.trim(),
        image: imagePreview,
        audio: audioBase64, // Use Base64 string instead of Blob URL
        replyTo: replyingMessage
          ? {
              _id: replyingMessage._id,
              text: replyingMessage.text,
              image: replyingMessage ? replyingMessage.image : null,
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
      setAudioBlob(null);
      setReplyingMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send/update message:", error);
      toast.error("Failed to send/update message");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMessage(null);
    setText("");
    setImagePreview(null);
    setAudioBlob(null);
  };

  return (
    <div>
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
              {editingMessage.text || "Image or audio message"}
            </p>
          </div>
        )}

        {/* Replying Message Section */}
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
              {replyingMessage.text || "Image or audio message"}
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

        {/* Audio Preview */}
        {audioBlob && !isRecording && (
          <div className="mb-3 bg-base-200 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={togglePlayPause}
                className="btn btn-circle btn-sm"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <button
                onClick={removeAudio}
                className="btn btn-ghost btn-sm ml-auto"
                aria-label="Remove audio"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            
            {/* Waveform visualization */}
            <div ref={waveformRef} className="w-full h-12 bg-opacity-25 rounded"></div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {!isRecording ? (
            <>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  className="w-full input input-bordered rounded-lg input-md sm:input-md"
                  placeholder={
                    editingMessage ? "Edit your message..." : "Type a message..."
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  aria-label="Message input"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  aria-label="Upload image"
                />

                <button
                  type="button"
                  className={`sm:flex btn btn-circle
                           ${imagePreview ? "text-emerald-500" : "text-black-400"}`}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach image"
                >
                  <Image size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-circle btn-ghost"
                  onClick={startRecording}
                  aria-label="Record audio"
                >
                  <Mic size={20} />
                </button>

                <button
                  type="submit"
                  className="btn btn-md btn-square bg-primary text-white"
                  disabled={!text.trim() && !imagePreview && !audioBlob}
                  aria-label="Send message"
                >
                  {editingMessage ? <Check size={22} /> : <Send size={22} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex justify-center items-center">
              {/* Empty container during recording - actual UI is below */}
            </div>
          )}
        </form>
      </div>
      
      {/* Recording UI */}
      {isRecording && (
        <div className="flex items-center justify-between gap-3 p-3 bg-gray-900 rounded-xl text-white w-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-mono">{formatTime(time)}</span>
          </div>

          {/* Audio Wave Animation */}
          <motion.div
            className="w-24 h-6 flex items-center justify-center gap-1"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {/* Map through 5 bars to create the wave effect */}
            {[1, 2, 3, 4, 5].map((bar, index) => (
              <motion.div
                key={index}
                className="w-1 bg-gray-300 rounded-md"
                animate={{
                  height: [`${5 + index * 4}px`, `${10 + index * 4}px`, `${5 + index * 4}px`]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: index * 0.1,
                }}
              />
            ))}
          </motion.div>

          {/* Recording Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={stopRecording}
              className="btn btn-circle bg-red-500 text-white hover:bg-red-600"
            >
              <StopCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;