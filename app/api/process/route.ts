import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get JSON data from the request
    const requestData = await request.json();

    if (!requestData || !requestData.landmarks) {
      return NextResponse.json(
        { status: "error", error: "No landmarks provided" },
        { status: 400 }
      );
    }

    const landmarks = requestData.landmarks;

    if (!Array.isArray(landmarks) || landmarks.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid landmarks format or empty landmarks array",
        },
        { status: 400 }
      );
    }

    // For development purposes, we'll send this to our AI model API
    // This should point to where your Flask API is hosted
    const modelApiUrl =
      process.env.MODEL_API_URL || "https://gestus-api.onrender.com/process";

    // Forward the request to the model API
    const modelResponse = await fetch(modelApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ landmarks }),
    });

    if (!modelResponse.ok) {
      throw new Error(
        `Model API responded with status: ${modelResponse.status}`
      );
    }

    const modelData = await modelResponse.json();

    // Return the model response
    return NextResponse.json(modelData);
  } catch (error) {
    console.error("Error in process API route:", error);
    return NextResponse.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        message: "Server error occurred",
      },
      { status: 500 }
    );
  }
}
