import React, { useState, useRef, useEffect } from "react";
import { Pencil, Image, Dot, Square, X, AlertCircle, Mic } from "lucide-react";
import api from "../context/api";

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
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null); // audio Blob for backend
  const [audioUrl, setAudioUrl] = useState(null); // URL for playback
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState("0:00");

  // Recording & Timer States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(60);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

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

  const uploadFiles = async () => {
    const uploadedImages = [];
    let uploadedAudio = null;

    try {
      if (images.length > 0) {
        const imageUploads = images.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const { data } = await api.post("/api/upload/image", formData);
          return data.url;
        });
        uploadedImages.push(...(await Promise.all(imageUploads)));
      }

      if (recordedAudio) {
        const audioFormData = new FormData();
        audioFormData.append("audio", recordedAudio, "recording.webm");
        const { data } = await api.post("/api/upload/audio", audioFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedAudio = data.url;
      }

      return {
        images: uploadedImages,
        recordingUrl: uploadedAudio,
      };
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  };

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

  // Updated MediaRecorder setup with timestamp based duration calculation
  const startRecording = async () => {
    if (!supportsMedia || !supportsSpeech) {
      alert("Your browser does not support required features.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      // Capture start time in a local variable
      const startTime = Date.now();
      setRecordingStartTime(startTime); // Update state for UI if needed

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm;codecs=opus",
          });

          if (audioBlob.size === 0) {
            throw new Error("Empty audio recording");
          }

          setRecordedAudio(audioBlob);
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);

          // Calculate duration using the start timestamp and current time
          // Calculate duration using the local startTime
          const durationMs = Date.now() - startTime;
          const durationSeconds = Math.round(durationMs / 1000);
          const minutes = Math.floor(durationSeconds / 60);
          const seconds = durationSeconds % 60;
          setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        } catch (error) {
          console.error("Error processing recording:", error);
          setDuration("0:00");
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;

      if (recognitionRef.current) {
        finalTranscriptRef.current = "";
        interimTranscriptRef.current = "";
        setText("");
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setRecordingTimer(60);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Failed to start recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsEditorOpen(true);
  };

  // Save the note (including text, images, and the recorded audio Blob)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    setIsUploading(true);

    try {
      const { images: uploadedImages, recordingUrl } = await uploadFiles();

      let validatedDuration = duration;
      if (
        !duration ||
        duration.includes("Infinity") ||
        duration.includes("NaN")
      ) {
        validatedDuration = "0:00";
      }

      const newNote = {
        title,
        content: text,
        images: uploadedImages,
        recordingUrl,
        duration: validatedDuration,
        type:
          uploadedImages.length > 0 ? "image" : recordingUrl ? "audio" : "text",
      };

      await onCreateNote(newNote);

      // Reset form
      setTitle("");
      setText("");
      setImages([]);
      setRecordedAudio(null);
      setAudioUrl(null);
      setDuration("0:00");
      setIsEditorOpen(false);
    } catch (err) {
      console.error("Error creating note:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
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
          onClick={(e) =>
            !isUploading &&
            e.target === e.currentTarget &&
            setIsEditorOpen(false)
          }
        >
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex p-4 justify-between border-b">
              <button
                onClick={() => !isUploading && setIsEditorOpen(false)}
                className={`top-2 right-2 z-50 p-2 hover:bg-gray-100 rounded-full ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Close"
                disabled={isUploading}
              >
                <X size={20} />
              </button>

              <button
                onClick={handleSubmit}
                className={`px-5 py-2 rounded-3xl text-white ${
                  isUploading ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"
                }`}
                disabled={isUploading}
              >
                {isUploading ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="p-4">
              {renderBrowserWarning()}

              {/* Title Input */}
              <p className="m-1 text-gray-700 font-semibold"> Title</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Recorded Audio Container */}
              {audioUrl && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Recorded Audio
                  </p>
                  <audio
                    ref={audioRef}
                    controls
                    src={audioUrl}
                    className="w-full h-8 rounded-full shadow-md bg-gray-100 focus:outline-none focus:ring-2 hover:ring-blue-500 hover:bg-gray-200"
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4">
                <p className="m-1 text-gray-700 font-semibold">Content</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder=" Enter the note Content / Transcribed text here"
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
