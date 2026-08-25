import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "API Key is missing, my love! ❤️", theme: "romantic" }, { status: 500 });
    }

    const prompt = `You are a sweet, loving, and romantic AI companion for a girlfriend. 
    Analyze the user message: "${lastMessage}".
    Respond back in strict JSON format with two keys:
    1. "reply": Your loving, sweet response to her.
    2. "theme": One of these exact keywords based on the mood: "romantic", "cute", "passion", "dreamy".
    
    Example format: {"reply": "I love you so much!", "theme": "romantic"}`;

    // জেমিনির কথামতো এখানে gemini-3.6-flash মডেল ব্যবহার করা হয়েছে
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiRes.json();
    
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return NextResponse.json({
        reply: data.error.message || "Aww, my heart is warming up for you! Tell me again? 💕",
        theme: "romantic"
      });
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let jsonResult;
    try {
      const cleanedText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonStartIndex = cleanedText.indexOf('{');
      const jsonEndIndex = cleanedText.lastIndexOf('}');
      const finalJsonString = (jsonStartIndex !== -1 && jsonEndIndex !== -1) 
        ? cleanedText.substring(jsonStartIndex, jsonEndIndex + 1) 
        : cleanedText;

      jsonResult = JSON.parse(finalJsonString);
    } catch (e) {
      jsonResult = {
        reply: textResponse || "I am always here for you, my love! ❤️",
        theme: "romantic"
      };
    }

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { reply: "Aww, my heart skipped a beat! Tell me again, sweetie? 💕", theme: "romantic" },
      { status: 500 }
    );
  }
}