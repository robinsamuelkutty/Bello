//import React from 'react'
import { useThemeStore } from "../store/useThemeStore";

const ChatHeader = () => {
  const { theme } = useThemeStore();

  return (
    <div className="flex items-center justify-between p-4 bg-base-200 text-base-content border-b border-base-300" data-theme={theme}>
      <div className="flex items-center gap-3">
        <img
          src="https://publish-p47754-e237306.adobeaemcloud.com/adobe/dynamicmedia/deliver/dm-aid--46f84f92-3cda-444b-bb0e-605d50aa156f/_390575742906.app.webp?preferwebp=true"
          alt="Profile"
          className="w-14 h-14 rounded-full" 
        />
        <div>
          <p className="font-semibold">Cristiano Ronaldo</p>
          <p className="text-sm text-success">Online</p> 
        </div>
      </div>

      {/* Right: Close Button */}
      <button className="text-base-content hover:text-error text-lg">✖</button>
    </div>
  );
};

export default ChatHeader;