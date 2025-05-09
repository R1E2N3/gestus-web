import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get JSON data from the request
    const data = await request.json();

    // Check if we have the required data
    if (!data || !data.sign || !data.frames) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing required data (sign or frames)",
        },
        { status: 400 }
      );
    }

    // Send the landmarks data to the Gestus API
    console.log("Sending data to Gestus API...");
    const apiUrl = "http://192.168.15.36:5001/submit-sign";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sign: data.sign,
        frames: data.frames,
      }),
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
    console.error("Error submitting sign:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to submit sign",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
} 