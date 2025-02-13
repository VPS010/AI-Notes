import React, { useState } from "react";
import {
  X,
  Maximize2,
  Star,
  Play,
  Pause,
  Copy,
  Pencil,
  Captions,
  Notebook,
  FilePlus,
  Speaker,
} from "lucide-react";

const NoteModal = ({ note, onClose, onUpdate }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState(note.content);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite || false);
  const [activeTab, setActiveTab] = useState("transcript");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const tabs = [
    { id: "notes", icon: <Notebook size={18} />, label: "Notes" },
    { id: "transcript", icon: <Captions size={18} />, label: "Transcript" },
    { id: "create", icon: <FilePlus size={18} />, label: "Create" },
    {
      id: "speaker-transcript",
      icon: <Speaker size={18} />,
      label: "Speaker Transcript",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-xl overflow-hidden ${
          isFullscreen ? "w-full h-full" : "w-1/2 max-w-5xl h-4/5"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between">
            <div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-50 bg-gray-100 rounded-lg"
              >
                <Maximize2 size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 hover:bg-gray-50 bg-gray-100 rounded-lg transition-colors"
              >
                <Star
                  size={20}
                  className={
                    isFavorite
                      ? "text-yellow-400 fill-current bg-gray-100"
                      : "text-gray-400 bg-gray-100"
                  }
                />
              </button>
              <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-50 rounded-lg">
                Share
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-50 bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{note.title}</h2>
              <button className="text-gray-600">
                <Pencil size={14} />
              </button>
            </div>
            <div>
              <span className="text-sm text-gray-500">{note.date}</span>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {note.type === "audio" && (
          <div className="px-6 py-1 flex rounded-full mx-4 bg-gray-100 items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-gray-50 hover:bg-gray-800"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-red-600 h-1 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-gray-800 min-w-[80px]">
              00:00 / {note.duration}
            </div>
            <button className="text-sm text-gray-800 hover:text-gray-800 hover:bg-gray-300 p-1 bg-gray-200 rounded-full px-2 font-medium">
              ↓ Download Audio
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 relative text-sm font-medium ${
                  activeTab === tab.id
                    ? "text-red-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <div className="flex">
                  {tab.icon}
                  {tab.label}
                </div>

                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-200px)] overflow-y-auto">
          {activeTab === "transcript" && (
            <div>
              <div className="space-y-4">
                <div className="flex justify-between border-gray-200 rounded-lg border p-4 items-start">
                  <p className="text-gray-800 flex flex-col justify-start text-sm leading-relaxed">
                    {content}
                    <button className="text-gray-400 underline text-sm ml-0 mr-auto hover:text-gray-600">
                      Read More
                    </button>
                  </p>

                  <button className="p-1 rounded-full bg-gray-100 flex items-center justify-center gap-1 hover:bg-gray-200 text-gray-500 px-2">
                    <Copy size={15} />
                    <p>copy</p>
                  </button>
                </div>
              </div>
              {/* Image Upload Section */}
              <div className="mt-4 p-4 border-gray-200 rounded-lg border ">
                <div className="inline-flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer">
                  <div className="text-2xl text-gray-400 mb-1">+</div>
                  <span className="text-xs text-gray-500">Image</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
