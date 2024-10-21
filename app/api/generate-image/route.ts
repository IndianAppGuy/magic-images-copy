// app/api/generate-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

// Initialize Replicate with your API key (make sure to keep this secure)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY, // Use an environment variable for your API key
});

const replicate_username = process.env.REPLICATE_USER_NAME

console.log(replicate_username);

interface GenerateImageRequest {
  prompt: string;
  model_name: string;
  model_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, model_name}: GenerateImageRequest = await req.json();

    // Construct the model identifier
    const model = `${replicate_username}/flux-${model_name}`;

    // Generate the image using Replicate
    const output = await replicate.run(model as `${string}/${string}`, {
      input: { prompt },
    });

    return NextResponse.json({ imageUrl: output }, { status: 200 });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}
