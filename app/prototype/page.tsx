"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import PlayfulNav from "../components/PlayfulNav"
import HandSymbol from "../components/HandSymbol"

// Import MediaPipe utilities
import {
  initMediaPipe,
  extractLandmarks,
  drawLandmarks,
} from "../utils/landmarkExtractor"

// Import MediaPipe dependencies for drawing
import {
  DrawingUtils,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision"

export default function PrototypePage() {
  // States for component
  const [isCapturing, setIsCapturing] = useState(false)
  const [mediapipeReady, setMediapipeReady] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordedFrames, setRecordedFrames] = useState<number[][]>([])
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [currentPreviewFrame, setCurrentPreviewFrame] = useState(0)
  const [previewSpeed, setPreviewSpeed] = useState(60) // frames per second
  const [currentSign, setCurrentSign] = useState<string>("Hello 👋")
  const [isLoadingSign, setIsLoadingSign] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showCameraSelect, setShowCameraSelect] = useState(false)

  // References
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const previewAnimationRef = useRef<number | null>(null)
  const recordedLandmarksRef = useRef<number[][]>([])
  const drawingUtilsRef = useRef<DrawingUtils | null>(null)

  // Fetch a random sign from the API
  const fetchRandomSign = async () => {
    try {
      setIsLoadingSign(true)
      const response = await fetch("/api/random-sign")
      if (!response.ok) {
        throw new Error("Failed to fetch random sign")
      }
      const data = await response.json()
      setCurrentSign(data.sign)
      setMessage(`Please perform the sign for "${data.sign}". Press Start when ready.`)
    } catch (error) {
      console.error("Error fetching random sign:", error)
      setMessage("Failed to fetch a random sign. Please try again.")
      setCurrentSign("Hello 👋") // Fallback to default
    } finally {
      setIsLoadingSign(false)
    }
  }

  // Toggle preview animation
  const togglePreview = () => {
    if (isPreviewPlaying) {
      stopPreviewAnimation();
    } else if (recordedFrames.length > 0) {
      startPreviewAnimation(recordedFrames);
    }
  }

  // Skip current sign and get a new one
  const handleSkipSign = () => {
    fetchRandomSign()
  }

  // Preload video element to ensure it's available
  const preloadVideo = async () => {
    try {
      console.log("Preloading video element...")
      
      // Check if video ref is available
      if (!videoRef.current) {
        console.error("Video element reference is null during preload")
        return false
      }
      
      // Test requesting camera permissions with low resolution
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false
      })
      
      // Assign to video element and try to play
      videoRef.current.srcObject = testStream
      await videoRef.current.play()
      
      // Check if dimensions are available
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.warn("Video dimensions not available after play")
      } else {
        console.log(`Preload successful. Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`)
      }
      
      // Stop the test stream and clear video source
      testStream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      
      return true
    } catch (error) {
      console.error("Error during video preload:", error)
      return false
    }
  }

  // Initialize MediaPipe and get camera devices when component mounts
  useEffect(() => {
    // Initialize MediaPipe
    setMessage("Loading MediaPipe models... Please wait.")

    // First, try to preload video element
    preloadVideo().then(success => {
      if (success) {
        console.log("Video element preloaded successfully")
      } else {
        console.warn("Video element preload failed")
        setMessage("Warning: Camera access may not work properly. Please ensure camera permissions are granted.")
      }
      
      // Continue with MediaPipe initialization
      return initMediaPipe()
    })
    .then(() => {
      console.log("MediaPipe initialized successfully")
      setMediapipeReady(true)

      // Fetch random sign after MediaPipe is initialized
      fetchRandomSign()
    })
    .catch((error) => {
      console.error("Error initializing:", error)
      setMessage(
        "Failed to initialize. Please try reloading the page and ensure camera permissions are granted."
      )
    })

    // Get available camera devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        )
        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err)
        setMessage("Failed to get camera devices. Please check permissions.")
      })

    // Cleanup function for when component unmounts
    return () => {
      stopCapture()
      stopPreviewAnimation()
    }
  }, [])
  
  // Log when the video element is available or changes
  useEffect(() => {
    console.log("Video ref state:", videoRef.current ? "Available" : "Not available")
    
    // Check if the current browser supports all the features we need
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("MediaDevices API not supported in this browser")
      setMessage("Your browser doesn't support camera access. Please use a modern browser like Chrome or Firefox.")
    }
  }, [videoRef.current])
  
  // Restart preview animation when preview speed changes
  useEffect(() => {
    if (recordedFrames.length > 0 && isPreviewPlaying) {
      stopPreviewAnimation(); // Stop existing preview
      startPreviewAnimation(recordedFrames); // Restart with new speed
    }
  }, [previewSpeed]);

  // Function to update the canvas with landmarks
  const updateCanvas = async () => {
    // Cancel any existing frame request first to avoid duplicates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    try {
      // Only proceed if video element exists and has valid dimensions
      if (!videoRef.current) {
        console.warn("Video element not available for landmark extraction")
        // Continue the animation loop if still capturing
        if (isCapturing) {
          animationFrameRef.current = requestAnimationFrame(updateCanvas)
        }
        return
      }
      
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.warn(`Invalid video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`)
        // Continue the animation loop if still capturing
        if (isCapturing) {
          animationFrameRef.current = requestAnimationFrame(updateCanvas)
        }
        return
      }
      
      // Make sure canvas has correct dimensions
      if (canvasRef.current) {
        if (canvasRef.current.width !== videoRef.current.videoWidth || 
            canvasRef.current.height !== videoRef.current.videoHeight) {
          console.log(`Updating canvas dimensions to match video: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`)
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
        }
      } else {
        console.warn("Canvas reference not available")
      }

      // Extract landmarks from current frame
      const landmarks = await extractLandmarks(videoRef.current)

      // Record landmarks if recording is active
      if (isRecording && landmarks.some(value => value !== 0)) {
        recordedLandmarksRef.current.push([...landmarks])
      }

      // Draw landmarks on canvas if available
      if (canvasRef.current) {
        drawLandmarks(canvasRef.current)
      }
    } catch (error) {
      console.error("Error extracting landmarks:", error)
    } finally {
      // Always continue the animation loop if still capturing, 
      // regardless of whether there was an error or not
      if (isCapturing) {
        animationFrameRef.current = requestAnimationFrame(updateCanvas)
      }
    }
  }

  // Start capturing video and extracting landmarks
  const startCapture = async () => {
    // Stop any existing capture first
    stopCapture()
    
    setRecordedFrames([]) // Clear previous frames
    setCurrentPreviewFrame(0) // Reset preview frame index
    recordedLandmarksRef.current = [] // Clear recorded landmarks
    
    try {
      if (!mediapipeReady) {
        setMessage("MediaPipe is not ready yet. Please wait.")
        return
      }

      // Check if video element exists before proceeding
      if (!videoRef.current) {
        console.error("Video element reference is null")
        setMessage("Error: Video element not available. Please reload the page.")
        return
      }

      // Request permission to use selected camera
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: 640,
          height: 480,
        },
        audio: false,
      })

      // Double check video ref is still valid
      if (!videoRef.current) {
        console.error("Video element reference became null after getUserMedia")
        setMessage("Error: Lost reference to video element. Please reload the page.")
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        return
      }

      // Set the stream to the video element
      videoRef.current.srcObject = streamRef.current
      
      // Make sure video is ready before starting recording
      await new Promise((resolve) => {
        const loadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('loadedmetadata', loadedmetadata)
          }
          resolve(null)
        }
        
        // If already loaded, resolve immediately
        if (videoRef.current.readyState >= 2) {
          resolve(null)
        } else {
          videoRef.current.addEventListener('loadedmetadata', loadedmetadata)
        }
        
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err)
          setMessage("Error playing video. Please check permissions.")
        })
      })
      
      // Another safety check
      if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.error(`Invalid video state after play:`, 
          videoRef.current ? 
          `width=${videoRef.current.videoWidth}, height=${videoRef.current.videoHeight}, readyState=${videoRef.current.readyState}` :
          'videoRef is null')
        setMessage("Error: Unable to get valid video dimensions. Please try again.")
        return
      }
      
      console.log(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`)
      
      // Wait a bit to ensure video is rendering before starting landmarks
      await new Promise(resolve => setTimeout(resolve, 500))

      // Set canvas dimensions to match video
      if (canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
      }

      // Initialize preview canvas with same dimensions
      if (previewCanvasRef.current) {
        previewCanvasRef.current.width = videoRef.current.videoWidth
        previewCanvasRef.current.height = videoRef.current.videoHeight

        // Initialize drawing utils for preview
        const ctx = previewCanvasRef.current.getContext("2d")
        if (ctx) {
          drawingUtilsRef.current = new DrawingUtils(ctx)
        }
      }

      // Start recording fresh
      setIsRecording(true)
      setIsCapturing(true)
      setMessage(`Recording sign "${currentSign}"... Press Stop when done.`)

      // Ensure any existing animation is cancelled
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Start animation frame loop for drawing landmarks
      animationFrameRef.current = requestAnimationFrame(updateCanvas)
      
      console.log("Capture started with animation loop")
    } catch (error) {
      console.error("Error starting video capture:", error)
      setMessage(
        `Failed to start capturing: ${error.message || "Unknown error"}. Please check your camera permissions.`
      )
    }
  }

  // Stop capturing
  const stopCapture = () => {
    console.log("Stopping capture")
    
    // Cancel animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      console.log("Animation frame cancelled")
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log("Track stopped:", track.label)
      })
      streamRef.current = null
    }

    // Update state
    setIsCapturing(false)

    // Stop recording and prepare for preview
    if (isRecording && recordedLandmarksRef.current.length > 0) {
      const frames = [...recordedLandmarksRef.current]
      setRecordedFrames(frames)
      setIsRecording(false)
      setMessage(`Recording complete! Captured ${frames.length} frames.`)
      
      console.log(`Recording stopped with ${frames.length} frames captured.`)
      
      // Start preview animation
      startPreviewAnimation(frames)
    } else {
      console.log("No frames were recorded")
      if (isRecording) {
        setIsRecording(false)
        setMessage("No landmarks were detected. Please try again.")
      }
    }
  }

  // Toggle capture state
  const toggleRecording = () => {
    if (isCapturing) {
      stopCapture()
    } else {
      startCapture()
    }
  }

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
  }

  // Draw a single frame of landmarks on the preview canvas
  const drawPreviewFrame = (landmarksArray: number[]) => {
    if (!previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extract pose and hand landmarks
    const poseLandmarks = extractPoseLandmarks(landmarksArray);
    const leftHandLandmarks = extractHandLandmarks(landmarksArray, 0);
    const rightHandLandmarks = extractHandLandmarks(landmarksArray, 1);

    // Initialize drawing utils
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

    // Draw left hand landmarks if available
    if (leftHandLandmarks.length > 0) {
      drawingUtilsRef.current.drawLandmarks(leftHandLandmarks, {
        radius: 2,
        color: "#00FF00",
      });
      drawingUtilsRef.current.drawConnectors(
        leftHandLandmarks,
        HandLandmarker.HAND_CONNECTIONS,
        {
          color: "#CC0000",
          lineWidth: 2,
        }
      );
    }

    // Draw right hand landmarks if available
    if (rightHandLandmarks.length > 0) {
      drawingUtilsRef.current.drawLandmarks(rightHandLandmarks, {
        radius: 2,
        color: "#FF0000",
      });
      drawingUtilsRef.current.drawConnectors(
        rightHandLandmarks,
        HandLandmarker.HAND_CONNECTIONS,
        {
          color: "#00CC00",
          lineWidth: 2,
        }
      );
    }
  }

  // Stop preview animation
  const stopPreviewAnimation = () => {
    if (previewAnimationRef.current) {
      cancelAnimationFrame(previewAnimationRef.current);
      previewAnimationRef.current = null;
    }
    setIsPreviewPlaying(false);
  }

  // Extract pose landmarks from the flattened landmark array
  const extractPoseLandmarks = (landmarks: number[]): any[] => {
    const NUM_POSE_LANDMARKS = 33
    const poseLandmarks = []

    for (let i = 0; i < NUM_POSE_LANDMARKS; i++) {
      const offset = i * 3
      if (
        landmarks[offset] !== 0 ||
        landmarks[offset + 1] !== 0 ||
        landmarks[offset + 2] !== 0
      ) {
        poseLandmarks.push({
          x: landmarks[offset],
          y: landmarks[offset + 1],
          z: landmarks[offset + 2],
        })
      } else {
        // Add empty landmark for visualization if not detected
        poseLandmarks.push({ x: 0, y: 0, z: 0 })
      }
    }

    return poseLandmarks
  }

  // Extract hand landmarks from the flattened landmark array
  const extractHandLandmarks = (landmarks: number[], handIndex: number): any[] => {
    const NUM_POSE_LANDMARKS = 33
    const NUM_HAND_LANDMARKS = 21
    const handLandmarks = []

    // Calculate the starting index for the hand landmarks in the array
    // After pose landmarks (33*3), first hand is at index 99, second at 99+63
    const startIdx = NUM_POSE_LANDMARKS * 3 + handIndex * NUM_HAND_LANDMARKS * 3

    // Check if there's any non-zero value in this hand's landmarks
    let hasData = false
    for (let i = 0; i < NUM_HAND_LANDMARKS * 3; i++) {
      if (landmarks[startIdx + i] !== 0) {
        hasData = true
        break
      }
    }

    if (!hasData) return [] // Return empty array if no data

    // Extract the landmarks
    for (let i = 0; i < NUM_HAND_LANDMARKS; i++) {
      const offset = startIdx + i * 3
      handLandmarks.push({
        x: landmarks[offset],
        y: landmarks[offset + 1],
        z: landmarks[offset + 2],
      })
    }

    return handLandmarks
  }

  // Submit the recorded landmarks to the server
  const submitLandmarks = async () => {
    if (recordedFrames.length === 0) {
      setMessage("No recording to submit. Please record a sign first.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submit-sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sign: currentSign,
          frames: recordedFrames,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit sign")
      }

      setShowThankYou(true)
      setTimeout(() => {
        setShowThankYou(false)
        startOver()
      }, 3000)
    } catch (error) {
      console.error("Error submitting sign:", error)
      setMessage("Failed to submit sign. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset the state to start over
  const startOver = () => {
    stopPreviewAnimation()
    setRecordedFrames([])
    setIsPreviewPlaying(false)
    setCurrentPreviewFrame(0)
    recordedLandmarksRef.current = []
    fetchRandomSign()
  }

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
            Gestus <span className="bg-gradient-to-r from-[#009fe3] to-[#ffd23f] bg-clip-text text-transparent">Prototype</span>
          </motion.h1>
          
          {/* Message alert */}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {showCameraSelect ? "Hide Camera Options" : "Change Camera"}
            </button>
          </motion.div>

          {/* Camera selection dropdown */}
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
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
          
          {/* Current sign to make */}
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

          {/* Video input and preview area */}
          <motion.div
            className="relative w-full max-w-2xl aspect-video mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 rounded-2xl border-4 border-dashed border-[#009fe3]/30 bg-[#f0f9ff] flex items-center justify-center overflow-hidden">
              {/* Video element - always rendered but hidden when not needed */}
              <video 
                ref={videoRef} 
                className={`absolute inset-0 w-full h-full object-cover ${!isCapturing ? 'hidden' : ''}`}
                playsInline
                muted
                autoPlay
              />
              
              {isCapturing ? (
                <>
                  {/* Canvas for drawing landmarks - place above video */}
                  <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full z-10"
                  />
                  
                  {/* Recording indicator */}
                  <div className="absolute top-4 right-4 flex items-center z-20">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" />
                    <span className="text-red-500 font-medium">REC</span>
                  </div>
                </>
              ) : recordedFrames.length > 0 ? (
                /* Preview canvas for recorded landmarks */
                <canvas
                  ref={previewCanvasRef}
                  className="absolute inset-0 w-full h-full z-10"
                />
              ) : (
                /* Placeholder when no video feed */
                <div className="text-center px-6 z-10">
                  <HandSymbol size={120} animated={true} />
                  <p className="text-gray-500 mt-4">
                    Click "Start Recording" to begin
                  </p>
                </div>
              )}

              {/* Thank you message */}
              {showThankYou && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col rounded-xl z-30">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-white">Your sign has been submitted.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Frame counter for preview */}
          {recordedFrames.length > 0 && !isCapturing && (
            <motion.div
              className="w-full max-w-2xl mb-6 flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex gap-4 items-center">
                {/* Play/Pause button */}
                <button
                  onClick={togglePreview}
                  className={`flex-1 py-3 px-4 rounded-lg text-white font-medium ${
                    isPreviewPlaying
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isPreviewPlaying ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Pause Preview
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Play Preview
                    </span>
                  )}
                </button>
                
                {/* Frame counter */}
                <div className="bg-gray-100 rounded-lg px-4 py-3 text-center">
                  Frame: {currentPreviewFrame + 1} / {recordedFrames.length}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 whitespace-nowrap">Preview Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={previewSpeed}
                  onChange={(e) => setPreviewSpeed(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">{previewSpeed} fps</span>
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
                isCapturing ? "bg-red-500 hover:bg-red-600" : "bg-[#009fe3] hover:bg-[#0084bd]"
              }`}
              onClick={toggleRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!mediapipeReady || isLoadingSign}
            >
              <span className="mr-2">
                {isCapturing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="6" y="6" width="8" height="8" fill="currentColor" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="10" r="6" fill="currentColor" />
                  </svg>
                )}
              </span>
              {isCapturing ? "Stop Recording" : "Start Recording"}
            </motion.button>

            <motion.button
              className="px-8 py-3 rounded-full font-bold text-white bg-[#ffd23f] hover:bg-[#f2c935] shadow-lg flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitLandmarks}
              disabled={isCapturing || recordedFrames.length === 0 || isSubmitting}
              style={{ opacity: (isCapturing || recordedFrames.length === 0 || isSubmitting) ? 0.5 : 1 }}
            >
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              {isSubmitting ? "Sending..." : "Submit Sign"}
            </motion.button>

            {recordedFrames.length > 0 && !isCapturing && (
              <motion.button
                className="px-8 py-3 rounded-full font-bold text-[#009fe3] border border-[#009fe3] hover:bg-[#009fe3]/10 shadow-sm flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startOver}
                disabled={isSubmitting}
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </span>
                Try Again
              </motion.button>
            )}
            
            {/* Debug button - remove in production */}
            <motion.button
              className="px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-300 hover:bg-gray-100 shadow-sm flex items-center"
              onClick={() => {
                // Check the status of video element and display in a popup alert
                if (videoRef.current) {
                  const { videoWidth, videoHeight, readyState } = videoRef.current;
                  const readyStateMap = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
                  alert(`Video element status:
                    - Width: ${videoWidth}
                    - Height: ${videoHeight}
                    - Ready State: ${readyState} (${readyStateMap[readyState]})
                    - Source: ${videoRef.current.srcObject ? 'Set' : 'Not set'}
                    - Playing: ${!videoRef.current.paused}
                  `);
                } else {
                  alert('Video element reference is null');
                }
              }}
            >
              <span className="mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              Debug
            </motion.button>
          </motion.div>

          {/* Hint section */}
          <motion.div
            className="mt-12 bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 rounded-full bg-[#009fe3]/20 text-[#009fe3] flex items-center justify-center mr-3">
                💡
              </span>
              How It Works
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  1
                </span>
                <span>Press "Start Recording" and perform the sign shown above</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  2
                </span>
                <span>Stop the recording when you're done to preview your sign</span>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-[#009fe3]/10 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  3
                </span>
                <span>Submit your sign to contribute to our dataset or try again</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </main>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 z-[-1] overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" width="100%" height="320">
          <path
            d="M0,96L48,106.7C96,117,192,139,288,154.7C384,171,480,181,576,170.7C672,160,768,128,864,122.7C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#7ed957"
            opacity="0.2"
          />
        </svg>
      </div>
    </div>
  )
}
