//import React from 'react'
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";const ChatContainer = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <ChatHeader/>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex justify-start">
          <div className="bg-gray-700 p-3 rounded-lg max-w-xs">Hello!</div>
        </div>
        <div className="mb-4 flex justify-end">
          <div className="bg-blue-600 p-3 rounded-lg max-w-xs">Hey there!</div>
        </div>
      </div>
      <MessageInput/>
    </div>
  );
};

export default ChatContainer