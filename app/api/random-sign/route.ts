import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/app/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // First fetch dataset statistics to see which sign has the least samples
    const statsResponse = await fetch(`${API_BASE_URL}/dataset-stats`);

    if (!statsResponse.ok) {
      throw new Error(`Dataset stats API error: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    // Extract sample counts from the stats response
    const sampleCounts = statsData.sampleCounts || {};

    // List of all available signs (should match the backend)
    const ALL_SIGNS = [
      "acontecer",
      "aluno",
      "amarelo",
      "america",
      "aproveitar",
      "bala",
      "banco",
      "banheiro",
      "barulho",
      "cinco",
      "conhecer",
      "espelho",
      "esquina",
      "filho",
      "maca",
      "medo",
      "ruim",
      "sapo",
      "vacina",
      "vontade",
    ];
    // Ensure all signs are included with at least 0 count
    const allCounts: Record<string, number> = {};
    ALL_SIGNS.forEach((sign) => {
      allCounts[sign] = sampleCounts[sign] || 0;
    });

    // Find the minimum count
    const minCount = Math.min(...Object.values(allCounts));

    // Find all signs with the minimum count
    const signsWithMinCount = Object.keys(allCounts).filter(
      (sign) => allCounts[sign] === minCount
    );

    // Randomly select one of the signs with minimum count
    const selectedSign =
      signsWithMinCount[Math.floor(Math.random() * signsWithMinCount.length)];

    // Return the sign with context information
    return NextResponse.json({
      sign: selectedSign,
      current_count: minCount,
      all_counts: allCounts,
      min_count: minCount,
      signs_with_min_count: signsWithMinCount,
    });
  } catch (error: any) {
    console.error("Error fetching sign with least samples:", error);

    // Fallback to local random selection if backend fails
    const SIGNS = [
      "acontecer",
      "aluno",
      "amarelo",
      "america",
      "aproveitar",
      "bala",
      "banco",
      "banheiro",
      "barulho",
      "cinco",
      "conhecer",
      "espelho",
      "esquina",
      "filho",
      "maca",
      "medo",
      "ruim",
      "sapo",
      "vacina",
      "vontade",
    ];

    const randomSign = SIGNS[Math.floor(Math.random() * SIGNS.length)];

    return NextResponse.json({
      sign: randomSign,
      fallback: true,
      error: "Backend unavailable, using fallback",
    });
  }
}
