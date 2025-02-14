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

  useEffect(() => {
    fetch(note.recordingUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const localUrl = URL.createObjectURL(blob);
        audioElement.src = localUrl;
        // Now, when loadedmetadata fires, audioElement.duration should be finite.
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

  const handleFavoriteToggle = async () => {
    try {
      const newFavoriteState = !isFavorite;

      const { data } = await api.patch(`/api/notes/${note._id}/favorite`, {
        favorite: newFavoriteState,
      });

      setIsFavorite(newFavoriteState);

      // Update the parent component
      onUpdate(data.data);
    } catch (error) {
      // Revert on error
      setIsFavorite(!newFavoriteState);
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
                onClick={handleFavoriteToggle}
                className="p-2 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
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
              <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg">
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
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-lg font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1"
                  autoFocus
                  onBlur={() => setIsEditing(false)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setIsEditing(false);
                    }
                  }}
                />
              ) : (
                <h2 className="text-lg font-semibold">{title}</h2>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600"
              >
                <Pencil size={14} />
              </button>
            </div>
            <div>
              <span className="text-sm text-gray-500">{note.date}</span>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {/* Audio Player */}
        {note.type === "audio" && (
          <div className="px-6 py-1 flex items-center gap-4 bg-gray-100 mx-4 rounded-full">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div
                className="bg-gray-200 rounded-full h-1 relative cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * audioElement.duration;
                  audioElement.currentTime = newTime;
                }}
              >
                <div
                  className="bg-red-600 h-1 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className="absolute bg-red-600 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-2/3"
                  style={{ left: `${progress}%` }}
                />
              </div>
            </div>

            {/* Timestamp */}
            <span className="text-sm text-gray-800 whitespace-nowrap">
              {formatTime(audioElement.currentTime)}/
              {formatTime(audioElement.duration)}
            </span>

            {/* Download Button */}
            <button
              onClick={() => {
                // Fetch the audio file as a blob and force download
                fetch(note.recordingUrl)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const localUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = localUrl;
                    link.download = `audio-${note._id}.mp3`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(localUrl);
                  })
                  .catch((error) =>
                    console.error("Error downloading audio:", error)
                  );
              }}
              className="text-sm flex text-gray-800 gap-1 items-center justify-center hover:bg-gray-300 px-3 py-1 rounded-full bg-gray-200"
            >
              <Download size={18} /> Download Audio
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
                  <div className="flex flex-col w-full">
                    <textarea
                      value={content}
                      onChange={handleContentChange}
                      className="text-gray-800 text-sm leading-relaxed bg-transparent resize-none w-full focus:outline-none"
                      rows={showFullContent ? 10 : 3}
                    />
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="text-gray-400 underline text-sm hover:text-gray-600 mt-2 self-start"
                    >
                      {showFullContent ? "Read Less" : "Read More"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mt-4 p-4 flex items-center justify-start border-gray-200 rounded-lg border">
                {images?.length > 0 && (
                  <div className="px-6 py-4">
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, index) => (
                        <div key={index} className=" h-24 relative">
                          <img
                            src={img}
                            alt={`Note attachment ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => handleImageDelete(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="inline-flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="text-2xl text-gray-400 mb-1">+</div>
                  <span className="text-xs text-gray-500">Image</span>
                </label>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            {isDirty && (
              <div className="m-4 bottom-4 left-auto right-4">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isUpdating ? "Updating..." : "Update Note"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Update Button */}
      </div>
    </div>
  );
};

export default NoteModal;
