import React, { useState } from "react";
import {
  MoreHorizontal,
  Copy,
  Plus,
  Images,
  FileText,
  Play,
  Trash2,
  Check,
} from "lucide-react";

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <p className="text-gray-800 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const NoteCard = ({ note, onClick, onDelete }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleCopy = async (e) => {
    e.stopPropagation();

    // Combine all content into a single string
    const contentToCopy = `${note.title}\n\n${note.content}`;

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(note._id);
    setShowConfirmDialog(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="bg-white rounded-2xl p-4 flex flex-col min-h-[200px] hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
      >
        {/* Content wrapper */}
        <div className="flex-grow space-y-3">
          {/* Header with NEW tag, date and type indicator */}
          <div className="flex items-center gap-2">
            {note.isNew && (
              <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                NEW
              </span>
            )}
            <span className="text-gray-400 text-sm">{note.date}</span>
            <div className="ml-auto flex items-center gap-2">
              {note.type === "audio" ? (
                <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">{note.duration}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Text</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>

          {/* Content */}
          <p className="text-gray-500 text-base line-clamp-2">{note.content}</p>

          {/* Image Count Indicator */}
          {note.images?.length > 0 && (
            <div className="flex items-center">
              <div className="flex items-center py-1 gap-1 bg-gray-100 px-2 rounded-full text-gray-700">
                <Images className="w-4 h-4" />
                <span className="text-sm">
                  {note.images.length} Image{note.images.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Now positioned at bottom */}
        <div className="flex items-center justify-end mt-auto pt-4">
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-50 rounded-lg group relative"
              onClick={handleCopy}
            >
              <div
                className={`transform transition-all duration-200 ${
                  copied ? "scale-0" : "scale-100"
                }`}
              >
                <Copy className="w-5 h-5 text-gray-600" />
              </div>
              <div
                className={`absolute inset-0 flex items-center justify-center transform transition-all duration-200 ${
                  copied ? "scale-100" : "scale-0"
                }`}
              >
                <Check className="w-5 h-5 text-green-500" />
              </div>
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
            <button
              className="p-2 hover:bg-gray-50 rounded-lg group relative"
              onClick={handleDelete}
            >
              <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-500" />
              <div>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {"delete"}
                </span>
              </div>
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Are you sure you want to delete this note? This action cannot be undone."
      />
    </>
  );
};

export default NoteCard;
