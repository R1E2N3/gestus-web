import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Get FormData from the request
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const sign = formData.get("sign") as string | null;

    // Check if we have the required data
    if (!videoFile) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing video file",
        },
        { status: 400 }
      );
    }

    if (!sign) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing sign name",
        },
        { status: 400 }
      );
    }

    console.log(
      "Received contribution:",
      "Sign:",
      sign,
      "Video:",
      videoFile.name,
      "Size:",
      videoFile.size,
      "Type:",
      videoFile.type
    );

    // Send the video data to the Gestus API
    console.log("Sending video to Gestus API...");
    const apiUrl = `${API_BASE_URL}/contribute`;

    if (!API_BASE_URL) {
      console.error("API_BASE_URL environment variable is not set.");
      return NextResponse.json(
        {
          status: "error",
          error: "Backend API URL is not configured.",
        },
        { status: 500 }
      );
    }

    // Create FormData for the backend
    const backendFormData = new FormData();
    backendFormData.append("video", videoFile, videoFile.name);
    backendFormData.append("sign", sign);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: backendFormData,
    });

    // Check for non-JSON responses first
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("API returned non-JSON response:", errorText);
      return NextResponse.json(
        {
          status: "error",
          error: `External API error (${response.status}): The API returned an invalid response format`,
          details: errorText.substring(0, 500), // Include part of the error for debugging
        },
        { status: 502 } // Bad Gateway - appropriate for upstream service failure
      );
    }

    // Now we can safely parse as JSON
    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          error: responseData.error || `API Error: ${response.status}`,
          details: responseData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error submitting contribution:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to submit contribution",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
