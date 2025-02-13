import React, { useState, useRef, useEffect } from "react";
import { Pencil, Image, Dot, Square, X, AlertCircle, Mic } from "lucide-react";

// Custom Alert Component
const Alert = ({ children, variant = "default" }) => {
  const bgColor = variant === "destructive" ? "bg-red-50" : "bg-blue-50";
  const borderColor =
    variant === "destructive" ? "border-red-200" : "border-blue-200";
  const textColor =
    variant === "destructive" ? "text-red-800" : "text-blue-800";

  return (
    <div
      className={`p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor} flex items-start gap-2`}
    >
      {children}
    </div>
  );
};

const AlertDescription = ({ children }) => (
  <div className="text-sm flex-1">{children}</div>
);

const CreateNoteBar = ({ onCreateNote }) => {
  // Modal & Note States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null); // audio Blob for backend
  const [audioUrl, setAudioUrl] = useState(null); // URL for playback

  // Recording & Timer States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(60);

  // Browser support flags
  const [supportsMedia, setSupportsMedia] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);

  // Refs for MediaRecorder, SpeechRecognition, and audio element
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const audioRef = useRef(null); // Ref for the audio element

  // Check for browser support on mount
  useEffect(() => {
    const mediaSupported = !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
    setSupportsMedia(mediaSupported);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupportsSpeech(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        let newFinal = "";
        let newInterim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            newFinal += transcript + " ";
          } else {
            newInterim += transcript;
          }
        }
        finalTranscriptRef.current += newFinal;
        interimTranscriptRef.current = newInterim;
        setText(finalTranscriptRef.current + interimTranscriptRef.current);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionInstance.onend = () => {
        // Final transcript is already captured
      };

      recognitionRef.current = recognitionInstance;
    }
  }, []);

  // Timer for recording (max 60 seconds)
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

  // Set the default volume to half whenever the audio element is rendered
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, [audioUrl]);

  // Start recording: initialize MediaRecorder and SpeechRecognition concurrently.
  const startRecording = async () => {
    if (!supportsMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }
    if (!supportsSpeech) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up MediaRecorder to capture the audio
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        // Create audio Blob and URL for playback
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedAudio(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        // Stop all tracks to release the mic
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Start SpeechRecognition to transcribe (it will run concurrently)
      if (recognitionRef.current) {
        // Reset any previous transcript
        finalTranscriptRef.current = "";
        interimTranscriptRef.current = "";
        setText("");
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setRecordingTimer(60);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording: stop both MediaRecorder and SpeechRecognition, then open the Create Note modal.
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    // Open the Create Note modal (which will show the audio and transcribed text)
    setIsEditorOpen(true);
  };

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...imageUrls]);
  };

  // Save the note (including text, images, and the recorded audio Blob)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || images.length > 0 || recordedAudio) {
      onCreateNote({
        content: text,
        images: images,
        audio: recordedAudio, // send audio Blob to backend
        type: "text",
      });
      // Clear states after saving
      setText("");
      setImages([]);
      setRecordedAudio(null);
      setAudioUrl(null);
      setIsEditorOpen(false);
    }
  };

  // Render a warning if the browser doesn't support recording features
  const renderBrowserWarning = () => {
    if (!supportsMedia || !supportsSpeech) {
      const missingFeatures = [];
      if (!supportsMedia) missingFeatures.push("Audio Recording");
      if (!supportsSpeech) missingFeatures.push("Speech Recognition");
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <AlertDescription>
            Your browser doesn't support: {missingFeatures.join(" and ")}.
            Please use a modern browser.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <>
      {/* Create Note Modal */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            // If the click is on the overlay (not the modal content), close the modal
            if (e.target === e.currentTarget) {
              setIsEditorOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex p-4 justify-between border-b">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="top-2 right-2 z-50 p-2 hover:bg-gray-100 rounded-full"
                title="Close"
              >
                <X size={20} />
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-gray-500 rounded-3xl text-white hover:bg-gray-600"
              >
                Save
              </button>
            </div>
            <div className="p-4">
              {renderBrowserWarning()}

              {/* Styled Recorded Audio Container */}
              {audioUrl && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Recorded Audio
                  </p>
                  <audio
                    ref={audioRef} // Attach the ref here
                    controls
                    src={audioUrl}
                    className="w-full h-8 rounded-full shadow-md bg-gray-100 focus:outline-none focus:ring-2 hover:ring-blue-500 hover:bg-gray-200"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Edit the transcribed text here..."
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

                <div className="flex justify-end gap-2"></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bottom-0 rounded-full shadow-sm shadow-gray-500 my-4 py-1 left-0 right-0 bg-white border-t border-gray-200 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          <div className="flex-1 flex items-center gap-4 bg-white rounded-lg px-4 py-2">
            {/* Manual note creation */}
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Pencil className="text-gray-600" size={20} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Image className="text-gray-600" size={20} />
            </button>
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2">
              <Mic className="text-red-500 h-6 w-6 animate-pulse" />
              <span className="text-red-500">
                {Math.floor(recordingTimer / 60)}:
                {(recordingTimer % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-1 ${
              !supportsMedia || !supportsSpeech
                ? "bg-gray-400 cursor-not-allowed"
                : isRecording
                ? "bg-gray-500"
                : "bg-red-500"
            } text-white flex rounded-full justify-center items-center`}
            disabled={!supportsMedia || !supportsSpeech}
          >
            {isRecording ? (
              <Square className="text-white h-8 w-8" />
            ) : (
              <Dot className="text-white h-8 w-8" />
            )}
            <span className="text-md font-medium ml-2">
              {isRecording ? "Stop Recording" : "Start Recording"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateNoteBar;
