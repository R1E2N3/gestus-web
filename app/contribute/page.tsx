"use client";

import { useState, useRef, useEffect } from "react";

// Import MediaPipe types
import {
  initMediaPipe,
  extractLandmarks,
  drawLandmarks,
} from "../utils/landmarkExtractor";

export default function ContributePage() {
  // States for component
  const [isCapturing, setIsCapturing] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    };
  }, []);

  // Function to update the canvas with landmarks
  const updateCanvas = async () => {
    try {
      // Extract landmarks from current frame
      console.log("Extracting landmarks...");
      const landmarks = await extractLandmarks(videoRef.current);

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
      }

      setIsCapturing(true);
      setMessage("MediaPipe is now processing your video...");

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
    setMessage("Video capture stopped.");
  };

  // Toggle capture state
  const toggleCapture = () => {
    if (isCapturing) {
      stopCapture();
    } else {
      startCapture();
    }
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
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-full">
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
      </div>
    </section>
  );
}
