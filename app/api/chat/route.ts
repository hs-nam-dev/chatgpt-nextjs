import { NextRequest, NextResponse } from "next/server";
import { ChatSettingsType } from "@/components/chatSettings";

const GPT_VISION_API_URL = "https://api.openai.com/v1/images/generations";

export async function POST(req: NextRequest) {
  const { messages, settings, image } = await req.json();
  const apiKey = req.headers.get('Authorization')?.split(' ')[1];

  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API key is required" }, { status: 401 });
  }

  if (image) {
    // Handle image request
    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(GPT_VISION_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to call GPT-4 Vision API");
      }

      const data = await response.json();
      return NextResponse.json({ success: true, content: data });
    } catch (error: any) {
      console.error('Error calling GPT-4 Vision API:', error);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to call GPT-4 Vision API", 
        details: error.message 
      }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
}
