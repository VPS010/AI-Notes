import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotesList from "./NotesList";
import CreateNoteBar from "./CreateNoteBar";
import SearchBar from "./SearchBar";
import NoteModal from "./NoteModal";
import api from "../context/api";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredNotesList, setFilteredNotesList] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get("/api/notes");
        const processedNotes = data.data.map((note) => {
          const createdAtDate = new Date(note.createdAt);
          return {
            ...note,
            type: note.recordingUrl ? "audio" : "text",
            isNew: createdAtDate.toDateString() === new Date().toDateString(),
            date: createdAtDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            duration: note.duration || "",
          };
        });

        setNotes(processedNotes);
      } catch (err) {
        setError("Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleSort = (newSortOrder) => {
    setSortOrder(newSortOrder);
    const sortedNotes = [...filteredNotesList].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return newSortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    setFilteredNotesList(sortedNotes);
  };

  const toggleFavorite = async (noteId) => {
    try {
      const noteToUpdate = notes.find((note) => note._id === noteId);
      const updatedNote = { ...noteToUpdate, favorite: !noteToUpdate.favorite };

      await api.patch(`/api/notes/${noteId}`, {
        favorite: updatedNote.favorite,
      });

      setNotes(notes.map((note) => (note._id === noteId ? updatedNote : note)));
    } catch (err) {
      console.error("Failed to update favorite status:", err);
    }
  };

  useEffect(() => {
    let filtered = notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (showFavorites) {
        return matchesSearch && note.favorite;
      }
      return matchesSearch;
    });

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotesList(filtered);
  }, [searchQuery, notes, sortOrder, showFavorites]);

  const processNote = async (note) => {
    const createdAtDate = new Date(note.createdAt);
    return {
      ...note,
      type: note.recordingUrl ? "audio" : "text",
      isNew: createdAtDate.toDateString() === new Date().toDateString(),
      date: createdAtDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      duration: note.duration || "",
    };
  };

  const handleCreateNote = async (newNote) => {
    try {
      const { data } = await api.post("/api/notes", newNote);
      const processedNote = await processNote(data.data);
      setNotes([...notes, processedNote]);
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdateNote = (updatedNote) => {
    setNotes(
      notes.map((note) => (note._id === updatedNote._id ? updatedNote : note))
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex h-screen">
      <Sidebar
        showFavorites={showFavorites}
        onFavoritesClick={() => setShowFavorites(!showFavorites)}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <SearchBar
          onSearch={setSearchQuery}
          onSort={handleSort}
          sortOrder={sortOrder}
        />
        <NotesList
          notes={filteredNotesList}
          onNoteClick={(note) => {
            setSelectedNote(note);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteNote}
          onFavoriteToggle={toggleFavorite}
        />
        <div className="mx-56 justify-center">
          <CreateNoteBar onCreateNote={handleCreateNote} />
        </div>
        {isModalOpen && (
          <NoteModal
            note={selectedNote}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedNote(null);
            }}
            onUpdate={handleUpdateNote}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
