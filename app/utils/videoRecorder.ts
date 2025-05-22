/**
 * Utility for recording video from a webcam stream in a web browser
 */

/**
 * Creates and configures a MediaRecorder to record video from a MediaStream
 *
 * @param stream - The MediaStream to record from (typically from getUserMedia)
 * @param options - Configuration options
 * @returns An object with methods to control the recording
 */
export function createVideoRecorder(
  stream: MediaStream,
  options: {
    mimeType?: string;
    videoBitsPerSecond?: number;
    audioBitsPerSecond?: number;
    onDataAvailable?: (data: Blob) => void;
  } = {}
) {
  // Default options
  const defaults = {
    mimeType: getBestMimeType(),
    videoBitsPerSecond: 2500000, // 2.5 Mbps
    audioBitsPerSecond: 128000, // 128 kbps
  };

  const config = { ...defaults, ...options };
  const recordedChunks: Blob[] = [];

  // Create MediaRecorder instance
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: config.mimeType,
    videoBitsPerSecond: config.videoBitsPerSecond,
    audioBitsPerSecond: config.audioBitsPerSecond,
  });

  // Set up data handler
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
      if (config.onDataAvailable) {
        config.onDataAvailable(event.data);
      }
    }
  };

  return {
    /**
     * Start recording
     * @param timeslice - Optional millisecond interval to generate data (e.g., 1000 for 1s chunks)
     */
    start: (timeslice?: number) => {
      recordedChunks.length = 0; // Clear previous recording
      mediaRecorder.start(timeslice);
    },

    /**
     * Stop recording
     * @returns Promise that resolves to the complete recording as a Blob
     */
    stop: () => {
      return new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const recordedBlob = new Blob(recordedChunks, {
            type: config.mimeType,
          });
          resolve(recordedBlob);
        };
        mediaRecorder.stop();
      });
    },

    /**
     * Pause recording
     */
    pause: () => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.pause();
      }
    },

    /**
     * Resume a paused recording
     */
    resume: () => {
      if (mediaRecorder.state === "paused") {
        mediaRecorder.resume();
      }
    },

    /**
     * Check if recording is active
     */
    isRecording: () => mediaRecorder.state === "recording",

    /**
     * Get all recorded chunks
     */
    getChunks: () => [...recordedChunks],

    /**
     * Get the complete recording as a Blob
     */
    getBlob: () => new Blob(recordedChunks, { type: config.mimeType }),

    /**
     * Get recorder state
     */
    getState: () => mediaRecorder.state,
  };
}

/**
 * Creates a video recorder that captures both webcam and canvas overlay
 * Useful for recording video with landmark visualization
 *
 * @param videoElement - Source video element (webcam)
 * @param width - Output video width
 * @param height - Output video height
 * @param drawCallback - Function to draw overlays on each frame
 * @returns Video recorder instance
 */
export function createVideoWithOverlayRecorder(
  videoElement: HTMLVideoElement,
  width: number,
  height: number,
  drawCallback?: (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement
  ) => void
) {
  // Create a canvas element for compositing
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Create a stream from the canvas
  const canvasStream = canvas.captureStream(30); // 30 fps

  // Create recorder from the canvas stream
  const recorder = createVideoRecorder(canvasStream);

  // Animation frame reference
  let animationFrameId: number | null = null;

  // Draw function that composites video and overlay
  const drawFrame = () => {
    // Draw video frame
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Call the custom draw callback if provided
    if (drawCallback) {
      drawCallback(ctx, videoElement);
    }

    // Continue loop if recording
    if (recorder.isRecording()) {
      animationFrameId = requestAnimationFrame(drawFrame);
    }
  };

  // Extend the recorder with custom start/stop methods
  return {
    ...recorder,

    // Override start to begin the draw loop
    start: (timeslice?: number) => {
      recorder.start(timeslice);
      animationFrameId = requestAnimationFrame(drawFrame);
    },

    // Override stop to end the draw loop
    stop: async () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      return recorder.stop();
    },
  };
}

/**
 * Utility function to get the best supported mime type for video recording
 */
function getBestMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // Fallback
  return "video/webm";
}

/**
 * Convert a Blob to a File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Creates a form data object with the video recording
 */
export function createVideoFormData(
  videoBlob: Blob,
  filename: string = "recording.webm",
  additionalData: Record<string, string> = {}
): FormData {
  const formData = new FormData();
  const videoFile = blobToFile(videoBlob, filename);

  formData.append("video", videoFile);

  // Add any additional form data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}
