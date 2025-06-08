import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sampleId } = await params;

    if (!sampleId) {
      return NextResponse.json(
        { error: "Sample ID is required" },
        { status: 400 }
      );
    }

    // Fetch landmarks for the specific sample from the backend API
    const response = await fetch(
      `${API_BASE_URL}/sample-landmarks/${sampleId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Sample not found" },
          { status: 404 }
        );
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching sample landmarks:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sample landmarks",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
