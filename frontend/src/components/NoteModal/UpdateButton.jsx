// UpdateButton.js
import React from "react";

/**
 * Props:
 * - isDirty: boolean indicating if there are unsaved changes.
 * - isUpdating: boolean for update progress.
 * - handleUpdate: function to update the note.
 */
const UpdateButton = ({ isDirty, isUpdating, handleUpdate }) => {
  return (
    isDirty && (
      <div className="m-2 sm:m-4 left-auto right-4">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {isUpdating ? "Updating..." : "Update Note"}
        </button>
      </div>
    )
  );
};

export default UpdateButton;
