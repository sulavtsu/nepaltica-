import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { question, stockContext } = await request.json()

    const prompt = `You are a NEPSE stock market expert analyst for Nepal. 
    Current market data: ${stockContext}
    User question: ${question}
    Give a helpful, concise answer about Nepal stock market in 2-3 sentences.`

    const apiKey = process.env.GEMINI_API_KEY
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    console.log('Gemini response:', JSON.stringify(data))
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry I could not analyze this."

    return NextResponse.json({ answer: text })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ answer: "Error: " + error.message }, { status: 500 })
  }
}