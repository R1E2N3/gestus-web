import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // Fetch dataset statistics
    const statsResponse = await fetch(`${API_BASE_URL}/dataset-stats`);
    if (!statsResponse.ok) {
      throw new Error(`Error fetching dataset stats: ${statsResponse.status}`);
    }
    const statsData = await statsResponse.json();

    // Fetch sample data with landmarks
    const samplesResponse = await fetch(`${API_BASE_URL}/dataset-samples`);
    if (!samplesResponse.ok) {
      console.log(samplesResponse);
      throw new Error(
        `Error fetching dataset samples: ${samplesResponse.status}`
      );
    }
    const samplesData = await samplesResponse.json();
    // Combine the data
    const combinedData = {
      totalSamples: statsData.totalSamples || 0,
      sampleCounts: statsData.sampleCounts || {},
      samples: samplesData.samples || [],
    };

    return NextResponse.json(combinedData);
  } catch (error: any) {
    console.error("Error fetching dataset samples:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dataset samples",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
