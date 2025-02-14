import React, { useState, useEffect } from "react";
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
  Download,
  Check,
} from "lucide-react";
import api from "../context/api";

const NoteModal = ({ note, onClose, onUpdate }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [isFavorite, setIsFavorite] = useState(note.favorite || false);
  const [activeTab, setActiveTab] = useState("transcript");
  const [showFullContent, setShowFullContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [images, setImages] = useState(note.images || []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [favoriteAnimate, setFavoriteAnimate] = useState(false);

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

  const [audioElement] = useState(() => {
    const audio = new Audio(note.recordingUrl);
    audio.preload = "metadata";
    return audio;
  });

  const handleOverlayClick = (e) => {
    // Only close if the click is directly on the overlay
    if (e.target === e.currentTarget) {
      // If there are unsaved changes, you might want to show a confirmation dialog
      if (isDirty) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to close?"
          )
        ) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    fetch(note.recordingUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const localUrl = URL.createObjectURL(blob);
        audioElement.src = localUrl;
      })
      .catch((error) => console.error("Error fetching audio:", error));
  }, [note.recordingUrl, audioElement]);

  useEffect(() => {
    const updateProgress = () => {
      if (isFinite(audioElement.duration) && audioElement.duration > 0) {
        const percent =
          (audioElement.currentTime / audioElement.duration) * 100;
        setProgress(percent);
      }
    };

    audioElement.addEventListener("timeupdate", updateProgress);
    return () => audioElement.removeEventListener("timeupdate", updateProgress);
  }, [audioElement]);

  useEffect(() => {
    const onLoadedMetadata = () => {
      console.log("Audio duration:", audioElement.duration);
    };
    audioElement.addEventListener("loadedmetadata", onLoadedMetadata);
    return () =>
      audioElement.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [audioElement]);

  const togglePlay = () => {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/api/upload/image", formData);
      setImages([...images, data.url]);
      setIsDirty(true);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleImageDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setIsDirty(true);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(note.recordingUrl);
      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = localUrl;
      link.download = `audio-${note._id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(localUrl);

      // Keep download animation for a moment after completion
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    } catch (error) {
      console.error("Error downloading audio:", error);
      setIsDownloading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      const newFavoriteState = !isFavorite;
      setFavoriteAnimate(true);

      const { data } = await api.patch(`/api/notes/${note._id}/favorite`, {
        favorite: newFavoriteState,
      });

      setIsFavorite(newFavoriteState);
      onUpdate(data.data);

      // Reset animation after 1 second
      setTimeout(() => {
        setFavoriteAnimate(false);
      }, 1000);
    } catch (error) {
      setIsFavorite(!isFavorite);
      setFavoriteAnimate(false);
      console.error("Error toggling favorite:", error);
    }
  };

  const formatTime = (time) => {
    if (!isFinite(time) || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleUpdate = async () => {
    if (!isDirty) return;

    setIsUpdating(true);
    try {
      const updatedNote = {
        ...note,
        title,
        content,
        images,
        isFavorite,
      };

      const { data } = await api.patch(`/api/notes/${note._id}`, updatedNote);
      onUpdate(data.data);
      setIsDirty(false);
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsUpdating(false);
      onClose();
    }
  };

  // New: Copy button handler for the transcript content.
  const handleCopy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-xl overflow-hidden ${
          isFullscreen
            ? "w-full h-full"
            : "w-full h-full sm:w-4/5 md:w-3/4 lg:w-1/2 lg:h-5/6 sm:h-4/5 max-w-5xl"
        }`}
      >
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex justify-between">
            <div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 sm:p-2 hover:bg-gray-50 bg-gray-100 rounded-lg"
              >
                <Maximize2 size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleFavoriteToggle}
                className="p-1.5 sm:p-2 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors relative"
              >
                <Star
                  size={18}
                  className={`
                    transition-all duration-300
                    ${
                      isFavorite
                        ? "text-yellow-400 fill-current"
                        : "text-gray-400"
                    }
                    ${favoriteAnimate ? "scale-125" : "scale-100"}
                  `}
                />
              </button>
              <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg">
                Share
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-50 bg-gray-100 rounded-lg"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-base sm:text-lg font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full"
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setIsEditing(false);
                    }
                  }}
                />
              ) : (
                <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600"
              >
                <Pencil size={14} />
              </button>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-gray-500">
                {note.date}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {note.type === "audio" && (
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
                className={`hidden sm:inline ${
                  isDownloading ? "text-blue-600" : ""
                }`}
              >
                {isDownloading ? "Downloading..." : "Download Audio"}
              </span>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="px-3 sm:px-6 border-b border-gray-100 overflow-x-auto">
          <nav className="flex gap-4 sm:gap-6 whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 sm:py-3 relative text-xs sm:text-sm font-medium ${
                  activeTab === tab.id
                    ? "text-red-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center gap-1">
                  {React.cloneElement(tab.icon, { size: 16 })}
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
        <div className="p-3 sm:p-4 h-[calc(100%-180px)] sm:h-[calc(100%-200px)] overflow-y-auto">
          {activeTab === "transcript" && (
            <div>
              <div className="space-y-3 sm:space-y-4">
                <div className="relative flex justify-between border-gray-200 rounded-lg border p-3 sm:p-4 items-start">
                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className={`absolute top-2 right-2 flex items-center justify-center gap-1 px-2 p-1 rounded-full transition-all duration-200 ${
                      copied
                        ? "bg-red-100 text-red-600 border border-red-600"
                        : "bg-gray-100 hover:bg-gray-200 border border-gray-700"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="animate-bounce" />
                        <span className="text-xs sm:text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-xs sm:text-sm">copy</span>
                      </>
                    )}
                  </button>
                  <div className="flex flex-col w-full mt-8 sm:mt-6">
                    <textarea
                      value={content}
                      onChange={handleContentChange}
                      className="text-gray-800 text-xs sm:text-sm leading-relaxed bg-transparent resize-none w-full focus:outline-none"
                      rows={showFullContent ? 10 : 3}
                    />
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="text-gray-400 underline text-xs sm:text-sm hover:text-gray-600 mt-2 self-start"
                    >
                      {showFullContent ? "Read Less" : "Read More"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 flex items-center justify-start border-gray-200 rounded-lg border">
                {images?.length > 0 && (
                  <div className="px-3 sm:px-6 py-2 sm:py-4">
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="h-16 sm:h-24 relative">
                          <img
                            src={img}
                            alt={`Note attachment ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => handleImageDelete(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 text-xs sm:text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="inline-flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="text-xl sm:text-2xl text-gray-400 mb-1">
                    +
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    Image
                  </span>
                </label>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            {isDirty && (
              <div className="m-2 sm:m-4 left-auto right-4">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isUpdating ? "Updating..." : "Update Note"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
