import { useEffect, useRef, useState, useCallback } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useNavigate } from "react-router-dom";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

// Move these to environment variables in a production app
const APP_ID = 334784404; // Your ZegoCloud App ID
const SERVER_SECRET = "0ce1fa7feef259b5b4ecb300181067dd"; // Your ZegoCloud App Sign

// ZegoCloud requires a token for authentication
// This is a simplified version for client-side - in production, generate tokens on your server
const fetchToken = async (userID) => {
  try {
    console.log('Fetching token for user:', userID);
    const response = await fetch(`https://bello-ob8m.onrender.com/api/zego/token/${userID}`);
    const data = await response.json();
    console.log('Token API response:', data);
    if (!data.success) {
      throw new Error(data.message || 'Failed to get token');
    }
    
    return data.token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
};

const VideoCallPage = () => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { 
    isCalling, 
    isInCall, 
    isIncoming, 
    callType, 
    caller, 
    receiver, 
    endCall 
  } = useCallStore();
  
  const navigate = useNavigate();
  const isVideoCall = callType === "video";
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const zegoEngineRef = useRef(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerRef, setCallTimerRef] = useState(null);
  const [streamID, setStreamID] = useState(null);
  const [remoteStreamID, setRemoteStreamID] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [isEngineInitialized, setIsEngineInitialized] = useState(false);
  const [isLoggedInToRoom, setIsLoggedInToRoom] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const cleanupCall = useCallback(() => {
    if (callTimerRef) {
      clearInterval(callTimerRef);
    }
    
    if (remoteStreamID && zegoEngineRef.current) {
      try {
        zegoEngineRef.current.stopPlayingStream(remoteStreamID);
        console.log("Stopped playing remote stream");
      } catch (error) {
        console.error("Error stopping remote stream:", error);
      }
    }
    
    if (streamID && zegoEngineRef.current) {
      try {
        zegoEngineRef.current.stopPublishingStream(streamID);
        console.log("Stopped publishing stream");
      } catch (error) {
        console.error("Error stopping publishing:", error);
      }
    }
    
    if (localStream) {
      try {
        localStream.getTracks().forEach(track => track.stop());
        if (zegoEngineRef.current) {
          zegoEngineRef.current.destroyStream(localStream);
        }
        console.log("Local stream stopped and destroyed");
      } catch (error) {
        console.error("Error cleaning up local stream:", error);
      }
    }
    
    if (zegoEngineRef.current && isLoggedInToRoom) {
      try {
        zegoEngineRef.current.logoutRoom();
        setIsLoggedInToRoom(false);
        console.log("Logged out of room");
      } catch (error) {
        console.error("Error logging out of room:", error);
      }
    }
    
    setLocalStream(null);
    setStreamID(null);
    setRemoteStreamID(null);
  }, [callTimerRef, remoteStreamID, streamID, localStream, isLoggedInToRoom]);

  useEffect(() => {
    if (isLoggedInToRoom) {
      console.log("isLoggedInToRoom is true, calling startPublishingStream...");
      startPublishingStream();
    }
  }, [isLoggedInToRoom]);

  useEffect(() => {
    console.log("isLoggedInToRoom updated:", isLoggedInToRoom);
  }, [isLoggedInToRoom]);

  // Redirect if there's no call in progress
  useEffect(() => {
    if (!isInCall && !isCalling) {
      navigate("/");
    }
  }, [isInCall, isCalling, navigate]);

  // Call timer
  useEffect(() => {
    if (isInCall) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      setCallTimerRef(timer);
      
      return () => clearInterval(timer);
    }
  }, [isInCall]);

  // Check and request permissions explicitly
  const checkAndRequestPermissions = async () => {
    try {
      console.log("💕💕Checking media permissions...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Available devices:", devices);
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');
      console.log("Video input available:", hasVideoInput);
      console.log("Audio input available:", hasAudioInput);
      if (isVideoCall && !hasVideoInput) {
        setCameraError(true);
        return false;
      }
      
      if (!hasAudioInput) {
        setConnectionError("Microphone not found");
        return false;
      }
      
      // Request permissions explicitly
      const constraints = {
        audio: true,
        video: isVideoCall
      };
      
      await navigator.mediaDevices.getUserMedia(constraints);
      return true;
    } catch (error) {
      console.error("Permission error:", error);
      setConnectionError(`Failed to access ${isVideoCall ? 'camera/microphone' : 'microphone'}`);
      return false;
    }
  };

  // Function to start publishing stream
  const startPublishingStream = async () => {
    console.log("💫💫💫Entering startPublishingStream");
    console.log("zegoEngineRef.current:", zegoEngineRef.current);
    console.log("isLoggedInToRoom in startPublishingStream:", isLoggedInToRoom);
  
    if (!zegoEngineRef.current || !isLoggedInToRoom) {
      console.log("Exiting early: zegoEngineRef.current or isLoggedInToRoom is falsy");
      return;
    }
    
    try {
      console.log("Checking permissions...");
      const permissionsGranted = await checkAndRequestPermissions();
      console.log("Permissions granted:", permissionsGranted);
      if (!permissionsGranted) return;
      
      // Create local stream with explicit constraints
      const config = { 
        camera: {
          video: isVideoCall,
          audio: true
        }
      };
      console.log("Creating stream...");
      const stream = await zegoEngineRef.current.createStream(config);
      console.log("💕💕Stream created:", stream);
      console.log("Stream track details:", {
        audio: stream.getAudioTracks().length > 0,
        video: stream.getVideoTracks().length > 0
      });
      // Test if stream is valid
      if (!stream) {
        throw new Error("Failed to create media stream");
      }
      
      console.log("✅✅✅Stream created successfully:", stream);
      setLocalStream(stream);
      
      // Mount local stream to video element
      if (localVideoRef.current) {
        console.log("Setting localVideoRef source");
        localVideoRef.current.srcObject = stream;
        console.log("Local video element:", {
          width: localVideoRef.current.clientWidth,
          height: localVideoRef.current.clientHeight,
          visible: localVideoRef.current.offsetParent !== null
        });
        // Ensure video plays by calling play() after setting srcObject
        localVideoRef.current.play().catch(e => console.error("Error playing local video:", e));
      }
      else {
        console.error("❌Local video ref is NULL");
      }
      // Generate unique stream ID
      const myStreamID = `stream_${authUser._id}_${Date.now()}`;
      setStreamID(myStreamID);
      
      // Start publishing with explicit quality settings
      zegoEngineRef.current.startPublishingStream(myStreamID, stream);
      
      console.log("✅Local stream published successfully with ID:", myStreamID);
    } catch (error) {
      console.error("❌Failed to create or publish local stream:", error);
      setConnectionError("Failed to access camera/microphone: " + error.msg);
    }
  };

  // Initialize ZegoCloud SDK only once
  useEffect(() => {
    if (!authUser || (!isInCall && !isCalling) || isEngineInitialized) return;
    console.log("💫💫Auth User:", authUser);
    // Create the ZegoExpressEngine instance
    try {
      zegoEngineRef.current = new ZegoExpressEngine(APP_ID, SERVER_SECRET);
      
      // Set log level to verbose for debugging
      zegoEngineRef.current.setLogConfig({
        logLevel: 'error'
      });
      
      setIsEngineInitialized(true);
      console.log("✅ ZegoEngine initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize ZegoEngine:", error);
      setConnectionError("Failed to initialize call system: " + error.message);
    }
    
    // Cleanup on component unmount
    return () => {
      if (zegoEngineRef.current) {
        try {
          // Make sure to logout from any rooms first
          if (isLoggedInToRoom) {
            zegoEngineRef.current.logoutRoom();
          }
          
          zegoEngineRef.current.destroyEngine();
          zegoEngineRef.current = null;
          
        } catch (error) {
          console.error("Error destroying ZegoEngine:", error);
        }
      }
    };
  }, [authUser, isInCall, isCalling]);

  // Setup room and event listeners
  useEffect(() => {
    if (!zegoEngineRef.current || !isEngineInitialized || !authUser || (!isInCall && !isCalling)) return;
    
    // Modify your roomID generation code
    const userID = authUser._id ? String(authUser._id) : null;
    if (!userID) {
      setConnectionError("Authentication error: Invalid user ID");
      return;
    }

    const remoteUser = caller?._id !== authUser._id ? caller : receiver;
    if (!remoteUser || !remoteUser._id) {
      setConnectionError("Remote user not found or has invalid ID");
      return;
    }

    const remoteUserID = String(remoteUser._id);
    
    // Create room ID by concatenating IDs in alphabetical order to ensure consistency
    const roomID = userID < remoteUserID 
      ? `call_${userID}_${remoteUserID}` 
      : `call_${remoteUserID}_${userID}`;
      
    console.log("Setting up ZegoCloud with room ID:", roomID, "Remote user:", remoteUser);
    
    // Check system requirements
    const checkRequirements = async () => {
      try {
        const requirementsResult = await zegoEngineRef.current.checkSystemRequirements();
        console.log("System requirements check:", requirementsResult);
        if (!requirementsResult.webRTC) {
          setConnectionError("Your browser does not support WebRTC");
          return false;
        }
        return true;
      } catch (error) {
        console.error("Failed to check system requirements:", error);
        setConnectionError("Failed to check system compatibility");
        return false;
      }
    };
    
    // Set up room state event listener
    zegoEngineRef.current.on("roomStateChanged", (roomID, reason, errorCode, extendData) => {
      console.log("Room state changed:", reason, errorCode);
      
      if (reason === "LOGINING") {
        console.log("Logging in to room:", roomID);
      } else if (reason === "LOGINED") {
        console.log("Successfully logged in to room:", roomID);
        setIsLoggedInToRoom(true);
        console.log("isLoggedInToRoom after login:", true); // Add this log
        console.log("Calling startPublishingStream...");
        
      } else if (reason === "LOGIN_FAILED") {
        console.error("Failed to log in to room:", errorCode);
        
        let errorMessage = "Failed to establish call connection";
        
        // Handle specific error codes
        if (errorCode === 1102016) {
          errorMessage = "Authentication failed. Please try again.";
        } else if (errorCode === 1002001) {
          errorMessage = "Already in another call. Please end it first.";
          // Force cleanup and logout
          cleanupCall();
        }
        
        setConnectionError(errorMessage);
      } else if (reason === "RECONNECTING") {
        console.log("Reconnecting to room:", roomID);
      } else if (reason === "RECONNECTED") {
        console.log("Reconnected to room:", roomID);
      } else if (reason === "RECONNECT_FAILED") {
        console.error("Failed to reconnect to room");
        setConnectionError("Connection lost. Call ended.");
      } else if (reason === "KICKOUT") {
        console.log("Kicked out of room:", roomID);
        setConnectionError("You have been kicked out of the call");
      }
    });
    
    // Set up user update event listener
    zegoEngineRef.current.on("roomUserUpdate", (roomID, updateType, userList) => {
      console.log("User update:", updateType, userList);
      if (updateType === "DELETE" && userList.length > 0) {
        // Handle remote user leaving
        console.log("Remote user left the call");
        handleEndCall();
      }
    });
    
    // Set up stream update event listener
    zegoEngineRef.current.on("roomStreamUpdate", async (roomID, updateType, streamList, extendedData) => {
      console.log("❤️Stream update:", updateType, streamList);
      
      if (updateType === "ADD" && streamList.length > 0) {
        try {
          const incomingStreamID = streamList[0].streamID;
          setRemoteStreamID(incomingStreamID);
          console.log("👌Starting to play remote stream:", incomingStreamID);
          
          // Start playing remote stream when available
          const remoteStream = await zegoEngineRef.current.startPlayingStream(incomingStreamID);
          
          console.log("Remote stream obtained:", remoteStream);
          
          // Mount the stream to the video element
          if (remoteVideoRef.current) {
            console.log("Setting remoteVideoRef source");
            remoteVideoRef.current.srcObject = remoteStream;
            // Ensure video plays
            remoteVideoRef.current.play().catch(e => console.error("Error playing remote video:", e));
          } else {
            console.error("Remote video ref is null");
          }
          
          console.log("Started playing remote stream");
        } catch (error) {
          console.error("Failed to play remote stream:", error);
        }
      } else if (updateType === "DELETE" && streamList.length > 0) {
        // Stop playing remote stream when it's removed
        try {
          zegoEngineRef.current.stopPlayingStream(streamList[0].streamID);
          console.log("❌Stopped playing remote stream");
        } catch (error) {
          console.error("Failed to stop playing remote stream:", error);
        }
      }
    });
    
    // Set up error handlers
    zegoEngineRef.current.on("error", (errorCode, extendedData) => {
      console.error("❌Zego error:", errorCode, extendedData);
      setConnectionError(`Call error (${errorCode}). Please try again.`);
    });

    // Set up playback state update
    zegoEngineRef.current.on("playerStateUpdate", (streamID, state) => {
      console.log("Player state update:", streamID, state);
    });

    // Initialize and join room
    const initializeCall = async () => {
      console.log("isLoggedInToRoom:", isLoggedInToRoom);
      if (isLoggedInToRoom) {
        try {
          zegoEngineRef.current.logoutRoom();
          setIsLoggedInToRoom(false);
          console.log("Logged out of previous room");
        } catch (error) {
          console.error("Error logging out of previous room:", error);
        }
      }
      
      // Check system requirements
      const requirementsMet = await checkRequirements();
      if (!requirementsMet) return;
      
      try {
        // Get token before logging in
        console.log("Fetching token for user ID:", userID);
        const token = await fetchToken(userID);
        console.log("Token received:", !!token);

        if (!token) {
          setConnectionError('Failed to authenticate. Please try again.');
          return;
        }
        
        console.log("Attempting to log into room:", roomID);
        const loginResult = await zegoEngineRef.current.loginRoom(
          roomID, 
          token,
          { 
            userID: userID, 
            userName: authUser.fullName || userID
          }, 
          { userUpdate: true }
        );
        console.log("✅✅✅✅Login result:", loginResult);
        if (loginResult) {
          console.log("✅💫✅💫Successfully logged in to room");
        } else {
          console.error("Failed to log in to room");
          setConnectionError("Failed to join call room");
        }
      } catch (error) {
        console.error("Room login error:", error);
        setConnectionError("Failed to establish call connection: " + error.message);
      }
    };

    // Call the initialization function
    initializeCall();

    // Cleanup on unmount or dependencies change
    return () => {
      cleanupCall();
    };
  }, [authUser, receiver, caller, isInCall, isVideoCall, isEngineInitialized]);

  // Effect to handle connection errors
  useEffect(() => {
    if (connectionError) {
      alert(connectionError);
      handleEndCall();
    }
  }, [connectionError]);

  const handleEndCall = () => {
    cleanupCall();
    endCall();
    navigate("/");
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && isVideoCall) {
      console.log("Toggling video tracks...");
      localStream.getVideoTracks().forEach(track => {
        console.log("Video track before toggle:", track.enabled);
        track.enabled = isVideoOff;
        console.log("Video track after toggle:", track.enabled);
      });
      setIsVideoOff(!isVideoOff);
    } else {
      console.log("Cannot toggle video:", {
        localStream: !!localStream,
        isVideoCall
      });
    }
  };

  // Format call duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine remote user for display purposes
  const displayUser = caller?._id !== authUser._id ? caller : receiver;

  return (
    <div className="h-screen flex flex-col">
      <div className="relative h-full bg-base-200">
        {/* Remote Video (Full screen) */}
        <div className="absolute inset-0">
          {isVideoCall ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="avatar mb-4">
                <div className="w-32 h-32 rounded-full">
                  <img 
                    src={displayUser?.profilePic || "/avatar.png"} 
                    alt="Remote User" 
                  />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                {displayUser?.fullName || "Remote User"}
              </h2>
              <p className="text-base-content/70 mb-2">Voice Call in Progress</p>
              <p className="text-base-content/60">{formatDuration(callDuration)}</p>
            </div>
          )}
        </div>
        
        {/* Local Video (Small overlay) */}
        {isVideoCall && (
          <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-xs p-1 text-center">
                Camera not available
              </div>
            )}
          </div>
        )}
        
        {/* Call Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
          <button 
            onClick={toggleMute}
            className={`btn btn-circle ${isMuted ? 'btn-error' : 'btn-primary'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          {isVideoCall && (
            <button 
              onClick={toggleVideo}
              className={`btn btn-circle ${isVideoOff ? 'btn-error' : 'btn-primary'}`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}
          
          <button 
            onClick={handleEndCall}
            className="btn btn-circle btn-error"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
