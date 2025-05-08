import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get JSON data from the request
    const data = await request.json();

    // Check if we have the required data
    if (!data || !data.sign || !data.landmarks) {
      return NextResponse.json(
        {
          status: "error",
          error: "Missing required data (sign or landmarks)",
        },
        { status: 400 }
      );
    }

    // Send the landmarks data to the Gestus API
    const response = await fetch("https://gestus-api.onrender.com/contribute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sign: data.sign,
        landmarks: data.landmarks,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error submitting contribution:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to submit contribution",
      },
      { status: 500 }
    );
  }
}
