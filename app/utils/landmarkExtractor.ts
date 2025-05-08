/**
 * Client-side landmark extraction utilities using MediaPipe Tasks Vision API
 */

// Import MediaPipe types
import {
  FilesetResolver,
  PoseLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

// MediaPipe instances
let poseLandmarker: any = null;
let handLandmarker: any = null;
let mediaPipeReady = false;

// Store last detection results for visualization
let lastResults = {
  poseLandmarks: null as unknown as any[],
  handLandmarks: [] as any[][],
};

// Constants for landmark counts
const NUM_POSE_LANDMARKS = 33;
const NUM_HAND_LANDMARKS = 21;

/**
 * Initialize MediaPipe Pose and Hand Landmarker models
 */
export async function initMediaPipe(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // Load vision wasm files
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Create pose landmarker
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE", // Start with image mode, will change to VIDEO when needed
        numPoses: 1,
      });

      // Create hand landmarker
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE", // Start with image mode, will change to VIDEO when needed
        numHands: 2,
      });

      console.log("MediaPipe Tasks models initialized successfully");
      mediaPipeReady = true;
      resolve();
    } catch (error) {
      console.error("Failed to initialize MediaPipe Tasks:", error);
      reject(error);
    }
  });
}

/**
 * Process a single video frame and extract landmarks
 * @param videoElement - HTML Video Element with camera feed
 * @returns Promise resolving to extracted landmarks array
 */
export async function extractLandmarks(
  videoElement: HTMLVideoElement
): Promise<number[]> {
  console.log("[LandmarkExtractor] extractLandmarks called");
  return new Promise(async (resolve, reject) => {
    if (!poseLandmarker || !handLandmarker || !mediaPipeReady) {
      reject(
        new Error(
          "MediaPipe models not initialized or not ready. Call initMediaPipe first."
        )
      );
      return;
    }

    try {
      // Process the current frame for pose landmarks
      const poseResults = poseLandmarker.detect(videoElement);

      // Process the current frame for hand landmarks
      const handResults = handLandmarker.detect(videoElement);

      // Store results for visualization
      lastResults.poseLandmarks = poseResults.landmarks?.[0] || null;
      lastResults.handLandmarks = handResults.landmarks || [];

      console.log("[LandmarkExtractor] lastResults", lastResults);

      // Extract and format landmarks
      const landmarks = formatLandmarks(poseResults, handResults);
      resolve(landmarks);
    } catch (error) {
      console.error("Error extracting landmarks:", error);
      reject(error);
    }
  });
}

/**
 * Format landmarks from pose and hands results into a flat array
 */
function formatLandmarks(poseResults: any, handResults: any): number[] {
  // Create a flat array to hold all landmarks
  const totalLandmarks = NUM_POSE_LANDMARKS + 2 * NUM_HAND_LANDMARKS; // Pose + left hand + right hand
  const allLandmarks = new Array(totalLandmarks * 3).fill(0); // x, y, z for each landmark

  let offset = 0;

  // 1. Process pose landmarks
  if (poseResults.landmarks && poseResults.landmarks.length > 0) {
    for (const landmark of poseResults.landmarks[0]) {
      allLandmarks[offset] = landmark.x;
      allLandmarks[offset + 1] = landmark.y;
      allLandmarks[offset + 2] = landmark.z || 0;
      offset += 3;
    }
  } else {
    // Skip pose landmarks if not detected
    offset += NUM_POSE_LANDMARKS * 3;
  }

  // Determine left and right hands
  let leftHandLandmarks = null;
  let rightHandLandmarks = null;

  if (handResults.landmarks && handResults.landmarks.length > 0) {
    // Check handedness to determine left vs right hand
    for (let i = 0; i < handResults.landmarks.length && i < 2; i++) {
      const handedness = handResults.handedness[i][0];
      if (
        handedness.categoryName &&
        handedness.categoryName.toLowerCase() === "left"
      ) {
        leftHandLandmarks = handResults.landmarks[i];
      } else if (
        handedness.categoryName &&
        handedness.categoryName.toLowerCase() === "right"
      ) {
        rightHandLandmarks = handResults.landmarks[i];
      }
    }

    // If only one hand is detected and handedness is ambiguous, use the first hand as left hand
    if (
      !leftHandLandmarks &&
      !rightHandLandmarks &&
      handResults.landmarks.length > 0
    ) {
      leftHandLandmarks = handResults.landmarks[0];
    }
  }

  // 2. Process left hand landmarks
  if (leftHandLandmarks) {
    for (const landmark of leftHandLandmarks) {
      allLandmarks[offset] = landmark.x;
      allLandmarks[offset + 1] = landmark.y;
      allLandmarks[offset + 2] = landmark.z || 0;
      offset += 3;
    }
  } else {
    offset += NUM_HAND_LANDMARKS * 3;
  }

  // 3. Process right hand landmarks
  if (rightHandLandmarks) {
    for (const landmark of rightHandLandmarks) {
      allLandmarks[offset] = landmark.x;
      allLandmarks[offset + 1] = landmark.y;
      allLandmarks[offset + 2] = landmark.z || 0;
      offset += 3;
    }
  }

  return allLandmarks;
}

/**
 * Draw landmarks on a canvas element for visualization
 * @param canvas - HTML Canvas Element to draw on
 */
export function drawLandmarks(canvas: HTMLCanvasElement): void {
  const { poseLandmarks, handLandmarks } = lastResults;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Check if we have the drawing utils available
  if (!(window as any).mpTasksVision) {
    console.warn("MediaPipe Tasks Vision not available for drawing");
    return;
  }

  const { DrawingUtils, PoseLandmarker, HandLandmarker } = (window as any)
    .mpTasksVision;
  const drawingUtils = new DrawingUtils(ctx);

  // Draw pose landmarks
  if (poseLandmarks) {
    drawingUtils.drawLandmarks(poseLandmarks, {
      radius: 3,
      color: "#FF0000",
    });
    drawingUtils.drawConnectors(
      poseLandmarks,
      PoseLandmarker.POSE_CONNECTIONS,
      {
        color: "#00FF00",
        lineWidth: 2,
      }
    );
  }

  // Draw hand landmarks
  for (let i = 0; i < handLandmarks.length; i++) {
    const isLeftHand = i === 0; // Assume first hand is left for visualization
    drawingUtils.drawLandmarks(handLandmarks[i], {
      radius: 2,
      color: isLeftHand ? "#00FF00" : "#FF0000",
    });
    drawingUtils.drawConnectors(
      handLandmarks[i],
      HandLandmarker.HAND_CONNECTIONS,
      {
        color: isLeftHand ? "#CC0000" : "#00CC00",
        lineWidth: 2,
      }
    );
  }
}
