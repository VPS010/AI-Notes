// NoteModal.js
import React, { useState, useEffect } from "react";
import Header from "./NoteModal/Header";
import AudioPlayer from "./NoteModal/AudioPlayer";
import TabNavigation from "./NoteModal/TabNavigation";
import TranscriptContent from "./NoteModal/TranscriptContent";
import ImageUpload from "./NoteModal/ImageUpload";
import UpdateButton from "./NoteModal/UpdateButton";
import api from "../context/api";
import { Notebook, Captions, FilePlus, Speaker } from "lucide-react";

/**
 * NoteModal component that renders the complete modal view.
 *
 * Props:
 * - note: note object with properties like content, title, images, etc.
 * - onClose: function to close the modal.
 * - onUpdate: function to update note data after changes.
 */
const NoteModal = ({ note, onClose, onUpdate }) => {
  // State declarations for modal functionality
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

  // Define tabs for navigation
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

  // Create an audio element using the note's recording URL
  const [audioElement] = useState(() => {
    const audio = new Audio(note.recordingUrl);
    audio.preload = "metadata";
    return audio;
  });

  // Handle clicks on the overlay (background) to close modal if appropriate
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
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

  // Fetch the audio blob and update the audio element source
  useEffect(() => {
    fetch(note.recordingUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const localUrl = URL.createObjectURL(blob);
        audioElement.src = localUrl;
      })
      .catch((error) => console.error("Error fetching audio:", error));
  }, [note.recordingUrl, audioElement]);

  // Update progress percentage as the audio plays
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

  // Log audio duration when metadata is loaded (for debugging)
  useEffect(() => {
    const onLoadedMetadata = () => {
      console.log("Audio duration:", audioElement.duration);
    };
    audioElement.addEventListener("loadedmetadata", onLoadedMetadata);
    return () =>
      audioElement.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [audioElement]);

  // Toggle play/pause for the audio
  const togglePlay = () => {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handlers for title and transcript content changes
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  // Handle image upload for note attachments
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

  // Remove an image from the list
  const handleImageDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setIsDirty(true);
  };

  // Download the audio file
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

      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    } catch (error) {
      console.error("Error downloading audio:", error);
      setIsDownloading(false);
    }
  };

  // Toggle favorite state and update backend
  const handleFavoriteToggle = async () => {
    try {
      const newFavoriteState = !isFavorite;
      setFavoriteAnimate(true);

      const { data } = await api.patch(`/api/notes/${note._id}/favorite`, {
        favorite: newFavoriteState,
      });

      setIsFavorite(newFavoriteState);
      onUpdate(data.data);

      setTimeout(() => {
        setFavoriteAnimate(false);
      }, 1000);
    } catch (error) {
      setIsFavorite(!isFavorite);
      setFavoriteAnimate(false);
      console.error("Error toggling favorite:", error);
    }
  };

  // Format time in mm:ss for the audio player
  const formatTime = (time) => {
    if (!isFinite(time) || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Update note on backend if there are changes
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

  // Copy transcript content to clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
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
        {/* Header Section */}
        <Header
          isFullscreen={isFullscreen}
          toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isFavorite={isFavorite}
          handleFavoriteToggle={handleFavoriteToggle}
          onClose={onClose}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          title={title}
          handleTitleChange={handleTitleChange}
          noteDate={note.date}
          favoriteAnimate={favoriteAnimate}
        />

        {/* Audio Player Section */}
        {note.type === "audio" && (
          <AudioPlayer
            audioElement={audioElement}
            togglePlay={togglePlay}
            isPlaying={isPlaying}
            progress={progress}
            formatTime={formatTime}
            handleDownload={handleDownload}
            isDownloading={isDownloading}
          />
        )}

        {/* Tabs Navigation */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        {/* Content Section */}
        <div className="p-3 sm:p-4 h-[calc(100%-180px)] sm:h-[calc(100%-200px)] overflow-y-auto">
          {activeTab === "transcript" && (
            <>
              <TranscriptContent
                content={content}
                handleContentChange={handleContentChange}
                showFullContent={showFullContent}
                setShowFullContent={setShowFullContent}
                handleCopy={handleCopy}
                copied={copied}
              />
              <ImageUpload
                images={images}
                handleImageUpload={handleImageUpload}
                handleImageDelete={handleImageDelete}
              />
            </>
          )}
          {/* Update Note Button */}
          <div className="flex justify-end">
            <UpdateButton
              isDirty={isDirty}
              isUpdating={isUpdating}
              handleUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
