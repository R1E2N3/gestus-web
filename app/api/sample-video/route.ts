import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sign = searchParams.get("sign");

    if (!sign) {
      return NextResponse.json(
        { error: "Sign parameter is required" },
        { status: 400 }
      );
    }

    // Make a request to the backend API
    const response = await fetch(
      `${API_BASE_URL}/get-sample-video?sign=${sign}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "No sample video found for this sign" },
          { status: 404 }
        );
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({
        video_url: data.video_url,
        video_name: data.video_name,
      });
    } else {
      return NextResponse.json(
        { error: data.error || "Failed to fetch sample video" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error fetching sample video:", error);
    return NextResponse.json(
      { error: "Failed to fetch sample video" },
      { status: 500 }
    );
  }
}
