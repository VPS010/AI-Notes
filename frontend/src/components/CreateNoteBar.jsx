// CreateNoteBar.js
import React, { useState, useRef, useEffect } from "react";
import api from "../context/api";
import NoteEditorModal from "./CreateNoteBarComps/NoteEditorModal";
import RecordingControls from "./CreateNoteBarComps/RecordingControls";
import { Alert, AlertDescription } from "./CreateNoteBarComps/Alert";
import { AlertCircle } from "lucide-react";

const CreateNoteBar = ({ onCreateNote }) => {
  // State variables for the editor modal and note content.
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null); // audio Blob for backend
  const [audioUrl, setAudioUrl] = useState(null); // URL for playback
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState("0:00");

  // Recording and timer states.
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(60);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  // Browser support flags.
  const [supportsMedia, setSupportsMedia] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);

  // Refs for MediaRecorder, SpeechRecognition, and audio element.
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const audioRef = useRef(null);

  // Check for browser support for media and speech recognition.
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
        // Final transcript is already captured.
      };

      recognitionRef.current = recognitionInstance;
    }
  }, []);

  // Timer effect for recording (max 60 seconds).
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

  // Set default volume for the audio element when available.
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, [audioUrl]);

  //  Upload images and recorded audio to the server.

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

  /**
   * Start recording audio and transcribing speech.
   */
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

      const startTime = Date.now();
      setRecordingStartTime(startTime);

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
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

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

  /**
   * Stop recording and stop speech recognition.
   */
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

  /**
   * Handle form submission to save the note.
   *
   * @param {Event} e - Form submit event.
   */
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

      // Reset form fields.
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

  
  // Handle image file uploads.
    const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  /**
   * Render a browser warning if required features are not supported.
   *
   */
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
      <NoteEditorModal
        isEditorOpen={isEditorOpen}
        setIsEditorOpen={setIsEditorOpen}
        title={title}
        setTitle={setTitle}
        text={text}
        setText={setText}
        images={images}
        setImages={setImages}
        audioUrl={audioUrl}
        audioRef={audioRef}
        isUploading={isUploading}
        handleSubmit={handleSubmit}
        handleImageUpload={handleImageUpload}
        renderBrowserWarning={renderBrowserWarning}
      />

      <RecordingControls
        setIsEditorOpen={setIsEditorOpen}
        isRecording={isRecording}
        recordingTimer={recordingTimer}
        supportsMedia={supportsMedia}
        supportsSpeech={supportsSpeech}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
    </>
  );
};

export default CreateNoteBar;
