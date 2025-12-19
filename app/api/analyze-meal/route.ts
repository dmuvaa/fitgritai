import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, userId } = body

    if (!description) {
      return NextResponse.json({ error: "Meal description is required" }, { status: 400 })
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    // Call OpenRouter API for meal analysis with robust configuration
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "FitGrit Meal Analyzer",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        // provider: {
        //   order: ["OpenAI", "Anthropic"],
        //   allow_fallbacks: true 
        // },
        messages: [
          {
            role: "system",
            content: `You are a professional nutritionist AI. Analyze meals and provide accurate nutritional information.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown formatting, no code blocks, no explanations outside the JSON.

Your response must be a single JSON object with this exact structure:
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams>,
  "sugar": <number in grams>,
  "sodium": <number in milligrams>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation of your estimates>",
  "suggestions": "<brief actionable suggestion for the user>"
}

Be as accurate as possible based on standard nutrition databases (USDA, etc.). Consider portion sizes carefully.`,
          },
          {
            role: "user",
            content: `Analyze this meal and provide detailed nutrition information: ${description}`,
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
    console.log("OpenRouter response:", JSON.stringify(data, null, 2))

    let content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No content in AI response")
    }

    // Clean up the response - remove markdown code blocks if present
    content = content.trim()
    if (content.startsWith("```json")) {
      content = content.replace(/```json\s*([\s\S]*?)\s*```/, "$1")
    } else if (content.startsWith("```")) {
      content = content.replace(/```\s*([\s\S]*?)\s*```/, "$1")
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
      calories: Math.round(Number(analysis.calories) || 0),
      protein: Math.round(Number(analysis.protein) || 0),
      carbs: Math.round(Number(analysis.carbs) || 0),
      fat: Math.round(Number(analysis.fat) || 0),
      fiber: Math.round(Number(analysis.fiber) || 0),
      sugar: Math.round(Number(analysis.sugar) || 0),
      sodium: Math.round(Number(analysis.sodium) || 0),
      confidence: Math.min(100, Math.max(0, Math.round(Number(analysis.confidence) || 75))),
      reasoning: String(analysis.reasoning || "Nutritional analysis based on standard food databases"),
      suggestions: String(analysis.suggestions || "Great meal choice! Keep tracking your nutrition."),
    }

    console.log("Meal analysis result:", result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Meal analysis error:", error)

    // Return fallback estimates instead of failing
    return NextResponse.json(
      {
        calories: 400,
        protein: 25,
        carbs: 45,
        fat: 15,
        fiber: 5,
        sugar: 8,
        sodium: 400,
        confidence: 40,
        reasoning: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        suggestions: "Please try again or enter details manually.",
      },
      { status: 200 },
    )
  }
}
