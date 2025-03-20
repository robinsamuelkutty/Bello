import { useEffect, useRef } from "react";
import { useCallStore } from "../store/useCallStore";
import { useNavigate } from "react-router-dom";
import { PhoneOff, Phone } from "lucide-react";

const CallScreen = () => {
  const { 
    isCalling, 
    isIncoming, 
    isInCall,
    caller, 
    receiver, 
    callType, 
    acceptCall, 
    rejectCall 
  } = useCallStore();
  
  const navigate = useNavigate();
  const ringtoneRef = useRef(null);
  
  console.log("CallScreen Rendered", { 
    isCalling, 
    isIncoming, 
    isInCall,
    caller, 
    receiver, 
    callType 
  });
  
  
  useEffect(() => {
  
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio('/Ringtone.mp3');
      ringtoneRef.current.loop = true; 
    }
    
   
    if (isIncoming && !isInCall) {
      console.log("Playing ringtone for incoming call");
      ringtoneRef.current.play().catch(err => {
        console.error("Failed to play ringtone:", err);
      });
    } else {
      //
      if (ringtoneRef.current) {
        console.log("Stopping ringtone");
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
    
    // Cleanup function to ensure ringtone stops when component unmounts
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    };
  }, [isIncoming, isInCall]);
  
  
  useEffect(() => {
    if (isInCall) {
      console.log("isInCall is true, navigating to /video");
      
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      navigate("/video");
    }
  }, [isInCall, navigate]);
  
 
  if (!isCalling && !isIncoming) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-100">
        <p className="text-xl mb-4">No call in progress</p>
        <button 
          onClick={() => navigate("/")} 
          className="btn btn-primary"
        >
          Return to Chat
        </button>
      </div>
    );
  }

  const handleAccept = () => {
    console.log("Accepting Call... from callScreen");
    // Stop ringtone before accepting call
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    acceptCall();
  };

  const handleReject = () => {
    // Stop ringtone before rejecting call
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    rejectCall();
    navigate("/");
  };

  if (isIncoming) {
    // Incoming Call UI
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-100">
        <div className="avatar mb-4">
          <div className="w-24 h-24 rounded-full">
            <img src={caller?.profilePic || "/avatar.png"} alt={caller?.fullName || "Caller"} />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">{caller?.fullName || "Unknown Caller"}</h2>
        <p className="text-base-content/70 mb-8">Incoming {callType === "video" ? "Video" : "Voice"} Call...</p>
        <div className="flex gap-8">
          <button onClick={handleReject} className="btn btn-circle btn-error">
            <PhoneOff size={24} />
          </button>
          <button onClick={handleAccept} className="btn btn-circle btn-success">
            <Phone size={24} />
          </button>
        </div>
      </div>
    );
  } else if (isCalling) {
    // Outgoing Call UI
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-100">
        <div className="avatar mb-4">
          <div className="w-24 h-24 rounded-full">
            <img src={receiver?.profilePic || "/avatar.png"} alt={receiver?.fullName || "Recipient"} />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">{receiver?.fullName || "Unknown Recipient"}</h2>
        <p className="text-base-content/70 mb-8">Calling...</p>
        <button onClick={handleReject} className="btn btn-circle btn-error">
          <PhoneOff size={24} />
        </button>
      </div>
    );
  }

  return null;
};

export default CallScreen;