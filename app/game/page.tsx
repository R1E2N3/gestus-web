"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PlayfulNav from "../components/PlayfulNav";
import {
  createVideoRecorder,
  createVideoFormData,
} from "../utils/videoRecorder";

// Define the interface for the custom video recorder
interface CustomVideoRecorder {
  start: () => void;
  stop: () => Promise<Blob>; // Changed from void to Promise<Blob>
  ondataavailable?: (event: BlobEvent) => void;
  onerror?: (event: Event) => void;
  // Removed isRecording as it's not part of the actual implementation
}

export default function GamePage() {
  // States for component
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [currentSign, setCurrentSign] = useState<string>(""); // Restored
  const [isLoadingSign, setIsLoadingSign] = useState(false); // Restored
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [gameResult, setGameResult] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  const [countdown, setCountdown] = useState<number>(0); // Added for countdown timer
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [hasStream, setHasStream] = useState(false);
  // States for sample video functionality
  const [showSampleVideo, setShowSampleVideo] = useState(false);
  const [sampleVideoUrl, setSampleVideoUrl] = useState<string>("");
  const [isLoadingSampleVideo, setIsLoadingSampleVideo] = useState(false);
  const [sampleVideoError, setSampleVideoError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<CustomVideoRecorder | null>(null); // Updated type
  const recordedVideoRef = useRef<Blob | null>(null);
  const recordedVideoURLRef = useRef<string | null>(null);

  // Start camera stream without recording
  const startCameraStream = async (deviceId?: string) => {
    console.log("startCameraStream called with deviceId:", deviceId);
    try {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
        setHasStream(false);
      }

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: 640,
          height: 480,
        },
        audio: true,
      });
      streamRef.current = stream;
      setHasStream(true);
      console.log("Camera stream obtained:", stream);

      if (videoRef.current && streamRef.current) {
        console.log("Setting video source and playing...");
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        await videoRef.current.play();
        console.log("Video is now playing");
      }
    } catch (error) {
      console.error("Error starting camera stream:", error);
      setMessage(
        `Failed to start camera: ${
          (error as Error).message
        }. Please check camera permissions.`
      );
      setHasStream(false);
    }
  };

  // Fetch a random sign from the API
  const fetchRandomSign = async () => {
    try {
      setIsLoadingSign(true);
      setMessage("Loading a new sign...");
      const response = await fetch("/api/random-sign");
      if (!response.ok) {
        throw new Error("Failed to fetch random sign");
      }
      const data = await response.json();
      setCurrentSign(data.sign);
      setMessage(
        `Please perform the sign for "${data.sign}". Press Start Recording when ready.`
      );
    } catch (error) {
      console.error("Error fetching random sign:", error);
      setMessage("Failed to fetch a random sign. Please try again.");
    } finally {
      setIsLoadingSign(false);
    }
  };

  // Skip current sign and get a new one
  const handleSkipSign = () => {
    if (!isLoadingSign && !isCapturing) {
      fetchRandomSign();
    }
  };
  // Get camera devices when component mounts
  useEffect(() => {
    console.log("Component mounted, starting initialization...");
    fetchRandomSign(); // Fetch sign initially

    const initializeCamera = async () => {
      try {
        console.log("Getting media devices...");
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("Found video devices:", videoDevices);
        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
          console.log("Setting selected device and starting camera...");
          // Start camera stream immediately
          await startCameraStream(videoDevices[0].deviceId);
        } else {
          setMessage("No camera devices found. Please connect a camera.");
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
        setMessage("Failed to get camera devices. Please check permissions.");
      }
    };

    initializeCamera();
    return () => {
      // Cleanup: stop capture and release stream
      if (isCapturing && videoRecorderRef.current) {
        videoRecorderRef.current
          .stop()
          .catch((err) =>
            console.error("Error stopping recorder on unmount:", err)
          );
      }
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
        streamRef.current = null;
      }
      // Clean up video URL on unmount
      if (recordedVideoURLRef.current) {
        URL.revokeObjectURL(recordedVideoURLRef.current);
        recordedVideoURLRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer and recording duration constants
  const COUNTDOWN_SECONDS = 3;
  const RECORDING_SECONDS = 5; // Start capturing video
  const startCapture = async () => {
    recordedVideoRef.current = null; // Clear previous video
    setRecordingProgress(0); // Reset progress
    setGameResult(null);
    setPredictions([]);
    // Clean up previous URL to prevent memory leaks
    if (recordedVideoURLRef.current) {
      URL.revokeObjectURL(recordedVideoURLRef.current);
      recordedVideoURLRef.current = null;
    }

    try {
      // Ensure we have a camera stream
      if (!streamRef.current) {
        await startCameraStream(selectedDevice);
      }

      // Initialize the video recorder
      if (!streamRef.current) {
        setMessage("Failed to get media stream.");
        return;
      }
      videoRecorderRef.current = createVideoRecorder(streamRef.current);

      // Start countdown
      setCountdown(COUNTDOWN_SECONDS);
      setMessage(`Get ready! Recording in ${COUNTDOWN_SECONDS}...`);

      let count = COUNTDOWN_SECONDS;
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count > 0) {
          setMessage(`Get ready! Recording in ${count}...`);
        } else {
          clearInterval(countdownInterval);
          setMessage(
            `Recording sign "${currentSign}" for ${RECORDING_SECONDS} seconds...`
          );
          videoRecorderRef.current?.start();
          setIsCapturing(true);

          // Start recording progress animation
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 100 / (RECORDING_SECONDS * 10); // Update every 100ms
            setRecordingProgress(Math.min(progress, 100));
          }, 100);

          // Automatically stop recording after RECORDING_SECONDS
          setTimeout(() => {
            clearInterval(progressInterval);
            setRecordingProgress(100);
            stopCapture();
          }, RECORDING_SECONDS * 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Error starting video capture:", error);
      setMessage(
        `Failed to start capturing: ${
          (error as Error).message
        }. Please check camera permissions.`
      );
      setIsCapturing(false);
    }
  };
  // Stop capturing
  const stopCapture = async () => {
    if (videoRecorderRef.current) {
      try {
        const videoBlob = await videoRecorderRef.current.stop();
        recordedVideoRef.current = videoBlob;
        // Create URL for preview
        recordedVideoURLRef.current = URL.createObjectURL(videoBlob);
        setMessage(
          "Video gravado! Clique em 'Verificar Meu Sinal' para processar."
        );
        setIsCapturing(false);

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
          streamRef.current = null;
          setHasStream(false);
        }
        if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
          videoRef.current.srcObject = null;
        }
      } catch (error) {
        console.error("Error stopping video recording:", error);
        setMessage("Erro ao parar a gravação. Tente novamente.");
      }
    }
  };

  // Toggle capture state
  const toggleCapture = () => {
    if (isCapturing) {
      // This case should ideally not be reached if recording stops automatically
      stopCapture();
    } else if (countdown > 0) {
      // If countdown is in progress, do nothing or allow cancellation (optional)
      return;
    } else {
      startCapture();
    }
  };
  // Submit video to the API for processing
  const submitVideo = async () => {
    if (!currentSign || !recordedVideoRef.current) {
      setMessage("No sign or recorded video to process. Please record first.");
      return;
    }

    setIsSubmitting(true);
    setIsSubmittingModal(true);
    setMessage("Processing video... This may take a moment.");
    setPredictions([]);
    setGameResult(null);

    try {
      const formData = createVideoFormData(
        recordedVideoRef.current,
        "video.webm",
        { sign: currentSign }
      );

      const response = await fetch("/api/process-video", {
        // New endpoint
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Server returned non-JSON response:", errorText);
        throw new Error(
          `Server error (${response.status}): Invalid response format. Details: ${errorText}`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Error processing video: ${response.status}`
        );
      }

      if (
        data.status === "success" &&
        data.predictions &&
        data.predictions.length > 0
      ) {
        setPredictions(data.predictions);
        const topPrediction = data.predictions[0];
        if (topPrediction.recognized) {
          setGameResult("correct");
          setMessage(`Correct! Well done! You performed "${topPrediction.sign}" with ${(topPrediction.confidence * 100).toFixed(1)}% confidence.`);
        } else {
          setGameResult("incorrect");
          setMessage(
            `Not quite! The model detected "${topPrediction.sign}" with ${(topPrediction.confidence * 100).toFixed(1)}% confidence, but it wasn't recognized as the correct sign "${currentSign}".`
          );
        }
      } else {
        setMessage(
          data.message || "No clear predictions received. Please try again."
        );
      }
    } catch (error) {
      console.error("Error processing video:", error);
      setMessage(
        `Failed to process video: ${
          (error as Error).message || "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
      setIsSubmittingModal(false);
    }
  };
  // Start over with a new sign
  const startOver = () => {
    setPredictions([]);
    setGameResult(null);
    recordedVideoRef.current = null;
    // Clean up video URL
    if (recordedVideoURLRef.current) {
      URL.revokeObjectURL(recordedVideoURLRef.current);
      recordedVideoURLRef.current = null;
    }

    if (isCapturing && videoRecorderRef.current) {
      videoRecorderRef.current
        .stop()
        .catch((err) =>
          console.error("Error stopping recorder on startOver:", err)
        );
    }
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
      streamRef.current = null;
      setHasStream(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Reset video element
    }
    setIsCapturing(false);
    setIsSubmitting(false);
    fetchRandomSign();
  };

  // Fetch sample video for current sign
  const fetchSampleVideo = async () => {
    if (!currentSign) return;

    setIsLoadingSampleVideo(true);
    setSampleVideoError("");

    try {
      const response = await fetch(
        `/api/sample-video?sign=${encodeURIComponent(currentSign)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setSampleVideoError("No sample video available for this sign");
        } else {
          throw new Error("Failed to fetch sample video");
        }
        return;
      }

      const data = await response.json();
      setSampleVideoUrl(data.video_url);
      setShowSampleVideo(true);
    } catch (error) {
      console.error("Error fetching sample video:", error);
      setSampleVideoError("Failed to load sample video");
    } finally {
      setIsLoadingSampleVideo(false);
    }
  };

  // Close sample video modal
  const closeSampleVideo = () => {
    setShowSampleVideo(false);
    setSampleVideoUrl("");
    setSampleVideoError("");
  };

  // Play sample video
  const playSampleVideo = async (url: string) => {
    setSampleVideoUrl(url);
    setShowSampleVideo(true);
    setIsLoadingSampleVideo(true);
    setSampleVideoError("");

    try {
      // Preload the video to check for errors
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        setIsLoadingSampleVideo(false);
      };
      video.onerror = (e) => {
        console.error("Error loading sample video:", e);
        setSampleVideoError("Failed to load sample video. Please try again.");
        setIsLoadingSampleVideo(false);
      };
    } catch (error) {
      console.error("Error preparing sample video:", error);
      setSampleVideoError("Failed to prepare sample video. Please try again.");
      setIsLoadingSampleVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f9ff]">
      <PlayfulNav />
      <main className="container mx-auto px-4 pt-24 pb-10 max-w-5xl">
        <div className="flex flex-col items-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gestus{" "}
            <span className="bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
              Game
            </span>
          </motion.h1>

          {/* Game result display */}
          {gameResult && (
            <motion.div
              className={`bg-white rounded-2xl shadow-lg p-8 mb-8 w-full max-w-2xl text-center ${
                gameResult === "correct" ? "bg-green-50" : "bg-red-50"
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-6">
                {gameResult === "correct" ? "🎉" : "🤔"}
              </div>
              <h2 className="text-2xl font-bold mb-4 text-center">
                {gameResult === "correct" ? "Correct!" : "Try Again!"}
              </h2>

              {predictions.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Model Predictions:</h3>
                  <div className="flex flex-col items-center gap-2">
                    {predictions.map((pred, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg ${
                          idx === 0
                            ? "bg-white font-bold shadow-sm"
                            : "bg-white/50"
                        }`}
                      >
                        {pred.sign} ({(pred.confidence * 100).toFixed(1)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                onClick={startOver}
                className="px-8 py-3 mt-6 rounded-full font-bold text-white bg-[#009fe3] hover:bg-[#0084bd] shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Another Sign
              </motion.button>
            </motion.div>
          )}

          {!gameResult && (
            <>
              {/* How it works section */}
              <motion.div
                className="mb-8 bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-[#009fe3]/20 text-[#009fe3] flex items-center justify-center mr-3">
                    💡
                  </span>
                  How to Play
                </h3>{" "}
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      1
                    </span>
                    <span>
                      Press "Start Recording" and perform the sign shown.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      2
                    </span>
                    <span>
                      The recording will automatically stop after 5 seconds.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      3
                    </span>
                    <span>
                      Click "Check My Sign" to send the video for analysis.
                    </span>
                  </li>
                </ul>
              </motion.div>

              {/* Current Sign Display */}
              {currentSign && !isLoadingSign && (
                <motion.div
                  className="bg-white rounded-2xl shadow-lg p-6 mb-8 w-full max-w-2xl text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {" "}
                  <h2 className="text-xl text-gray-500 mb-2">
                    Please sign:
                  </h2>{" "}
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
                    {currentSign}
                  </h1>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center items-center">
                    <button
                      onClick={fetchSampleVideo}
                      className="px-4 py-2 text-sm bg-[#009fe3] text-white rounded-lg hover:bg-[#0084bd] flex items-center disabled:opacity-50"
                      disabled={
                        isLoadingSign ||
                        isCapturing ||
                        isSubmitting ||
                        isLoadingSampleVideo
                      }
                    >
                      {isLoadingSampleVideo ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                            ></path>
                          </svg>
                          View Sample
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSkipSign}
                      className="text-sm text-[#009fe3] hover:underline"
                      disabled={isLoadingSign || isCapturing || isSubmitting}
                    >
                      {isLoadingSign ? "Loading..." : "Skip this sign"}
                    </button>
                  </div>
                  {sampleVideoError && (
                    <p className="mt-2 text-sm text-orange-600">
                      {sampleVideoError}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Message display */}
              {message && (
                <motion.div
                  className="mb-6 p-4 rounded-lg bg-[#009fe3]/10 text-center w-full max-w-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[#009fe3]">{message}</p>
                </motion.div>
              )}

              {/* Camera selection button */}
              <motion.div
                className="mb-4 w-full max-w-2xl flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <button
                  className="text-sm text-[#009fe3] flex items-center"
                  onClick={() => setShowCameraSelect(!showCameraSelect)}
                  disabled={isCapturing || isSubmitting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {showCameraSelect ? "Hide Camera Options" : "Change Camera"}
                </button>
              </motion.div>

              {/* Camera selector */}
              {showCameraSelect && (
                <motion.div
                  className="mb-6 p-4 bg-white rounded-xl shadow-md w-full max-w-2xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Camera:
                  </label>{" "}
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                    value={selectedDevice}
                    onChange={async (e) => {
                      setSelectedDevice(e.target.value);
                      if (!isCapturing && !recordedVideoRef.current) {
                        await startCameraStream(e.target.value);
                      }
                    }}
                    disabled={isCapturing || isSubmitting}
                  >
                    {devices.length === 0 && (
                      <option value="">No cameras found</option>
                    )}
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Camera ${device.deviceId.slice(0, 10)}...`}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              <motion.div
                className="relative w-full max-w-2xl aspect-video mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {" "}
                <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-[#009fe3]/30 bg-[#f0f9ff] flex items-center justify-center overflow-hidden">
                  {!recordedVideoRef.current ? (
                    <>
                      {/* Video element - always show when stream is available */}
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        style={{
                          display: hasStream ? "block" : "none",
                        }}
                      />

                      {/* Countdown overlay in video div */}
                      {countdown > 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                          <div className="text-center text-white">
                            <div className="text-8xl font-bold mb-2">
                              {countdown}
                            </div>
                            <div className="text-xl">Get ready...</div>
                          </div>
                        </div>
                      )}

                      {/* Recording indicator and progress bar */}
                      {isCapturing && (
                        <>
                          <div className="absolute top-4 right-4 flex items-center z-20">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" />
                            <span className="text-red-500 font-medium">
                              REC
                            </span>
                          </div>{" "}
                          {/* Recording progress bar */}
                          <div className="absolute bottom-4 left-4 right-4 z-20">
                            <div className="bg-black/50 rounded-full p-2">
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 transition-all duration-100 ease-out"
                                  style={{ width: `${recordingProgress}%` }}
                                />
                              </div>
                              <p className="text-white text-center text-sm mt-2">
                                Recording:{" "}
                                {Math.floor(
                                  (recordingProgress / 100) * RECORDING_SECONDS
                                )}
                                s / {RECORDING_SECONDS}s
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Placeholder when no stream available */}
                      {!hasStream && !isSubmitting && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-center z-10 p-4">
                          {isLoadingSign && <p>Loading sign...</p>}
                          {!isLoadingSign && currentSign && (
                            <div>
                              <p className="text-lg font-semibold mb-2">
                                Ready to record:
                              </p>
                              <p className="text-3xl font-bold mb-4">
                                {currentSign}
                              </p>
                              <p className="text-sm">Click Start Recording</p>
                            </div>
                          )}
                          {!isLoadingSign &&
                            !currentSign &&
                            devices.length > 0 && (
                              <p>Select a sign or wait for one to load.</p>
                            )}
                          {devices.length === 0 && !isLoadingSign && (
                            <p>No camera found. Please connect a camera.</p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Video recorded successfully - show preview */
                    <video
                      src={recordedVideoURLRef.current || undefined}
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                      muted
                      style={{
                        // Hide volume controls using CSS
                        WebkitAppearance: "none",
                      }}
                      onLoadedMetadata={(e) => {
                        // Ensure video stays muted
                        e.currentTarget.muted = true;
                        e.currentTarget.volume = 0;
                      }}
                    />
                  )}

                  {/* Recording complete overlay */}
                  {recordedVideoRef.current && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium z-20 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Recorded
                    </div>
                  )}
                </div>{" "}
              </motion.div>

              {/* Video info when recorded */}
              {recordedVideoRef.current && (
                <motion.div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl w-full max-w-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-600 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-green-800 font-medium">
                        Video Preview
                      </span>
                    </div>
                    <span className="text-green-600 text-sm">
                      {recordedVideoRef.current &&
                        `${(
                          recordedVideoRef.current.size /
                          1024 /
                          1024
                        ).toFixed(2)} MB`}
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Review your sign above. If it looks good, click "Check My
                    Sign" to analyze it.
                  </p>
                </motion.div>
              )}

              <motion.div
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.button
                  className={`px-8 py-3 rounded-full font-bold text-white shadow-lg flex items-center ${
                    isCapturing
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-[#009fe3] hover:bg-[#0084bd]"
                  }`}
                  onClick={toggleCapture}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={
                    devices.length === 0 ||
                    !currentSign ||
                    isLoadingSign ||
                    isSubmitting
                  }
                >
                  <span className="mr-2">
                    {isCapturing ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="8"
                          height="8"
                          fill="currentColor"
                        />
                      </svg>
                    ) : countdown > 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 animate-spin" // Simple spin animation for countdown
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zM10 15a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <circle cx="10" cy="10" r="6" fill="currentColor" />
                      </svg>
                    )}
                  </span>
                  {isCapturing
                    ? "Recording..."
                    : countdown > 0
                    ? `Starting in ${countdown}...`
                    : recordedVideoRef.current
                    ? "Record Again"
                    : "Start Recording"}
                </motion.button>{" "}
                {recordedVideoRef.current && !isCapturing && !isSubmitting && (
                  <motion.button
                    className="px-8 py-3 rounded-full font-bold text-white bg-[#ffd23f] hover:bg-[#f2c935] shadow-lg flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitVideo}
                    disabled={isSubmitting || isCapturing}
                    style={{ opacity: isSubmitting || isCapturing ? 0.5 : 1 }}
                  >
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    {isSubmitting ? "Processing..." : "Check My Sign"}
                  </motion.button>
                )}
              </motion.div>
            </>
          )}
        </div>{" "}
      </main>

      {/* Submission Loading Modal */}
      {isSubmittingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              {/* Animated loading spinner */}
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-[#009fe3]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#009fe3] rounded-full border-t-transparent animate-spin"></div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Analyzing Your Sign
              </h3>
              <p className="text-gray-600">
                Please wait while our AI analyzes your sign. This may take a few
                moments...
              </p>
            </div>

            {/* Progress indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-center text-sm text-[#009fe3]">
                <div className="w-4 h-4 mr-2 border-2 border-[#009fe3] border-t-transparent rounded-full animate-spin"></div>
                Processing gestures...
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sample Video Modal */}
      {showSampleVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Sample Video:{" "}
                <span className="text-[#009fe3]">{currentSign}</span>
              </h2>
              <button
                onClick={closeSampleVideo}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {sampleVideoUrl ? (
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <video
                      src={sampleVideoUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        // Auto-play the sample video when loaded
                        e.currentTarget.play().catch(console.error);
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      This is how to perform the sign for "
                      <strong>{currentSign}</strong>". Watch carefully and try
                      to replicate the movement when recording your own version.
                    </p>
                    <button
                      onClick={closeSampleVideo}
                      className="px-6 py-2 bg-[#009fe3] text-white rounded-lg hover:bg-[#0084bd] transition-colors"
                    >
                      Got it, let's play!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-4 h-4 border-2 border-[#009fe3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading sample video...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {/* Colorful circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#009fe3]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffd23f]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-[#7ed957]/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
