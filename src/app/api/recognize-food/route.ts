import { NextRequest, NextResponse } from "next/server";

const PROMPT = `You are a food inventory assistant. Identify the fruit or vegetable in this image.
Respond with ONLY a JSON object in this exact format, no other text:
{
  "name": "string (common name, e.g. 'Banana')",
  "category": "fruit | vegetable",
  "quantity": number (estimate count or weight in grams if a bunch/bag),
  "unit": "pcs | g | kg | bunch",
  "estimated_shelf_life_days": number (days from today at room temp),
  "refrigerated_shelf_life_days": number (days from today if refrigerated),
  "confidence": "high | medium | low"
}
If you cannot identify a food item, return { "error": "not_recognized" }`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let image: string;
  try {
    ({ image } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // image is a base64 data URL: "data:image/jpeg;base64,..."
  const match = image.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  }
  const [, mediaType, base64Data] = match;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Claude API error:", response.status, errorText);
    return NextResponse.json({ error: "api_error" }, { status: 502 });
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) {
    return NextResponse.json({ error: "empty_response" }, { status: 502 });
  }

  // Parse JSON — strip markdown code fences if Claude wraps it
  const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  try {
    const parsed = JSON.parse(jsonStr);
    return NextResponse.json(parsed);
  } catch {
    // Try extracting raw JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      } catch {
        // fall through
      }
    }
    console.error("Failed to parse Claude response:", content);
    return NextResponse.json({ error: "parse_error" }, { status: 502 });
  }
}
