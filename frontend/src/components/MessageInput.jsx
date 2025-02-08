//import React from 'react'
const MessageInput = () => {
  return (
    <div className="flex items-center p-3 bg-gray-800">
      <input type="text" placeholder="Type a message..." className="flex-1 p-2 rounded-lg bg-gray-700 text-white outline-none" />
      <button className="ml-2 text-gray-400 hover:text-white">📁</button>
      <button className="ml-2 text-gray-400 hover:text-white">➤</button>
    </div>
  );
};

export default MessageInput