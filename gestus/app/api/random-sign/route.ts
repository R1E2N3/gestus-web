import { NextRequest, NextResponse } from "next/server";

// List of available signs - should match the API's sign list
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

export async function GET(request: NextRequest) {
  try {
    // Select a random sign
    const randomSign = SIGNS[Math.floor(Math.random() * SIGNS.length)];

    // Return the sign
    return NextResponse.json({ sign: randomSign });
  } catch (error: any) {
    console.error("Error generating random sign:", error);
    return NextResponse.json(
      {
        error: "Failed to generate random sign",
      },
      { status: 500 }
    );
  }
}
