import { type NextRequest, NextResponse } from "next/server"

/**
 * AI Meal Photo Analysis Endpoint
 * Analyzes meal photos using Claude 3.5 Sonnet with Vision capabilities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, description, userId } = body

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY not configured")
      return NextResponse.json(
        {
          error: "AI service not configured",
          foodItems: [],
          calories: 500,
          protein: 30,
          carbs: 50,
          fat: 20,
          confidence: 30,
          analysis: "Image analysis not available - please configure API key",
        },
        { status: 200 },
      )
    }

    // Prepare the image data (should be base64 encoded)
    let imageData = image

    // If image is a URL, we need to fetch and convert to base64
    if (image.startsWith("http://") || image.startsWith("https://")) {
      try {
        const imageResponse = await fetch(image)
        const arrayBuffer = await imageResponse.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg"
        imageData = `data:${mimeType};base64,${base64}`
      } catch (error) {
        console.error("Error fetching image:", error)
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 })
      }
    }

    // Ensure proper data URI format
    if (!imageData.startsWith("data:")) {
      // Assume it's base64 without the data URI prefix
      imageData = `data:image/jpeg;base64,${imageData}`
    }

    // Call OpenRouter API with vision
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "FitGrit AI - Meal Photo Analysis",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageData,
                },
              },
              {
                type: "text",
                text: `Analyze this meal photo and provide detailed nutritional information.

${description ? `User description: "${description}"` : ""}

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting, no explanations outside the JSON.

Your response must be a single JSON object with this exact structure:
{
  "foodItems": ["item 1", "item 2", ...],
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams>,
  "sugar": <number in grams>,
  "sodium": <number in milligrams>,
  "confidence": <number 0-100>,
  "analysis": "<detailed description of what you see and your reasoning>",
  "suggestions": "<brief actionable suggestion for the user>",
  "portionEstimate": "<your estimate of the portion size>"
}

Be as accurate as possible. Consider:
- Portion sizes visible in the image
- Cooking methods (fried, grilled, etc.)
- Any visible sauces or toppings
- Standard nutrition databases (USDA, etc.)`,
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)
      throw new Error(`OpenRouter API failed: ${response.status}`)
    }

    const data = await response.json()
    let content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content in AI response")
    }

    // Clean up the response - remove markdown code blocks if present
    content = content.trim()
    if (content.startsWith("```json")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (content.startsWith("```")) {
      content = content.replace(/```\n?/g, "")
    }

    // Parse the JSON response
    let analysis
    try {
      analysis = JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse AI response:", content)
      console.error("Parse error:", parseError)
      throw new Error("Invalid JSON response from AI")
    }

    // Validate and normalize the response
    const result = {
      foodItems: Array.isArray(analysis.foodItems) ? analysis.foodItems : [],
      calories: Math.round(Number(analysis.calories) || 0),
      protein: Math.round(Number(analysis.protein) || 0),
      carbs: Math.round(Number(analysis.carbs) || 0),
      fat: Math.round(Number(analysis.fat) || 0),
      fiber: Math.round(Number(analysis.fiber) || 0),
      sugar: Math.round(Number(analysis.sugar) || 0),
      sodium: Math.round(Number(analysis.sodium) || 0),
      confidence: Math.min(100, Math.max(0, Math.round(Number(analysis.confidence) || 60))),
      analysis: String(analysis.analysis || "Meal analyzed from photo"),
      suggestions: String(analysis.suggestions || "Great choice! Keep tracking your nutrition."),
      portionEstimate: String(analysis.portionEstimate || "Standard portion"),
    }

    console.log("Photo analysis result:", result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Meal photo analysis error:", error)

    // Return fallback estimates
    return NextResponse.json(
      {
        foodItems: ["Unknown meal"],
        calories: 400,
        protein: 25,
        carbs: 45,
        fat: 15,
        fiber: 5,
        sugar: 8,
        sodium: 400,
        confidence: 30,
        analysis: "Unable to analyze photo - using general estimates",
        suggestions: "Try adding a description for more accurate analysis",
        portionEstimate: "Unknown",
      },
      { status: 200 },
    )
  }
}

