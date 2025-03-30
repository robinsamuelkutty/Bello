import React, { useState, useEffect } from "react";

const SeekBar = ({ duration, currentTime, onSeek }) => {
  const [localTime, setLocalTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [ignoreExternal, setIgnoreExternal] = useState(false);

  useEffect(() => {
    const safeDuration = Math.max(0, duration || 0);
    const safeCurrentTime = Math.min(Math.max(0, currentTime || 0), safeDuration);
    if (!isDragging && !ignoreExternal) {
      setLocalTime(safeCurrentTime);
    }
  }, [duration, currentTime, isDragging, ignoreExternal]);

  const handleChange = (e) => {
    const newTime = Number(e.target.value);
    if (!isNaN(newTime) && newTime >= 0 && newTime <= (duration || 0)) {
      setLocalTime(newTime);
      setIsDragging(true);
    }
  };

  // When dragging completes, call onSeek and ignore external updates briefly.
  const completeSeek = async () => {
    if (duration && !isNaN(localTime)) {
      try {
        await onSeek(localTime);
        setIgnoreExternal(true);
        setTimeout(() => {
          setIgnoreExternal(false);
          setIsDragging(false);
        }, 600);
      } catch (error) {
        console.error("Error seeking:", error);
        setIsDragging(false);
        setIgnoreExternal(false);
      }
    }
  };

  const handleMouseUp = () => completeSeek();
  const handleTouchEnd = () => completeSeek();
  const handleMouseLeave = () => {
    if (isDragging) {
      completeSeek();
    }
  };

  const formatTime = (ms) => {
    if (ms == null || isNaN(ms)) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const calculateProgressPercentage = () => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (localTime / duration) * 100));
  };

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
      <span>{formatTime(localTime)}</span>
      <div className="flex-grow relative h-1 bg-[#404040] rounded-full overflow-hidden">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={localTime}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchEnd={handleTouchEnd}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
          style={{
            width: `${calculateProgressPercentage()}%`,
            transition: isDragging ? "none" : "width 0.3s ease"
          }}
        />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
};

export default SeekBar;
