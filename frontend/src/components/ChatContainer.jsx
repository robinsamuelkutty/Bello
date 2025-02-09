//import React from 'react'
import ChatHeader from "./ChatHeader";
import { useThemeStore } from "../store/useThemeStore";
import MessageInput from "./MessageInput";
const ChatContainer = () => {
  const { theme } = useThemeStore();
  return (
    <div className="w-full h-screen flex flex-col pt-16" data-theme={theme}>
      <ChatHeader />
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Received message */}
        <div className="mb-4 flex justify-start">
          <div className="bg-base-200 text-base-content p-3 rounded-lg max-w-xs">
            SUUIIII!
          </div>
        </div>
        {/* Sent message */}
        <div className="mb-4 flex justify-end">
          <div className="bg-primary text-primary-content p-3 rounded-lg max-w-xs">
            Hey there!
          </div>
        </div>
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer