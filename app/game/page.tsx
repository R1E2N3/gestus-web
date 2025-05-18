"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PlayfulNav from "../components/PlayfulNav";

// Import MediaPipe types
import {
  initMediaPipe,
  extractLandmarks,
  drawLandmarks,
  extractPoseLandmarks,
  extractHandLandmarks,
  debugLandmarks,
} from "../utils/landmarkExtractor";

// Import MediaPipe dependencies for drawing
import {
  DrawingUtils,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

export default function GamePage() {
  // States for component
  const [isCapturing, setIsCapturing] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<number[][]>([]);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentPreviewFrame, setCurrentPreviewFrame] = useState(0);
  const [previewSpeed, setPreviewSpeed] = useState(60); // frames per second
  const [currentSign, setCurrentSign] = useState<string>("");
  const [isLoadingSign, setIsLoadingSign] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [gameResult, setGameResult] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [showCameraSelect, setShowCameraSelect] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previewAnimationRef = useRef<number | null>(null);
  const recordedLandmarksRef = useRef<number[][]>([]);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  // Fetch a random sign from the API
  const fetchRandomSign = async () => {
    try {
      setIsLoadingSign(true);
      const response = await fetch("/api/random-sign");
      if (!response.ok) {
        throw new Error("Failed to fetch random sign");
      }
      const data = await response.json();
      setCurrentSign(data.sign);
      setMessage(
        `Please perform the sign for "${data.sign}". Press Start when ready.`
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
    fetchRandomSign();
  };

  // Initialize MediaPipe and get camera devices when component mounts
  useEffect(() => {
    // Initialize MediaPipe
    setMessage("Loading MediaPipe models... Please wait.");

    initMediaPipe()
      .then(() => {
        console.log("MediaPipe initialized successfully");
        setMediapipeReady(true);

        // Fetch random sign after MediaPipe is initialized
        fetchRandomSign();
      })
      .catch((error) => {
        console.error("Error initializing MediaPipe:", error);
        setMessage(
          "Failed to initialize MediaPipe. Please try reloading the page."
        );
      });

    // Get available camera devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
        setMessage("Failed to get camera devices. Please check permissions.");
      });

    // Cleanup function for when component unmounts
    return () => {
      stopCapture();
      stopPreviewAnimation();
    };
  }, []);
  // Function to update the canvas with landmarks
  const updateCanvas = async () => {
    try {
      // Extract landmarks from current frame
      const landmarks = await extractLandmarks(videoRef.current);

      // Record landmarks if recording is active
      recordedLandmarksRef.current.push([...landmarks]);

      // Draw landmarks on canvas
      drawLandmarks(canvasRef.current);
    } catch (error) {
      console.error("Error extracting landmarks:", error);
    }

    // Continue the animation loop if still capturing
    animationFrameRef.current = requestAnimationFrame(updateCanvas);
  };

  // Start capturing video and extracting landmarks
  const startCapture = async () => {
    setRecordedFrames([]); // Clear previous frames
    setCurrentPreviewFrame(0); // Reset preview frame index
    try {
      if (!mediapipeReady) {
        setMessage("MediaPipe is not ready yet. Please wait.");
        return;
      }

      // Request permission to use selected camera
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: 640,
          height: 480,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();

        // Set canvas dimensions to match video
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }

        // Initialize preview canvas with same dimensions
        if (previewCanvasRef.current) {
          previewCanvasRef.current.width = videoRef.current.videoWidth;
          previewCanvasRef.current.height = videoRef.current.videoHeight;

          // Initialize drawing utils for preview
          const ctx = previewCanvasRef.current.getContext("2d");
          if (ctx) {
            drawingUtilsRef.current = new DrawingUtils(ctx);
          }
        }
      }

      // Start recording fresh
      recordedLandmarksRef.current = [];
      setIsRecording(true);
      setIsCapturing(true);
      setMessage(`Recording sign "${currentSign}"... Press Stop when done.`);

      // Start animation frame loop for drawing landmarks
      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    } catch (error) {
      console.error("Error starting video capture:", error);
      setMessage(
        "Failed to start capturing. Please check your camera permissions."
      );
    }
  };

  // Stop capturing
  const stopCapture = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsCapturing(false);

    // Stop recording and prepare for preview
    if (isRecording && recordedLandmarksRef.current.length > 0) {
      const frames = [...recordedLandmarksRef.current];
      setRecordedFrames(frames);
      setIsRecording(false);
      setMessage(`Recording complete! Captured ${frames.length} frames.`);
      // Start preview animation
      startPreviewAnimation(frames);
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

  useEffect(() => {
    stopPreviewAnimation(); // Stop any existing preview animation
    if (recordedFrames.length > 0) {
      startPreviewAnimation(recordedFrames);
    }
  }, [previewSpeed]);

  // Start preview animation of recorded landmarks
  const startPreviewAnimation = (frames: number[][]) => {
    if (!frames || frames.length === 0) return;

    setIsPreviewPlaying(true);

    let lastTimestamp = 0;
    let frameIndex = 0; // Use local variable instead of state for animation
    const currentSpeed = previewSpeed || 60; // Default to 60fps if speed is invalid

    const animate = (timestamp: number) => {
      // Always use the current speed value
      if (timestamp - lastTimestamp >= 1000 / currentSpeed) {
        // Ensure we're not exceeding array bounds
        if (frames.length > 0) {
          frameIndex = (frameIndex + 1) % frames.length; // Loop through frames
          setCurrentPreviewFrame(frameIndex); // Update state for UI

          // Draw the current frame on the preview canvas
          if (frames[frameIndex]) {
            drawPreviewFrame(frames[frameIndex]);
          }
        }

        lastTimestamp = timestamp;
      }

      // Continue animation loop if still playing
      previewAnimationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    previewAnimationRef.current = requestAnimationFrame(animate);
  };

  // Draw a specific frame on the preview canvas
  const drawPreviewFrame = (landmarksArray: number[]) => {
    const canvas = previewCanvasRef.current;

    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extract pose and hand landmarks
    const poseLandmarks = extractPoseLandmarks(landmarksArray);
    const handLandmarks = extractHandLandmarks(landmarksArray);

    drawingUtilsRef.current = new DrawingUtils(ctx);

    // Draw pose landmarks if available
    if (poseLandmarks.length > 0) {
      drawingUtilsRef.current.drawLandmarks(poseLandmarks, {
        radius: 3,
        color: "#FF0000",
      });
      drawingUtilsRef.current.drawConnectors(
        poseLandmarks,
        PoseLandmarker.POSE_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 2,
        }
      );
    }

    // Draw hand landmarks if available
    handLandmarks.forEach((handLms, i) => {
      const isLeftHand = i === 0;
      drawingUtilsRef.current?.drawLandmarks(handLms, {
        radius: 2,
        color: isLeftHand ? "#00FF00" : "#FF0000",
      });
      drawingUtilsRef.current?.drawConnectors(
        handLms,
        HandLandmarker.HAND_CONNECTIONS,
        {
          color: isLeftHand ? "#CC0000" : "#00CC00",
          lineWidth: 2,
        }
      );
    });
  };

  // Stop preview animation
  const stopPreviewAnimation = () => {
    if (previewAnimationRef.current) {
      cancelAnimationFrame(previewAnimationRef.current);
      previewAnimationRef.current = null;
    }
    setIsPreviewPlaying(false);
  };

  // Toggle preview animation
  const togglePreview = () => {
    if (isPreviewPlaying) {
      stopPreviewAnimation();
    } else if (recordedFrames.length > 0) {
      startPreviewAnimation(recordedFrames);
    }
  };

  // Submit landmarks to the API for processing
  const processLandmarks = async () => {
    if (!currentSign || recordedFrames.length === 0) {
      setMessage("No sign or landmarks to process");
      return;
    }

    setIsSubmitting(true);
    setMessage("Processing landmarks...");
    setPredictions([]);
    setGameResult(null);

    try {
      // Make sure each frame's landmarks are in the expected format
      // This is important for the API to process them correctly
      const processedFrames = recordedFrames.map((frame) => {
        // Each frame should already be in the proper format with:
        // - 33 pose landmarks (x,y,z) = 99 values
        // - 21 left hand landmarks (x,y,z) = 63 values
        // - 21 right hand landmarks (x,y,z) = 63 values
        // Total: 225 values

        // Ensure the frame has the right length - pad with zeros if needed
        const NUM_POSE_LANDMARKS = 33;
        const NUM_HAND_LANDMARKS = 21;
        const expectedLength =
          (NUM_POSE_LANDMARKS + 2 * NUM_HAND_LANDMARKS) * 3;

        if (frame.length !== expectedLength) {
          console.warn(
            `Frame has incorrect length: ${frame.length}, expected: ${expectedLength}`
          );
          // Create properly sized frame
          const properFrame = new Array(expectedLength).fill(0);
          // Copy available values
          for (let i = 0; i < Math.min(frame.length, expectedLength); i++) {
            properFrame[i] = frame[i];
          }
          return properFrame;
        }

        return frame;
      });

      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landmarks: processedFrames,
        }),
      });

      // Check for non-JSON responses first
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Server returned non-JSON response:", errorText);
        throw new Error(
          `Server error (${response.status}): The server returned an invalid response format`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error: ${response.status}`);
      }

      if (
        data.status === "success" &&
        data.predictions &&
        data.predictions.length > 0
      ) {
        setPredictions(data.predictions);

        // Compare top prediction with current sign
        const topPrediction = data.predictions[0].sign;
        if (topPrediction.toLowerCase() === currentSign.toLowerCase()) {
          setGameResult("correct");
          setMessage("Correct! Good job!");
        } else {
          setGameResult("incorrect");
          setMessage(
            `Not quite! The model detected "${topPrediction}" instead of "${currentSign}"`
          );
        }
      } else {
        setMessage("No clear predictions received. Try again!");
      }
    } catch (error) {
      console.error("Error processing landmarks:", error);
      setMessage(`Failed to process: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start over with a new sign
  const startOver = () => {
    // Reset states
    setPredictions([]);
    setGameResult(null);
    setRecordedFrames([]);
    setCurrentPreviewFrame(0);
    stopPreviewAnimation();

    // Fetch a new sign
    fetchRandomSign();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f9ff]">
      <PlayfulNav />
      <main className="container mx-auto px-4 pt-24 pb-10 max-w-5xl">
        <div className="flex flex-col items-center">
          {/* Page title */}
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
                      Press "Start Recording" and perform the sign shown above
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      2
                    </span>
                    <span>
                      Stop the recording when you're done to preview your sign
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      3
                    </span>
                    <span>
                      Click "Check My Sign" to see if our AI recognizes your
                      sign correctly
                    </span>
                  </li>
                </ul>
              </motion.div>

              {/* Current Sign Display */}
              {currentSign && (
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
                    disabled={isLoadingSign || isRecording}
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
                    disabled={isCapturing}
                  >
                    {devices.length === 0 && (
                      <option value="">No cameras found</option>
                    )}
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Camera ${device.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Video and canvas container */}
              <motion.div
                className="relative w-full max-w-2xl aspect-video mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-[#009fe3]/30 bg-[#f0f9ff] flex items-center justify-center overflow-hidden">
                  {recordedFrames.length === 0 ? (
                    <>
                      {/* Video element */}
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        muted
                        style={{
                          transform: "scaleX(-1)", // Mirror horizontally for more intuitive interaction
                          WebkitTransform: "scaleX(-1)",
                        }}
                      />

                      {/* Canvas for drawing landmarks */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full z-10"
                        style={{
                          transform: "scaleX(-1)", // Mirror horizontally to match video
                          WebkitTransform: "scaleX(-1)",
                        }}
                      />

                      {/* Recording indicator */}
                      {isCapturing && (
                        <div className="absolute top-4 right-4 flex items-center z-20">
                          <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" />
                          <span className="text-red-500 font-medium">REC</span>
                        </div>
                      )}

                      {/* Placeholder when not recording */}
                      {!isCapturing && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-center z-10">
                          {mediapipeReady && currentSign ? (
                            <div className="px-6">
                              <p className="text-lg font-semibold mb-2">
                                Ready to record:
                              </p>
                              <p className="text-3xl font-bold mb-4">
                                {currentSign}
                              </p>
                              <p className="text-sm">Click Start to begin</p>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Preview canvas for recorded landmarks */
                    <>
                      <canvas
                        ref={previewCanvasRef}
                        className="absolute inset-0 w-full h-full z-10"
                        style={{
                          transform: "scaleX(-1)", // Mirror horizontally for consistency
                          WebkitTransform: "scaleX(-1)",
                        }}
                      />
                      {!isPreviewPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-center z-20 px-6">
                          <div>
                            <p className="text-lg font-semibold mb-2">
                              Preview Ready
                            </p>
                            <p className="text-sm mb-4">
                              Click Play Preview to view your recording
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>

              {/* Frame counter and preview controls */}
              {recordedFrames.length > 0 && (
                <motion.div
                  className="w-full max-w-2xl mb-6 flex flex-col gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex gap-4 items-center">
                    {/* Play/Pause button */}
                    <motion.button
                      onClick={togglePreview}
                      className={`flex-1 py-3 px-4 rounded-full text-white font-medium ${
                        isPreviewPlaying
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPreviewPlaying ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pause Preview
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Play Preview
                        </span>
                      )}
                    </motion.button>

                    {/* Frame counter */}
                    <div className="bg-gray-100 rounded-lg px-4 py-3 text-center">
                      Frame: {currentPreviewFrame + 1} / {recordedFrames.length}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      Preview Speed:
                    </span>
                    <select
                      value={previewSpeed}
                      onChange={(e) => setPreviewSpeed(Number(e.target.value))}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="15">Slow (15fps)</option>
                      <option value="30">Medium (30fps)</option>
                      <option value="60">Fast (60fps)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Controls */}
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
                    !mediapipeReady || devices.length === 0 || !currentSign
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
                    : recordedFrames.length == 0
                    ? "Start Recording"
                    : "Record Again"}
                </motion.button>{" "}
                {recordedFrames.length > 0 && (
                  <motion.button
                    className="px-8 py-3 rounded-full font-bold text-white bg-[#ffd23f] hover:bg-[#f2c935] shadow-lg flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={processLandmarks}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.5 : 1 }}
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
                {/* DEBUG button - shows landmark information in console */}
                {recordedFrames.length > 0 && (
                  <motion.button
                    className="px-4 py-2 rounded-full font-medium bg-gray-200 hover:bg-gray-300 shadow-sm flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log("DEBUG: Landmark data");
                      console.log(`Total Frames: ${recordedFrames.length}`);

                      // Debug first, middle and last frames
                      if (recordedFrames.length > 0) {
                        const firstFrame = recordedFrames[0];
                        const middleFrame =
                          recordedFrames[Math.floor(recordedFrames.length / 2)];
                        const lastFrame =
                          recordedFrames[recordedFrames.length - 1];

                        console.log("First frame:");
                        debugLandmarks(firstFrame);

                        console.log("Middle frame:");
                        debugLandmarks(middleFrame);

                        console.log("Last frame:");
                        debugLandmarks(lastFrame);
                      }
                    }}
                  >
                    <span className="mr-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    Debug Data
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
