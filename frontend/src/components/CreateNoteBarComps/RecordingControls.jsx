// RecordingControls.js
import React from "react";
import { Pencil, Image, Dot, Square, Mic } from "lucide-react";

const RecordingControls = ({
  setIsEditorOpen,
  isRecording,
  recordingTimer,
  supportsMedia,
  supportsSpeech,
  startRecording,
  stopRecording,
}) => {
  return (
    <div className="bottom-0 rounded-full shadow-sm shadow-gray-500 my-4 py-1 left-0 right-0 bg-white border-t border-gray-200 px-4">
      <div className="max-w-screen-xl mx-auto flex items-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white rounded-lg px-4 py-2">
          <button
            type="button"
            onClick={() => setIsEditorOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Pencil className="text-gray-600" size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsEditorOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Image className="text-gray-600" size={20} />
          </button>
        </div>

        {isRecording && (
          <div className="flex items-center space-x-2">
            <Mic className="text-red-500 h-6 w-6 animate-pulse" />
            <span className="text-red-500">
              {Math.floor(recordingTimer / 60)}:
              {(recordingTimer % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-1 ${
            !supportsMedia || !supportsSpeech
              ? "bg-gray-400 cursor-not-allowed"
              : isRecording
              ? "bg-gray-500"
              : "bg-red-500"
          } text-white flex rounded-full justify-center items-center`}
          disabled={!supportsMedia || !supportsSpeech}
        >
          {isRecording ? (
            <Square className="text-white h-8 w-8" />
          ) : (
            <Dot className="text-white h-8 w-8" />
          )}
          <span className="text-md font-medium ml-2">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default RecordingControls;
