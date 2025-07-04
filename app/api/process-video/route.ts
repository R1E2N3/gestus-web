// filepath: c:\\Users\\joaop\\Documents\\GitHub\\gestus-web\\app\\api\\process-video\\route.ts
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const sign = formData.get("sign") as string | null;

    if (!videoFile) {
      return NextResponse.json(
        { error: "No video file received." },
        { status: 400 }
      );
    }

    if (!sign) {
      return NextResponse.json(
        { error: "No sign parameter received." },
        { status: 400 }
      );
    }

    console.log(
      "Received video file:",
      videoFile.name,
      "Size:",
      videoFile.size,
      "Type:",
      videoFile.type,
      "Sign:",
      sign
    );

    // Forward the video to the Python backend
    const pythonBackendUrl = `${API_BASE_URL}/process`;
    if (!API_BASE_URL) {
      console.error("API_BASE_URL environment variable is not set.");
      return NextResponse.json(
        { error: "Backend API URL is not configured." },
        { status: 500 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("video", videoFile, videoFile.name);
    backendFormData.append("sign", sign);

    const backendResponse = await fetch(pythonBackendUrl, {
      method: "POST",
      body: backendFormData,
      // Add any necessary headers here, e.g., for authentication if your backend requires it
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Python backend error:", backendResponse.status, errorText);
      return NextResponse.json(
        {
          error: "Failed to process video with Python backend.",
          details: errorText,
        },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    // Transform the new backend response format to match frontend expectations
    if (backendData.status === 'success' && backendData.result) {
      const transformedResponse = {
        status: 'success',
        predictions: [
          {
            sign: backendData.result.sign,
            confidence: backendData.result.confidence,
            recognized: backendData.result.recognized,
            threshold: backendData.result.threshold
          }
        ]
      };
      return NextResponse.json(transformedResponse);
    }

    // Return the original response if it doesn't match the expected format
    return NextResponse.json(backendData);
  } catch (error) {
    console.error("Error processing video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process video.", details: errorMessage },
      { status: 500 }
    );
  }
}
