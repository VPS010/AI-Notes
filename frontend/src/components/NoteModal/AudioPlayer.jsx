// AudioPlayer.js
import React from "react";
import { Play, Pause, Download } from "lucide-react";

/**
 * Props:
 * - audioElement: reference to the audio element.
 * - togglePlay: function to play/pause the audio.
 * - isPlaying: boolean indicating play state.
 * - progress: numeric progress percentage.
 * - formatTime: function to format time.
 * - handleDownload: function to trigger download.
 * - isDownloading: boolean indicating if download is in progress.
 */

const AudioPlayer = ({
  audioElement,
  togglePlay,
  isPlaying,
  progress,
  formatTime,
  handleDownload,
  isDownloading,
}) => {
  return (
    <div className="px-3 sm:px-6 py-1 flex items-center gap-2 sm:gap-4 bg-gray-100 mx-2 sm:mx-4 rounded-full">
      <button
        onClick={togglePlay}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div className="flex-1">
        <div className="bg-gray-200 rounded-full h-1 relative cursor-pointer">
          <div
            className="bg-red-600 h-1 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <span
            className="absolute bg-red-600 w-2 h-2 sm:w-3 sm:h-3 rounded-full -translate-x-1/2 -translate-y-2/3"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs sm:text-sm text-gray-800 whitespace-nowrap">
        {formatTime(audioElement.currentTime)}/
        {formatTime(audioElement.duration)}
      </span>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="text-xs sm:text-sm flex text-gray-800 gap-1 items-center justify-center hover:bg-gray-300 px-2 sm:px-3 py-1 rounded-full bg-gray-200 transition-all duration-200"
      >
        <Download
          size={16}
          className={`transition-all duration-200 ${
            isDownloading ? "animate-bounce text-blue-600" : ""
          }`}
        />
        <span
          className={`hidden sm:inline ${isDownloading ? "text-blue-600" : ""}`}
        >
          {isDownloading ? "Downloading..." : "Download Audio"}
        </span>
      </button>
    </div>
  );
};

export default AudioPlayer;
