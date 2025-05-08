"use client";

import { useState, useRef, useEffect } from "react";

// Import MediaPipe types
import {
  initMediaPipe,
  extractLandmarks,
  drawLandmarks,
} from "../utils/landmarkExtractor";

// Import MediaPipe dependencies for drawing
import {
  DrawingUtils,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { start } from "repl";

export default function ContributePage() {
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

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previewAnimationRef = useRef<number | null>(null);
  const recordedLandmarksRef = useRef<number[][]>([]);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  // Initialize MediaPipe and get camera devices when component mounts
  useEffect(() => {
    // Initialize MediaPipe
    setMessage("Loading MediaPipe models... Please wait.");

    initMediaPipe()
      .then(() => {
        console.log("MediaPipe initialized successfully");
        setMediapipeReady(true);
        setMessage("MediaPipe models loaded. You can now start the camera.");
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
      setMessage("Recording landmarks... Press Stop when done.");

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
      console.log("Recorded frames:", frames);
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
    console.log("Drawing preview frame", landmarksArray);
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

  // Extract pose landmarks from flat array
  const extractPoseLandmarks = (landmarks: number[]) => {
    const NUM_POSE_LANDMARKS = 33;
    const poseLandmarks = [];

    for (let i = 0; i < NUM_POSE_LANDMARKS; i++) {
      const offset = i * 3;

      // Check if this landmark has valid data
      if (
        landmarks[offset] !== 0 ||
        landmarks[offset + 1] !== 0 ||
        landmarks[offset + 2] !== 0
      ) {
        poseLandmarks.push({
          x: landmarks[offset] || 0,
          y: landmarks[offset + 1] || 0,
          z: landmarks[offset + 2] || 0,
        });
      }
    }

    return poseLandmarks;
  };

  // Extract hand landmarks from flat array
  const extractHandLandmarks = (landmarks: number[]) => {
    const NUM_POSE_LANDMARKS = 33;
    const NUM_HAND_LANDMARKS = 21;
    const hands = [];

    // Extract left hand landmarks
    const leftHandLandmarks = [];
    const leftHandStartOffset = NUM_POSE_LANDMARKS * 3;

    let hasLeftHand = false;
    for (let i = 0; i < NUM_HAND_LANDMARKS; i++) {
      const offset = leftHandStartOffset + i * 3;
      const x = landmarks[offset] || 0;
      const y = landmarks[offset + 1] || 0;
      const z = landmarks[offset + 2] || 0;

      if (x !== 0 || y !== 0 || z !== 0) {
        hasLeftHand = true;
      }

      leftHandLandmarks.push({ x, y, z });
    }

    // Extract right hand landmarks
    const rightHandLandmarks = [];
    const rightHandStartOffset = leftHandStartOffset + NUM_HAND_LANDMARKS * 3;

    let hasRightHand = false;
    for (let i = 0; i < NUM_HAND_LANDMARKS; i++) {
      const offset = rightHandStartOffset + i * 3;
      const x = landmarks[offset] || 0;
      const y = landmarks[offset + 1] || 0;
      const z = landmarks[offset + 2] || 0;

      if (x !== 0 || y !== 0 || z !== 0) {
        hasRightHand = true;
      }

      rightHandLandmarks.push({ x, y, z });
    }

    if (hasLeftHand) hands.push(leftHandLandmarks);
    if (hasRightHand) hands.push(rightHandLandmarks);

    return hands;
  };

  return (
    <section className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="bg-white/20 backdrop-blur-md border border-gray-200 rounded-xl p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-4">Camera Landmark Detection</h1>

        {/* Message display */}
        {message && (
          <div className="p-4 mb-4 bg-gray-100 text-gray-800 rounded-lg">
            {message}
          </div>
        )}

        {/* Camera selector */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Camera:</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isCapturing}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {devices.length === 0 && <option value="">No cameras found</option>}
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>

        {/* Start/Stop button */}
        <button
          onClick={toggleCapture}
          disabled={!mediapipeReady || devices.length === 0}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium mb-6 ${
            isCapturing
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isCapturing ? "Stop" : "Start"}
        </button>

        {/* Video and canvas container */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-full mb-6">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          {!isCapturing && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 text-white">
              {mediapipeReady ? "Press Start to begin" : "Loading MediaPipe..."}
            </div>
          )}
        </div>

        {/* Preview section - only visible when recording is done */}
        {recordedFrames.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recording Preview</h2>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-full mb-4">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full object-cover"
              />
              {!isPreviewPlaying && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 text-white">
                  Click Play to view recorded sequence
                </div>
              )}
            </div>

            <div className="flex gap-4 items-center">
              <button
                onClick={togglePreview}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
                  isPreviewPlaying
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isPreviewPlaying ? "Pause Preview" : "Play Preview"}
              </button>

              {/* Frame counter */}
              <div className="bg-gray-100 rounded-lg px-4 py-3 text-center">
                Frame: {currentPreviewFrame + 1} / {recordedFrames.length}
              </div>

              {/* Playback speed control */}
              <div className="flex flex-col gap-1">
                <label className="text-sm">Speed:</label>
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
