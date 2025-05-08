"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs/lib/anime.es.js";
import {
  initMediaPipe,
  extractLandmarks,
  drawLandmarks,
} from "../utils/landmarkExtractor";

export default function ContributePage() {
  // States for component
  const [recording, setRecording] = useState(false);
  const [currentSign, setCurrentSign] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info" | null;
  }>({ text: "", type: null });
  const [datasetStats, setDatasetStats] = useState<any>(null);

  // New states for preview and confirmation
  const [showPreview, setShowPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Reference to video element and canvas for landmark visualization
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarksRef = useRef<number[][]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // Animation effect when component mounts
  useEffect(() => {
    anime({
      targets: ".contribute-section h1, .contribute-section h2",
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(200),
      easing: "easeOutExpo",
    });

    // Initialize MediaPipe when component mounts
    setMessage({
      text: "Loading MediaPipe models... Please wait.",
      type: "info",
    });

    initMediaPipe()
      .then(() => {
        console.log("MediaPipe initialized successfully");
        setMediapipeReady(true);
        setMessage({
          text: "MediaPipe models loaded. You can now get a random sign and record.",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Error initializing MediaPipe:", error);
        setMessage({
          text: "Failed to initialize MediaPipe. Please try reloading the page.",
          type: "error",
        });
      });

    // Fetch dataset stats when component mounts
    fetchDatasetStats();

    // Cleanup function for when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    };
  }, []);

  // Function to update the canvas with landmarks
  const updateCanvas = () => {
    console.log("[CONTRIBUTE] Updating canvas with landmarks...");
    if (canvasRef.current) {
      console.log("[CONTRIBUTE] Drawing landmarks on canvas...");
      drawLandmarks(canvasRef.current);
    }

    // Continue the animation loop if recording
    if (recording) {
      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    }
  };

  // Function to draw landmarks on the preview canvas
  const drawLandmarksOnPreview = (frameIndex: number) => {
    if (!previewCanvasRef.current || landmarksRef.current.length === 0) return;

    const ctx = previewCanvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(
      0,
      0,
      previewCanvasRef.current.width,
      previewCanvasRef.current.height
    );

    // Get landmarks for the current frame
    const landmarks = landmarksRef.current[frameIndex];
    if (!landmarks) return;

    // Debug log to see what landmarks we're getting
    console.log(
      `Drawing frame ${frameIndex}/${landmarksRef.current.length}, landmarks:`,
      landmarks.slice(0, 10)
    );

    // Draw a simple stick figure using the landmarks
    const numPoseLandmarks = 33;
    const numHandLandmarks = 21;

    // Extract pose landmarks
    const poseLandmarks = [];
    for (let i = 0; i < numPoseLandmarks; i++) {
      poseLandmarks.push({
        x: landmarks[i * 3] * previewCanvasRef.current.width,
        y: landmarks[i * 3 + 1] * previewCanvasRef.current.height,
        z: landmarks[i * 3 + 2],
      });
    }

    // Extract left hand landmarks
    const leftHandLandmarks = [];
    for (let i = 0; i < numHandLandmarks; i++) {
      const offset = numPoseLandmarks * 3 + i * 3;
      leftHandLandmarks.push({
        x: landmarks[offset] * previewCanvasRef.current.width,
        y: landmarks[offset + 1] * previewCanvasRef.current.height,
        z: landmarks[offset + 2],
      });
    }

    // Extract right hand landmarks
    const rightHandLandmarks = [];
    for (let i = 0; i < numHandLandmarks; i++) {
      const offset = (numPoseLandmarks + numHandLandmarks) * 3 + i * 3;
      rightHandLandmarks.push({
        x: landmarks[offset],
        y: landmarks[offset + 1],
        z: landmarks[offset + 2],
      });
    }

    // Draw visualization background
    ctx.fillStyle = "#111";
    ctx.fillRect(
      0,
      0,
      previewCanvasRef.current.width,
      previewCanvasRef.current.height
    );

    // Draw body
    ctx.fillStyle = "#00FF00";
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    drawConnectedLandmarks(ctx, poseLandmarks);

    // Draw left hand
    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle = "#FF0000";
    drawConnectedLandmarks(ctx, leftHandLandmarks);

    // Draw right hand
    ctx.fillStyle = "#0000FF";
    ctx.strokeStyle = "#0000FF";
    drawConnectedLandmarks(ctx, rightHandLandmarks);

    // Add frame number indicator
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Frame: ${frameIndex + 1}/${landmarksRef.current.length}`,
      10,
      20
    );
  };

  // Helper function to draw connected landmarks
  const drawConnectedLandmarks = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[]
  ) => {
    if (!landmarks.length) return;

    // Draw points
    for (const landmark of landmarks) {
      if (landmark.x > 0 && landmark.y > 0) {
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw connections (simplified)
    ctx.beginPath();
    let firstValidPoint = true;
    for (const landmark of landmarks) {
      if (landmark.x > 0 && landmark.y > 0) {
        if (firstValidPoint) {
          ctx.moveTo(landmark.x, landmark.y);
          firstValidPoint = false;
        } else {
          ctx.lineTo(landmark.x, landmark.y);
        }
      }
    }
    ctx.stroke();
  };

  // Start playback of landmark animation
  const startPlayback = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    setIsPlaying(true);

    // Calculate interval based on playback speed (assuming 15fps original recording)
    const interval = Math.floor(66 / playbackSpeed);

    playbackIntervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        // Loop back to start when reaching the end
        const nextFrame = (prev + 1) % landmarksRef.current.length;
        drawLandmarksOnPreview(nextFrame);
        return nextFrame;
      });
    }, interval);
  };

  // Pause playback
  const pausePlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  // Jump to specific frame
  const jumpToFrame = (frameIndex: number) => {
    setCurrentFrame(frameIndex);
    drawLandmarksOnPreview(frameIndex);
  };

  // Fetch a random sign for the user to record
  const fetchRandomSign = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/random-sign");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCurrentSign(data.sign);
      setMessage({
        text: `Please sign the gesture for: ${data.sign}`,
        type: "info",
      });
    } catch (error) {
      console.error("Error fetching random sign:", error);
      setMessage({
        text: "Failed to get a random sign. Please try again later.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dataset statistics
  const fetchDatasetStats = async () => {
    try {
      const response = await fetch("/api/dataset-stats");

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDatasetStats(data);
    } catch (error) {
      console.error("Error fetching dataset stats:", error);
    }
  };

  // Start recording video and extracting landmarks
  const startRecording = async () => {
    try {
      if (!mediapipeReady) {
        setMessage({
          text: "MediaPipe is not ready yet. Please wait.",
          type: "error",
        });
        return;
      }

      // Reset landmarks array
      landmarksRef.current = [];

      // Request permission to use camera
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
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

      setRecording(true);
      setMessage({ text: "Recording... (max 5 seconds)", type: "info" });

      // Start animation frame loop for drawing landmarks
      animationFrameRef.current = requestAnimationFrame(updateCanvas);

      // Extract landmarks at regular intervals
      recordingIntervalRef.current = setInterval(async () => {
        if (videoRef.current && mediapipeReady) {
          try {
            // Extract landmarks from current frame
            const landmarks = await extractLandmarks(videoRef.current);

            if (landmarks && landmarks.length > 0) {
              landmarksRef.current.push(landmarks);
            }
          } catch (error) {
            console.error("Error extracting landmarks:", error);
          }
        }
      }, 66); // ~15fps

      // Auto-stop after 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setMessage({
        text: "Failed to start recording. Please check your camera permissions.",
        type: "error",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recording) {
      // Stop landmark extraction interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Stop animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Stop the video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setRecording(false);
      setMessage({ text: "Processing your recording...", type: "info" });

      // Check if we have landmarks
      if (landmarksRef.current.length > 0) {
        // Show preview instead of directly uploading
        setMessage({
          text: "Recording processed! Please review your sign before submitting.",
          type: "success",
        });
        setCurrentFrame(0);
        setShowPreview(true);

        // Make sure preview canvas has correct dimensions
        if (previewCanvasRef.current) {
          previewCanvasRef.current.width = 400;
          previewCanvasRef.current.height = 300;

          // Draw the first frame
          drawLandmarksOnPreview(0);

          // Start playback automatically
          startPlayback();
        }
      } else {
        setMessage({
          text: "No landmarks were detected. Please try again with clearer hand gestures.",
          type: "error",
        });
      }
    }
  };

  // Upload landmarks to the API
  const uploadLandmarks = async () => {
    if (!currentSign) {
      setMessage({
        text: "No sign selected. Please get a random sign first.",
        type: "error",
      });
      return;
    }

    if (landmarksRef.current.length === 0) {
      setMessage({
        text: "No landmarks recorded. Please try again.",
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      pausePlayback(); // Stop the playback
      setShowPreview(false); // Hide preview

      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sign: currentSign,
          landmarks: landmarksRef.current,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          text: "Thank you for your contribution!",
          type: "success",
        });
        // Reset for next recording
        landmarksRef.current = [];
        setCurrentSign("");
        // Refresh stats
        fetchDatasetStats();
      } else {
        throw new Error(result.error || "Failed to upload landmarks");
      }
    } catch (error) {
      console.error("Error uploading landmarks:", error);
      setMessage({
        text: "Failed to upload the landmarks. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel the preview and retry
  const handleRetry = () => {
    pausePlayback();
    setShowPreview(false);
    landmarksRef.current = [];
    setMessage({
      text: "Recording cancelled. You can try again.",
      type: "info",
    });
  };

  return (
    <section className="contribute-section p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Hero Card */}
      <div className="bg-white/20 backdrop-blur-md border border-[var(--accent)]/50 rounded-3xl p-8 shadow-md">
        <h1 className="text-5xl font-extrabold accent">
          🤲 Contribute to Gestus
        </h1>
        <p className="mt-4 text-lg text-[var(--foreground)]/80">
          Help us improve our sign language recognition by contributing video
          samples. Each submission helps make Gestus even better for everyone!
        </p>
      </div>

      {/* Recording Section */}
      <div className="bg-white/20 backdrop-blur-md border border-[var(--accent)]/50 rounded-3xl p-8 shadow-md">
        <h2 className="text-2xl font-semibold accent mb-4">Record a Sign</h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column: Instructions & Controls */}
          <div className="flex-1">
            <ol className="list-decimal list-inside space-y-4 mb-8">
              <li>Click "Get Random Sign" to receive a sign to record</li>
              <li>Position yourself in the camera view</li>
              <li>Click "Start Recording" and perform the sign</li>
              <li>The recording will automatically stop after 5 seconds</li>
              <li>Review your recorded sign in the preview</li>
              <li>Click "Submit" if you're satisfied or "Retry" if not</li>
            </ol>

            {/* Message display */}
            {message.text && (
              <div
                className={`p-4 mb-6 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : message.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={fetchRandomSign}
                disabled={isLoading || recording || !mediapipeReady}
                className="w-full bg-[var(--accent)] text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Get Random Sign"}
              </button>

              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={isLoading || !currentSign || !mediapipeReady}
                className={`w-full py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                  recording
                    ? "bg-red-600 text-white"
                    : "bg-[var(--accent)] text-white"
                }`}
              >
                {recording ? "Stop Recording" : "Start Recording"}
              </button>
            </div>

            {currentSign && (
              <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-lg">
                <p className="font-semibold">Current sign to record:</p>
                <p className="text-2xl font-bold">{currentSign}</p>
              </div>
            )}

            {landmarksRef.current.length > 0 && (
              <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-lg">
                <p className="font-semibold">Frames captured:</p>
                <p className="text-2xl font-bold">
                  {landmarksRef.current.length}
                </p>
              </div>
            )}
          </div>

          {/* Right column: Video preview */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-72 bg-black rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 text-sm text-[var(--foreground)]/70">
              {!mediapipeReady
                ? "Loading MediaPipe models... Please wait."
                : recording
                ? "Recording in progress..."
                : "Camera preview will appear here when recording starts"}
            </p>
          </div>
        </div>
      </div>

      {/* Landmark Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Review Your Sign
            </h3>
            <p className="mb-4 text-gray-600">
              Please review the recording of your sign "{currentSign}". You can
              play/pause and adjust playback speed.
            </p>

            {/* Canvas for landmark animation */}
            <div
              className="bg-gray-900 rounded-lg mb-4 mx-auto"
              style={{ width: "400px", height: "300px" }}
            >
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full"
                width="400"
                height="300"
              />
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={isPlaying ? pausePlayback : startPlayback}
                  className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      setPlaybackSpeed(Number(e.target.value));
                      if (isPlaying) {
                        pausePlayback();
                        setTimeout(startPlayback, 0);
                      }
                    }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>

              <div className="text-sm">
                Frame {currentFrame + 1} of {landmarksRef.current.length}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
              <div
                className="bg-[var(--accent)] h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    (currentFrame / (landmarksRef.current.length - 1)) * 100
                  }%`,
                }}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleRetry}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Retry
              </button>
              <button
                onClick={uploadLandmarks}
                className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Statistics Section */}
      {datasetStats && (
        <div className="bg-white/20 backdrop-blur-md border border-[var(--accent)]/50 rounded-3xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold accent mb-4">
            Dataset Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/50 p-4 rounded-lg text-center">
              <p className="text-lg">Total Samples</p>
              <p className="text-4xl font-bold accent">
                {datasetStats.totalSamples || 0}
              </p>
            </div>

            <div className="bg-white/50 p-4 rounded-lg text-center">
              <p className="text-lg">Local Samples</p>
              <p className="text-4xl font-bold accent">
                {datasetStats.localStats?.totalSamples || 0}
              </p>
            </div>

            <div className="bg-white/50 p-4 rounded-lg text-center">
              <p className="text-lg">Supabase Samples</p>
              <p className="text-4xl font-bold accent">
                {datasetStats.supabaseStats?.totalSupabaseSamples || 0}
              </p>
            </div>
          </div>

          {/* Sign distribution visualization */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Sign Distribution</h3>
            <div className="bg-white/50 p-4 rounded-lg overflow-x-auto">
              <div className="min-w-[600px]">
                {Object.entries(datasetStats.combinedCounts || {}).length >
                0 ? (
                  <div className="space-y-2">
                    {Object.entries(datasetStats.combinedCounts).map(
                      ([sign, count]) => (
                        <div key={sign} className="flex items-center">
                          <span className="w-24 font-medium">{sign}</span>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent)] rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (Number(count) /
                                    (datasetStats.totalSamples || 1)) *
                                    100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 w-12 text-right">
                            {String(count)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-center py-4">No sign data available yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center">
        <p className="mb-4 text-lg">
          Your contributions help make sign language more accessible to
          everyone!
        </p>
        <a
          href="/prototype"
          className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-semibold shadow-lg hover:opacity-90 transition"
        >
          🚀 Try our Prototype
        </a>
      </div>
    </section>
  );
}
