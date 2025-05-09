import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // Fetch dataset statistics from the backend API
    const response = await fetch(
      `${API_BASE_URL}/dataset-stats`
    );

    if (!response.ok) {
      throw new Error(`Error fetching dataset stats: ${response.status}`);
    }

    const data = await response.json();

    // Return the stats directly
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching dataset stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dataset statistics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
