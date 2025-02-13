import React, { useState, useEffect, useRef } from "react";
import { Trash2, Copy, Edit2, Search, Home, Star } from "lucide-react";

const AINotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mediaRecorderRef = useRef(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  // Initialize speech recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  const startRecording = () => {
    setIsRecording(true);
    recognition.start();

    // Start timer
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 60) {
          // 1 minute limit
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognition.stop();
    clearInterval(timerRef.current);
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    if (event.results[0].isFinal) {
      const newNote = {
        id: Date.now(),
        title: `Recording ${notes.length + 1}`,
        content: transcript,
        date: new Date().toLocaleString(),
        type: "audio",
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const addTextNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      content: "",
      date: new Date().toLocaleString(),
      type: "text",
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  const renameNote = (id, newTitle) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, title: newTitle } : note))
    );
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 p-4">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <span className="ml-2 text-lg font-semibold">AI Notes</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center p-2 bg-purple-50 rounded-lg text-purple-600">
            <Home size={20} />
            <span className="ml-2">Home</span>
          </div>
          <div className="flex items-center p-2 text-gray-600">
            <Star size={20} />
            <span className="ml-2">Favourites</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Search Bar */}
        <div className="mb-6 flex items-center bg-white rounded-lg border border-gray-200 p-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            className="ml-2 w-full outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{note.title}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => copyToClipboard(note.content)}>
                    <Copy size={16} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() =>
                      renameNote(
                        note.id,
                        prompt("Enter new title:", note.title)
                      )
                    }
                  >
                    <Edit2 size={16} className="text-gray-500" />
                  </button>
                  <button onClick={() => deleteNote(note.id)}>
                    <Trash2 size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{note.date}</p>
              <p className="text-gray-800">{note.content}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-6 right-6 flex space-x-2">
          <button
            onClick={addTextNote}
            className="p-3 bg-white border border-gray-200 rounded-full shadow-lg"
          >
            <Edit2 size={20} className="text-gray-600" />
          </button>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded-full shadow-lg flex items-center ${
              isRecording ? "bg-red-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AINotesApp;
