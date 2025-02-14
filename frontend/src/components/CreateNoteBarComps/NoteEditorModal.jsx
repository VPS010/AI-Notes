// NoteEditorModal.js
import React from "react";
import { X, Image } from "lucide-react";

const NoteEditorModal = ({
  isEditorOpen,
  setIsEditorOpen,
  title,
  setTitle,
  text,
  setText,
  images,
  setImages,
  audioUrl,
  audioRef,
  isUploading,
  handleSubmit,
  handleImageUpload,
  renderBrowserWarning,
}) => {
  if (!isEditorOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) =>
        !isUploading && e.target === e.currentTarget && setIsEditorOpen(false)
      }
    >
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* Modal Header */}
        <div className="flex p-4 justify-between border-b">
          <button
            onClick={() => !isUploading && setIsEditorOpen(false)}
            className={`top-2 right-2 z-50 p-2 hover:bg-gray-100 rounded-full ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Close"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-3xl text-white ${
              isUploading ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={isUploading}
          >
            {isUploading ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {renderBrowserWarning && renderBrowserWarning()}
          <p className="m-1 text-gray-700 font-semibold">Title</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {audioUrl && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Recorded Audio
              </p>
              <audio
                ref={audioRef}
                controls
                src={audioUrl}
                className="w-full h-8 rounded-full shadow-md bg-gray-100 focus:outline-none focus:ring-2 hover:ring-blue-500 hover:bg-gray-200"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <p className="m-1 text-gray-700 font-semibold">Content</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the note Content / Transcribed text here"
              className="w-full h-48 p-3 border rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                <Image size={20} />
                <span>Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorModal;
