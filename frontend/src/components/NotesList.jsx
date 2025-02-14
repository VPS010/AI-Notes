import React from "react";
import NoteCard from "./NoteCard";

const NotesList = ({ notes, onNoteClick, onDelete }) => {
  // Add debug console log
  console.log("Current notes:", notes);

  if (!notes || notes.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-gray-500">No notes found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-0">
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onClick={() => onNoteClick(note)}
            onDelete={() => onDelete(note._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesList;
