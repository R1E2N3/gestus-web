/**
 * Client-side landmark extraction utilities using MediaPipe Tasks Vision API
 * Improved version with proper hand identification to match backend processing
 */

// Import MediaPipe types
import {
  FilesetResolver,
  PoseLandmarker,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

// MediaPipe instances
let poseLandmarker: any = null;
let handLandmarker: any = null;
let mediaPipeReady = false;

// Store last detection results for visualization
let lastResults = {
  poseLandmarks: null as unknown as any[],
  handLandmarks: [] as any[][],
  handedness: [] as any[], // Added to store handedness information
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

      // Create pose landmarker with lite model for better performance
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE", // Start with image mode, will change to VIDEO when needed
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
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
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
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
 * Checks if a video element is valid for processing
 * @param videoElement - HTML Video Element to check
 * @returns boolean indicating if video is valid
 */
function isVideoValid(videoElement: HTMLVideoElement): boolean {
  // Check if video element exists
  if (!videoElement) {
    console.error("Video element is null or undefined");
    return false;
  }

  // Check if video has valid dimensions
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    console.error(
      `Invalid video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`
    );
    return false;
  }

  // Check if video is ready
  if (videoElement.readyState < 2) {
    // HAVE_CURRENT_DATA or higher
    console.error(`Video not ready: readyState=${videoElement.readyState}`);
    return false;
  }

  return true;
}

/**
 * Process a single video frame and extract landmarks
 * @param videoElement - HTML Video Element with camera feed
 * @returns Promise resolving to extracted landmarks array
 */
export async function extractLandmarks(
  videoElement: HTMLVideoElement
): Promise<number[]> {
  return new Promise(async (resolve, reject) => {
    if (!poseLandmarker || !handLandmarker || !mediaPipeReady) {
      reject(
        new Error(
          "MediaPipe models not initialized or not ready. Call initMediaPipe first."
        )
      );
      return;
    }

    // Validate video before processing
    if (!isVideoValid(videoElement)) {
      console.warn("Video validation failed, returning empty landmarks");
      // Return empty landmarks array rather than rejecting
      const emptyLandmarks = new Array(
        (NUM_POSE_LANDMARKS + 2 * NUM_HAND_LANDMARKS) * 3
      ).fill(0);
      resolve(emptyLandmarks);
      return;
    }

    try {
      // Process the current frame for pose landmarks
      const poseResults = poseLandmarker.detect(videoElement);

      // Process the current frame for hand landmarks
      const handResults = handLandmarker.detect(videoElement);

      // Store results for visualization and debugging
      lastResults.poseLandmarks = poseResults.landmarks?.[0] || null;
      lastResults.handLandmarks = handResults.landmarks || [];
      lastResults.handedness = handResults.handedness || [];

      // Extract and format landmarks with proper hand identification
      const landmarks = formatLandmarks(poseResults, handResults);
      resolve(landmarks);
    } catch (error) {
      console.error("Error extracting landmarks:", error);
      // Return empty landmarks array on error instead of rejecting
      const emptyLandmarks = new Array(
        (NUM_POSE_LANDMARKS + 2 * NUM_HAND_LANDMARKS) * 3
      ).fill(0);
      resolve(emptyLandmarks);
    }
  });
}

/**
 * Format landmarks from pose and hands results into a flat array
 * This implementation ensures the same landmark structure as the backend
 * (pose landmarks, left hand landmarks, right hand landmarks)
 */
function formatLandmarks(poseResults: any, handResults: any): number[] {
  // Create a flat array to hold all landmarks
  const totalLandmarks = NUM_POSE_LANDMARKS + 2 * NUM_HAND_LANDMARKS; // Pose + left hand + right hand
  const allLandmarks = new Array(totalLandmarks * 3).fill(0); // x, y, z for each landmark

  let offset = 0;

  // 1. Process pose landmarks - ALWAYS COMES FIRST
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

  // Initialize variables for left and right hands
  let leftHandLandmarks = null;
  let rightHandLandmarks = null;

  // CRITICAL: Properly identify left and right hands using handedness classification
  // This must match how the backend and dataset creation code identify hands
  if (
    handResults.landmarks &&
    handResults.landmarks.length > 0 &&
    handResults.handedness &&
    handResults.handedness.length > 0
  ) {
    // Check each detected hand's handedness
    for (
      let i = 0;
      i < handResults.landmarks.length && i < handResults.handedness.length;
      i++
    ) {
      if (handResults.handedness[i] && handResults.handedness[i].length > 0) {
        const handedness = handResults.handedness[i][0];

        // Explicitly check the label to determine left vs right hand
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
    }
  }

  // 2. Process left hand landmarks - ALWAYS COMES SECOND
  if (leftHandLandmarks) {
    for (const landmark of leftHandLandmarks) {
      allLandmarks[offset] = landmark.x;
      allLandmarks[offset + 1] = landmark.y;
      allLandmarks[offset + 2] = landmark.z || 0;
      offset += 3;
    }
  } else {
    // Skip left hand landmarks if not detected (fill with zeros)
    offset += NUM_HAND_LANDMARKS * 3;
  }

  // 3. Process right hand landmarks - ALWAYS COMES LAST
  if (rightHandLandmarks) {
    for (const landmark of rightHandLandmarks) {
      allLandmarks[offset] = landmark.x;
      allLandmarks[offset + 1] = landmark.y;
      allLandmarks[offset + 2] = landmark.z || 0;
      offset += 3;
    }
  }
  // No need to adjust offset after right hand, as it's the last segment

  return allLandmarks;
}

/**
 * Draw landmarks on a canvas element for visualization
 * @param canvas - HTML Canvas Element to draw on
 */
export function drawLandmarks(canvas: HTMLCanvasElement): void {
  const { poseLandmarks, handLandmarks, handedness } = lastResults;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

  // Draw hand landmarks with proper colors based on handedness
  for (let i = 0; i < handLandmarks.length; i++) {
    // Determine if left or right hand for proper coloring
    let isLeftHand = false;
    if (
      handedness &&
      handedness.length > i &&
      handedness[i] &&
      handedness[i].length > 0
    ) {
      isLeftHand = handedness[i][0].categoryName.toLowerCase() === "left";
    }

    // Use different colors for left and right hands
    drawingUtils.drawLandmarks(handLandmarks[i], {
      radius: 2,
      color: isLeftHand ? "#00FF00" : "#FF0000", // Green for left, Red for right
    });
    drawingUtils.drawConnectors(
      handLandmarks[i],
      HandLandmarker.HAND_CONNECTIONS,
      {
        color: isLeftHand ? "#00CC00" : "#CC0000", // Darker green for left, darker red for right
        lineWidth: 2,
      }
    );

    // Add text label for debugging
    const hand = isLeftHand ? "Left" : "Right";
    if (handLandmarks[i].length > 0) {
      // Use the wrist position for the label
      const wrist = handLandmarks[i][0];
      ctx.fillStyle = isLeftHand ? "#00FF00" : "#FF0000";
      ctx.font = "16px Arial";
      ctx.fillText(hand, wrist.x * canvas.width, wrist.y * canvas.height - 10);
    }
  }
}

/**
 * Extract pose landmarks from flat array
 * @param landmarks - Flat array of landmarks
 * @returns Array of pose landmark objects
 */
export function extractPoseLandmarks(landmarks: number[]) {
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
}

/**
 * Extract hand landmarks from flat array
 * @param landmarks - Flat array of landmarks
 * @returns Array of hand landmark arrays (left and right)
 */
export function extractHandLandmarks(landmarks: number[]) {
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

  // IMPORTANT: Always maintain the correct order - left hand first, then right hand
  // This ensures consistent visualization even if only one hand is present
  if (hasLeftHand) {
    hands.push(leftHandLandmarks);
    if (hasRightHand) {
      hands.push(rightHandLandmarks);
    }
  } else if (hasRightHand) {
    // If only right hand is detected, add a placeholder for the left hand
    // to maintain correct indexing (i=0 for left, i=1 for right)
    hands.push([{ x: 0, y: 0, z: 0 }]); // Empty placeholder for left hand
    hands.push(rightHandLandmarks);
  }

  return hands;
}

/**
 * Helper function to debug landmark data
 * Will log a summary of the landmarks to the console
 */
export function debugLandmarks(landmarks: number[]) {
  // Count non-zero values in each section
  const poseValues = landmarks.slice(0, NUM_POSE_LANDMARKS * 3);
  const leftHandValues = landmarks.slice(
    NUM_POSE_LANDMARKS * 3,
    NUM_POSE_LANDMARKS * 3 + NUM_HAND_LANDMARKS * 3
  );
  const rightHandValues = landmarks.slice(
    NUM_POSE_LANDMARKS * 3 + NUM_HAND_LANDMARKS * 3
  );

  const poseNonZero = poseValues.filter((v) => v !== 0).length;
  const leftHandNonZero = leftHandValues.filter((v) => v !== 0).length;
  const rightHandNonZero = rightHandValues.filter((v) => v !== 0).length;

  console.log("Landmark Summary:");
  console.log(`- Pose: ${poseNonZero}/${poseValues.length} non-zero values`);
  console.log(
    `- Left Hand: ${leftHandNonZero}/${leftHandValues.length} non-zero values`
  );
  console.log(
    `- Right Hand: ${rightHandNonZero}/${rightHandValues.length} non-zero values`
  );
  console.log(`- Total: ${landmarks.length} values`);

  // Sample some values from each section for verification
  if (poseNonZero > 0) {
    const firstNonZeroIdx = poseValues.findIndex((v) => v !== 0);
    console.log(
      `- Pose sample (index ${firstNonZeroIdx}): ${poseValues[firstNonZeroIdx]}`
    );
  }

  if (leftHandNonZero > 0) {
    const firstNonZeroIdx = leftHandValues.findIndex((v) => v !== 0);
    console.log(
      `- Left hand sample (index ${firstNonZeroIdx}): ${leftHandValues[firstNonZeroIdx]}`
    );
  }

  if (rightHandNonZero > 0) {
    const firstNonZeroIdx = rightHandValues.findIndex((v) => v !== 0);
    console.log(
      `- Right hand sample (index ${firstNonZeroIdx}): ${rightHandValues[firstNonZeroIdx]}`
    );
  }
}
