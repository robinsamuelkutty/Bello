//import React from 'react'
const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center gap-3">
        <img src="https://via.placeholder.com/40" alt="Profile" className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold">Username</p>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-white">✖</button>
    </div>
  );
};

export default ChatHeader