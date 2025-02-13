import React, { useState, useEffect } from "react";
import { Pencil, Image, Dot, X, Square } from "lucide-react";

const CreateNoteBar = ({ onCreateNote }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(60);

  useEffect(() => {
    // Initialize Web Speech API
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + " ";
          }
        }
        setText((prevText) => prevText + transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopRecording();
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording && recordingTimer > 0) {
      interval = setInterval(() => {
        setRecordingTimer((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTimer]);

  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
      setIsEditorOpen(true);
      setText("");
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      setRecordingTimer(60);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...imageUrls]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || images.length > 0) {
      onCreateNote({
        content: text,
        images: images,
        type: "text",
      });
      setText("");
      setImages([]);
      setIsEditorOpen(false);
    }
  };

  return (
    <>
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Transcript</h2>
              <div className="flex items-center gap-2">
                {isRecording && (
                  <span className="text-red-500">
                    {Math.floor(recordingTimer / 60)}:
                    {(recordingTimer % 60).toString().padStart(2, "0")}
                  </span>
                )}
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isRecording ? "Recording..." : "Write your note here..."
                }
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bottom-0 rounded-full shadow-sm shadow-gray-500 my-4 py-1 left-0 right-0 bg-white border-t border-gray-200 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <div className="flex-1 flex items-center gap-4 bg-white rounded-lg px-4 py-2">
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Pencil className="text-gray-600" size={20} />
            </button>
            <button type="button" className="p-2 rounded-lg hover:bg-gray-100">
              <Image className="text-gray-600" size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-1 ${
              isRecording ? "bg-gray-500" : "bg-red-500"
            } text-white hover:${
              isRecording ? "bg-gray-600" : "bg-red-600"
            } flex rounded-full justify-center items-center`}
          >
            {isRecording ? (
              <Square className="text-white h-8 w-8" />
            ) : (
              <Dot className="text-white h-8 w-8" />
            )}
            <span className="text-md font-medium">
              {isRecording ? "stop recording" : "start recording"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateNoteBar;
