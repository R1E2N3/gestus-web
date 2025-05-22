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

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<CustomVideoRecorder | null>(null); // Updated type
  const recordedVideoRef = useRef<Blob | null>(null);

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
    fetchRandomSign(); // Fetch sign initially

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        } else {
          setMessage("No camera devices found. Please connect a camera.");
        }
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
        setMessage("Failed to get camera devices. Please check permissions.");
      });

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start capturing video
  const startCapture = async () => {
    recordedVideoRef.current = null; // Clear previous video
    setGameResult(null);
    setPredictions([]);

    try {
      // Ensure stream is active, or get it
      if (streamRef.current) {
        // Ensure existing stream is stopped before starting a new one if device changes
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: 640,
          height: 480,
        },
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true; // Ensure video is muted to prevent feedback if audio is on
        await videoRef.current.play();
      } else {
        setMessage("Video element or stream not available.");
        return;
      }

      // Initialize the video recorder
      // Ensure streamRef.current is not null before passing to createVideoRecorder
      if (!streamRef.current) {
        setMessage("Failed to get media stream.");
        return;
      }
      videoRecorderRef.current = createVideoRecorder(streamRef.current);

      videoRecorderRef.current.start();
      setIsCapturing(true);
      setMessage(
        `Recording sign "${currentSign}"... Press Stop Recording when done.`
      );
    } catch (error) {
      console.error("Error starting video capture:", error);
      setMessage(
        `Failed to start capturing: ${
          (error as Error).message
        }. Please check camera permissions.`
      );
      setIsCapturing(false);
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
        streamRef.current = null;
      }
    }
  };

  // Stop capturing
  const stopCapture = async () => {
    if (videoRecorderRef.current) {
      try {
        const videoBlob = await videoRecorderRef.current.stop();
        recordedVideoRef.current = videoBlob;
        setMessage(
          "Video gravado! Clique em 'Verificar Meu Sinal' para processar."
        );
        setIsCapturing(false);

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop()); // Explicitly type track
          streamRef.current = null;
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
      stopCapture();
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
    setMessage("Processing video... This may take a moment.");
    setPredictions([]);
    setGameResult(null);

    try {
      const formData = createVideoFormData(
        recordedVideoRef.current,
        "video.webm"
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
        const topPrediction = data.predictions[0].sign;
        if (topPrediction.toLowerCase() === currentSign.toLowerCase()) {
          setGameResult("correct");
          setMessage("Correct! Well done!");
        } else {
          setGameResult("incorrect");
          setMessage(
            `Not quite! The model detected "${topPrediction}" instead of "${currentSign}".`
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
    }
  };

  // Start over with a new sign
  const startOver = () => {
    setPredictions([]);
    setGameResult(null);
    recordedVideoRef.current = null;

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
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Reset video element
    }
    setIsCapturing(false);
    setIsSubmitting(false);
    fetchRandomSign();
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
                </h3>
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
                    <span>Press "Stop Recording" when you're done.</span>
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
                  <h2 className="text-xl text-gray-500 mb-2">Please sign:</h2>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">
                    {currentSign}
                  </h1>
                  <button
                    onClick={handleSkipSign}
                    className="mt-4 text-sm text-[#009fe3] hover:underline"
                    disabled={isLoadingSign || isCapturing || isSubmitting}
                  >
                    {isLoadingSign ? "Loading..." : "Skip this sign"}
                  </button>
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
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
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
                <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-[#009fe3]/30 bg-[#f0f9ff] flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    style={{
                      // Show if capturing (live feed) or if no recorded video yet (to show placeholder)
                      display:
                        isCapturing ||
                        (!recordedVideoRef.current && !isSubmitting)
                          ? "block"
                          : "none",
                    }}
                  />

                  {isCapturing && (
                    <div className="absolute top-4 right-4 flex items-center z-20">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" />
                      <span className="text-red-500 font-medium">REC</span>
                    </div>
                  )}

                  {/* Placeholder when not capturing, no video recorded, and not submitting */}
                  {!isCapturing &&
                    !recordedVideoRef.current &&
                    !isSubmitting &&
                    !streamRef.current && (
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

                  {/* Message when video is recorded and ready for submission */}
                  {recordedVideoRef.current &&
                    !isCapturing &&
                    !isSubmitting && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center z-20 px-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-green-400 mb-4"
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
                        <p className="text-xl font-semibold mb-2">
                          Recording Complete!
                        </p>
                        <p className="text-sm mb-4">
                          Video captured. Click "Check My Sign" to submit.
                        </p>
                        {/* Add null check for recordedVideoRef.current before accessing size */}
                        {recordedVideoRef.current && (
                          <p className="text-xs text-gray-300">
                            Size:{" "}
                            {(
                              recordedVideoRef.current.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </motion.div>

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
                    ? "Stop Recording"
                    : recordedVideoRef.current
                    ? "Record Again"
                    : "Start Recording"}
                </motion.button>{" "}
                {recordedVideoRef.current && !isCapturing && (
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
        </div>
      </main>

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
