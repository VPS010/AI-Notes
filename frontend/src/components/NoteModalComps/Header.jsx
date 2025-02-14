// Header.js
import React from "react";
import { X, Maximize2, Star, Pencil } from "lucide-react";

/**
 * Props:
 * - isFullscreen: boolean for fullscreen state.
 * - toggleFullscreen: function to toggle fullscreen.
 * - isFavorite: boolean for favorite state.
 * - handleFavoriteToggle: function to toggle favorite.
 * - onClose: function to close the modal.
 * - isEditing: boolean for editing mode.
 * - setIsEditing: function to set editing mode.
 * - title: current note title.
 * - handleTitleChange: function to update the title.
 * - noteDate: date string of the note.
 * - favoriteAnimate: boolean for favorite animation.
 */

const Header = ({
  isFullscreen,
  toggleFullscreen,
  isFavorite,
  handleFavoriteToggle,
  onClose,
  isEditing,
  setIsEditing,
  title,
  handleTitleChange,
  noteDate,
  favoriteAnimate,
}) => {
  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
      <div className="flex justify-between">
        <div>
          <button
            onClick={toggleFullscreen}
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
                ${isFavorite ? "text-yellow-400 fill-current" : "text-gray-400"}
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
                if (e.key === "Enter") setIsEditing(false);
              }}
            />
          ) : (
            <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
          )}
          <button onClick={() => setIsEditing(true)} className="text-gray-600">
            <Pencil size={14} />
          </button>
        </div>
        <div>
          <span className="text-xs sm:text-sm text-gray-500">{noteDate}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
