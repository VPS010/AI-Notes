import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotesList from "./NotesList";
import CreateNoteBar from "./CreateNoteBar";
import SearchBar from "./SearchBar";
import NoteModal from "./NoteModal";

const Dashboard = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      isNew: true,
      type: "audio",
      date: "Jan 30, 2025",
      title: "Engineering Assignment Audio",
      content:
        "I'm recording an audio to transcribe into text for the assignment of...",
      duration: "00:09",
      images: ["inage1","img3"],
    },
    {
      id: 2,
      isNew: false,
      type: "text",
      date: "Feb 02, 2025",
      title: "Meeting Notes - Project DineBuddy",
      content:
        "Discussion about restaurant dashboard improvements and chatbot integration...",
      images: [],
    },
    {
      id: 3,
      isNew: true,
      date: "Feb 05, 2025",
      type: "audio",
      title: "Lecture Recording - AI Chatbots",
      content:
        "Key points on AI-based recommendations and NLP for chatbot interactions...",
      duration: "00:22",
      images: ["inage1", "ing2","ing4", "img3"],
    },
    {
      id: 4,
      isNew: false,
      type: "text",
      date: "Feb 07, 2025",
      title: "Brainstorming Ideas for Airflick UI",
      content:
        "Notes on improving UI with animations, interactive elements, and SVGs...",
      images: ["inage1", "ing2", "img3"],
    },
    {
      id: 5,
      isNew: true,
      type: "text",
      date: "Feb 10, 2025",
      title: "YearGoals Feature Planning",
      content:
        "Considering user engagement strategies, new goal-sharing features...",
      images: ["inage1", "ing2", "img3"],
    },
    {
      id: 6,
      isNew: false,
      date: "Feb 12, 2025",
      type: "audio",
      title: "Client Discussion - Software Needs",
      content:
        "Talked with a client about custom software requirements for their business...",
      duration: "00:25",
      images: ["inage1", "ing2", "img3"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Move filteredNotes inside useEffect to avoid recreation on every render
  const [filteredNotesList, setFilteredNotesList] = useState(notes);

  useEffect(() => {
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotesList(filtered);
  }, [searchQuery, notes]); // Add proper dependencies

  const handleCreateNote = (newNote) => {
    setNotes([...notes, { ...newNote, id: Date.now(), createdAt: new Date() }]);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleUpdateNote = (updatedNote) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        {" "}
        <SearchBar onSearch={setSearchQuery} />
        <NotesList
          notes={filteredNotesList}
          onNoteClick={(note) => {
            setSelectedNote(note);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteNote}
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
