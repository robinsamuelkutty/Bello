import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useCallStore = create((set, get) => ({
  
  isCalling: false,
  callType: null,
  caller: null,
  receiver: null,
  isIncoming: false,
  isInCall: false,
  navigateCallback: null,
  setNavigateCallback: (callback) => {
    set({ navigateCallback: callback });
  },
  
  startCall: (receiver, type) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!authUser || !socket) return;
    
    console.log("Starting Call:", { authUser, receiver, type });
    
    set({
      isCalling: true,
      callType: type,
      caller: authUser,
      receiver,
      isIncoming: false,
      
    });

    // Notify the receiver about the incoming call
    socket.emit("callUser", {
      from: authUser,
      to: receiver._id,
      type,
    });
  },

  acceptCall: () => {
    const { caller } = get();
    const { socket: authSocket, authUser } = useAuthStore.getState(); 
  
    set({ isInCall: true, isIncoming: false });
    
    if (authSocket && caller) {
      authSocket.emit("callAccepted", {
        to: caller._id,
        from: authUser  // Include the authUser data here
      });
    }
  
    const { navigateCallback } = get();
    if (navigateCallback) {
      navigateCallback("/video");
    }
  },


  rejectCall: () => {
    const { socket, caller, receiver } = get();
    const recipientId = caller?._id || receiver?._id;
    
    set({ 
      isCalling: false, 
      isInCall: false,
      isIncoming: false,
      caller: null, 
      receiver: null 
    });
    
    // Notify the other user that call was rejected
    if (socket && recipientId) {
      socket.emit("callRejected", {
        to: recipientId
      });
    }
  },

  receiveCall: (callData) => {
    set({
      isIncoming: true,
      callType: callData.type,
      caller: callData.from,
      receiver: useAuthStore.getState().authUser,
    });

    console.log("Incoming call received and state updated:", callData);
    const { navigateCallback } = get();
    if (navigateCallback) {
      
      navigateCallback("/call-screen");
    }
  },
  endCall: () => {
    const { socket, caller, receiver } = get();
    const recipientId = caller?._id !== useAuthStore.getState().authUser._id 
      ? caller?._id 
      : receiver?._id;
    
    set({ 
      isCalling: false, 
      isInCall: false,
      caller: null, 
      receiver: null 
    });
    
    // Notify the other user that call ended
    if (socket && recipientId) {
      socket.emit("callEnded", {
        to: recipientId
      });
    }
  },
  
  // Method to be called when socket event listeners are set up
  setupCallListeners: () => {
    
    const { socket } = useAuthStore.getState();
    if (!socket) {
      console.log("Socket not available in setupCallListeners");
      return;
    }
    
    
    socket.off("incomingCall");
    socket.off("callAccepted");
    socket.off("callRejected");
    socket.off("callEnded");
    
    // Set up listeners for call-related events
    socket.on("incomingCall", (data) => {
      console.log("incomingCall event received:", data);
      get().receiveCall(data);
    });
    
    socket.on("callAccepted", (data) => {
      console.log("Call accepted, navigating to video page", data);
      
      // Make sure data.from exists before using it
      if (data && data.from) {
        set({ 
          isInCall: true,
          isCalling: false,
          receiver: data.from 
        });
      } else {
        console.error("Missing user data in callAccepted event", data);
      }
      
      const { navigateCallback } = get();
      if (navigateCallback) {
        navigateCallback("/video");
      }
    });
    
    socket.on("callRejected", () => {
      console.log("Call rejected");
      set({ 
        isCalling: false, 
        isInCall: false,
        caller: null, 
        receiver: null 
      });
    });
    
    socket.on("callEnded", () => {
      console.log("Call ended by the other user");
      set({ 
        isCalling: false, 
        isInCall: false,
        caller: null, 
        receiver: null 
      });
    });
  }
}));