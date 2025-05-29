"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PlayfulNav from "../components/PlayfulNav";
import { extractPoseLandmarks, extractHandLandmarks } from "../utils/landmarkExtractor";

// Define pose connections based on MediaPipe pose landmark indices
const POSE_CONNECTIONS = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], 
  [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
  [27, 29], [27, 31], [29, 31], [28, 30], [28, 32], [30, 32]
];

// Define hand connections based on MediaPipe hand landmark indices
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [0, 5], [5, 9], [9, 13], [13, 17]
];

interface SampleData {
  id: string;
  sign: string;
  timestamp: string;
  landmarks: any[];
  metadata?: {
    fps?: number;
    frame_count?: number;
    duration?: number;
  };
}

interface DatasetStats {
  totalSamples: number;
  sampleCounts: Record<string, number>;
  samples: SampleData[];
}

export default function StatusPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedSign, setSelectedSign] = useState<string>("all");  const [selectedSample, setSelectedSample] = useState<SampleData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const isPlayingRef = useRef(false);
  // Fetch dataset statistics and samples
  useEffect(() => {
    fetchDatasetData();
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  // Cleanup animation when isPlaying changes
  useEffect(() => {
    if (!isPlaying && animationRef.current) {
      isPlayingRef.current = false;
      clearTimeout(animationRef.current);
    }
  }, [isPlaying]);

  const fetchDatasetData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dataset-samples");
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dataset data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  // Filter samples based on selected sign
  const filteredSamples =
    stats?.samples.filter(
      (sample) => selectedSign === "all" || sample.sign === selectedSign
    ) || [];

  // Convert flat landmark arrays to structured format
  const convertLandmarksToStructured = (flatLandmarks: number[][]) => {
    return flatLandmarks.map((frameLandmarks) => {
      // Extract pose landmarks
      const poseLandmarks = extractPoseLandmarks(frameLandmarks);
      
      // Extract hand landmarks (returns [leftHand, rightHand])
      const handLandmarks = extractHandLandmarks(frameLandmarks);
      
      return {
        pose: poseLandmarks.map(point => ({
          x: point.x,
          y: point.y,
          z: point.z,
          visibility: 0.9 // Default visibility for pose landmarks
        })),
        left_hand: handLandmarks[0] || [],
        right_hand: handLandmarks[1] || [],
        face: [] // Face landmarks not currently extracted from the flat format
      };
    });
  };  // Draw landmarks on canvas
  const drawLandmarks = (landmarks: any[], frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks[frameIndex]) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if landmarks need conversion from flat format
    const frame = Array.isArray(landmarks[frameIndex]) && typeof landmarks[frameIndex][0] === 'number'
      ? convertLandmarksToStructured([landmarks[frameIndex]])[0]
      : landmarks[frameIndex];
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Helper function to draw connections between landmarks
    const drawConnections = (points: any[], connections: number[][], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      for (const [start, end] of connections) {
        if (!points[start] || !points[end]) continue;
        
        const startPoint = points[start];
        const endPoint = points[end];
        
        // Skip connections with low visibility points for pose
        if (
          (startPoint.visibility !== undefined && startPoint.visibility < 0.5) ||
          (endPoint.visibility !== undefined && endPoint.visibility < 0.5)
        ) {
          continue;
        }
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvasWidth, startPoint.y * canvasHeight);
        ctx.lineTo(endPoint.x * canvasWidth, endPoint.y * canvasHeight);
        ctx.stroke();
      }
    };

    // Draw pose landmarks and connections (blue)
    if (frame.pose && frame.pose.length > 0) {
      // Draw connections first so points appear on top
      drawConnections(frame.pose, POSE_CONNECTIONS, "rgba(59, 130, 246, 0.7)"); // Semi-transparent blue
      
      // Draw points
      ctx.fillStyle = "#3B82F6";
      frame.pose.forEach((point: any) => {
        if (point.visibility === undefined || point.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(
            point.x * canvasWidth,
            point.y * canvasHeight,
            3,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });
    }

    // Draw left hand landmarks and connections (green)
    if (frame.left_hand && frame.left_hand.length > 0) {
      // Draw connections
      drawConnections(frame.left_hand, HAND_CONNECTIONS, "rgba(16, 185, 129, 0.7)"); // Semi-transparent green
      
      // Draw points
      ctx.fillStyle = "#10B981";
      frame.left_hand.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(
          point.x * canvasWidth,
          point.y * canvasHeight,
          2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    }

    // Draw right hand landmarks and connections (red)
    if (frame.right_hand && frame.right_hand.length > 0) {
      // Draw connections
      drawConnections(frame.right_hand, HAND_CONNECTIONS, "rgba(239, 68, 68, 0.7)"); // Semi-transparent red
      
      // Draw points
      ctx.fillStyle = "#EF4444";
      frame.right_hand.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(
          point.x * canvasWidth,
          point.y * canvasHeight,
          2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    }

    // Draw face landmarks (yellow, smaller)
    if (frame.face && frame.face.length > 0) {
      ctx.fillStyle = "#F59E0B";
      frame.face.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(
          point.x * canvasWidth,
          point.y * canvasHeight,
          1,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    }
  };  // Play landmark animation
  const playAnimation = () => {
    if (!selectedSample || !selectedSample.landmarks.length) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    let frameIndex = 0;
    const totalFrames = selectedSample.landmarks.length;
    const fps = selectedSample.metadata?.fps || 30;
    const frameDelay = 1000 / fps;

    const animate = () => {
      if (!isPlayingRef.current) return; // Check if animation should continue
      
      drawLandmarks(selectedSample.landmarks, frameIndex);
      setCurrentFrame(frameIndex);

      frameIndex++;
      if (frameIndex >= totalFrames) {
        frameIndex = 0; // Loop animation
      }

      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, frameDelay);
    };

    animate();
  };

  // Stop animation
  const stopAnimation = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };
  // Handle sample selection
  const handleSampleSelect = (sample: SampleData) => {
    stopAnimation();
    
    // Convert flat landmarks to structured format if needed
    const structuredLandmarks = sample.landmarks.every(frame => Array.isArray(frame) && typeof frame[0] === 'number')
      ? convertLandmarksToStructured(sample.landmarks)
      : sample.landmarks;
    
    const processedSample = {
      ...sample,
      landmarks: structuredLandmarks
    };
    
    setSelectedSample(processedSample);
    setCurrentFrame(0);

    // Draw first frame
    setTimeout(() => {
      drawLandmarks(processedSample.landmarks, 0);
    }, 100);
  };

  // Get unique signs for filter
  const uniqueSigns = stats
    ? [...new Set(stats.samples.map((s) => s.sign))].sort()
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f9ff]">
        <PlayfulNav />
        <main className="container mx-auto px-4 pt-24 pb-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#009fe3] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading dataset information...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f9ff]">
        <PlayfulNav />
        <main className="container mx-auto px-4 pt-24 pb-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Error Loading Data
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDatasetData}
                className="px-6 py-2 bg-[#009fe3] text-white rounded-lg hover:bg-[#0084bd] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f0f9ff]">
      <PlayfulNav />

      <main className="container mx-auto px-4 pt-24 pb-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dataset{" "}
            <span className="bg-gradient-to-r from-[#009fe3] to-[#7ed957] bg-clip-text text-transparent">
              Status
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our sign language dataset and view landmark sequences
          </p>
        </motion.div>

        {/* Dataset Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-[#009fe3] mb-2">
              {stats?.totalSamples || 0}
            </div>
            <div className="text-gray-600">Total Samples</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-[#ffd23f] mb-2">
              {uniqueSigns.length}
            </div>
            <div className="text-gray-600">Different Signs</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-[#7ed957] mb-2">
              {stats?.totalSamples
                ? Math.round(stats.totalSamples / uniqueSigns.length)
                : 0}
            </div>
            <div className="text-gray-600">Avg per Sign</div>
          </div>
        </motion.div>

        {/* Sign Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Samples per Sign</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(stats?.sampleCounts || {}).map(([sign, count]) => (
              <div key={sign} className="text-center">
                <div className="bg-gray-200 rounded-lg h-20 flex items-end p-2 mb-2">
                  <div
                    className="bg-gradient-to-t from-[#009fe3] to-[#7ed957] rounded w-full transition-all duration-300"
                    style={{
                      height: `${Math.max(
                        10,
                        (count /
                          Math.max(
                            ...Object.values(stats?.sampleCounts || {})
                          )) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-sm font-medium">{sign}</div>
                <div className="text-xs text-gray-500">{count} samples</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sample List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Samples</h2>
              <select
                value={selectedSign}
                onChange={(e) => setSelectedSign(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
              >
                <option value="all">All Signs</option>
                {uniqueSigns.map((sign) => (
                  <option key={sign} value={sign}>
                    {sign}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSampleSelect(sample)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedSample?.id === sample.id
                      ? "border-[#009fe3] bg-[#009fe3]/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-lg">{sample.sign}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(sample.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {sample.landmarks.length} frames
                    </div>
                  </div>
                </div>
              ))}

              {filteredSamples.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No samples found for the selected filter
                </div>
              )}
            </div>
          </motion.div>

          {/* Landmark Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Landmark Viewer</h2>

            {selectedSample ? (
              <div className="space-y-4">
                {/* Sample Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Sign:</span>{" "}
                      {selectedSample.sign}
                    </div>
                    <div>
                      <span className="font-medium">Frames:</span>{" "}
                      {selectedSample.landmarks.length}
                    </div>
                    <div>
                      <span className="font-medium">FPS:</span>{" "}
                      {selectedSample.metadata?.fps || 30}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {selectedSample.metadata?.duration || "N/A"}s
                    </div>
                  </div>
                </div>

                {/* Canvas for landmarks */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="border border-gray-300 rounded-lg w-full bg-black"
                  />

                  {/* Frame counter overlay */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Frame: {currentFrame + 1} /{" "}
                    {selectedSample.landmarks.length}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={isPlaying ? stopAnimation : playAnimation}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isPlaying
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#009fe3] hover:bg-[#0084bd] text-white"
                    }`}
                  >
                    {isPlaying ? "⏸️ Stop" : "▶️ Play"}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={selectedSample.landmarks.length - 1}
                    value={currentFrame}
                    onChange={(e) => {
                      const frame = parseInt(e.target.value);
                      setCurrentFrame(frame);
                      drawLandmarks(selectedSample.landmarks, frame);
                    }}
                    className="flex-1 max-w-xs"
                  />
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Pose landmarks
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Left hand
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Right hand
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    Face landmarks
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-4">👆</div>
                <p>Select a sample from the list to view landmarks</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
