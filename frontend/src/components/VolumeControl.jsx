import React from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";

const VolumeControl = ({ volume, onVolumeChange }) => {
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} className="text-green-500" />;
    if (volume < 50) return <Volume1 size={20} className="text-green-500" />;
    return <Volume2 size={20} className="text-green-500" />;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
        className="hover:bg-[#282828] p-1 rounded-full"
      >
        {getVolumeIcon()}
      </button>
      <div className="relative w-24 h-1 bg-[#404040] rounded-full">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
          style={{ width: `${volume}%` }}
        />
        <div
          className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20"
          style={{ left: `${volume}%` }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
