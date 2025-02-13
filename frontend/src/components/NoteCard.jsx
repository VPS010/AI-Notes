import React from "react";
import {
  MoreHorizontal,
  Copy,
  Plus,
  Images,
  FileText,
  Play,
} from "lucide-react";

const NoteCard = ({ note, onClick }) => {
  if (!note) return null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 space-y-3 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
    >
      {/* Header with NEW tag, date and type indicator */}
      <div className="flex items-center gap-2">
        {note.isNew && (
          <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            NEW
          </span>
        )}
        <span className="text-gray-400 text-sm">{note.date}</span>
        <div className="ml-auto flex items-center gap-2">
          {note.type === "text" ? (
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Text</span>
            </div>
          ) : note.type === "audio" ? (
            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full text-gray-600">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">{note.duration}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>

      {/* Content */}
      <p className="text-gray-500 text-base line-clamp-2">{note.content}</p>

      {/* Image Count Indicator */}
      {note.images.length > 0 && (
        <div className="flex items-center">
          <div className="flex items-center py-1 gap-1 bg-gray-100 px-2 rounded-full text-gray-700">
            <Images className="w-4 h-4" />
            <span className="text-sm">
              {note.images.length} Image{note.imageCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-50 rounded-lg">
            <Copy className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-lg">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-lg">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
