import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Named export for the POST method
export async function POST(req: NextRequest) {
  const { prompt, model_name } = await req.json();  // Get the JSON body from the request

  console.log('POST request received with:', { prompt, model_name });  // Log the request details

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": `You are a prompt engineer for image generation. Provide very long and detailed prompts to generate high-quality images of a person in different scenarios. It is important to name the person in every prompt that you generate as it helps the image-generating models identify the person; you should always refer to the person with the trigger word and the trigger word is given as ${model_name}. Make this prompt better: ${prompt}. Make sure you have the trigger word in the prompt referring to the person and make the prompt long and detailed, elaborating on each and every detail to get the best realistic images.only return the prompt nothing else only prompt no explanation, greetings, description or anything just return the prompt `
        }
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return NextResponse.json({ prompt: response.choices[0].message.content });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json({ error: 'Error generating prompt' }, { status: 500 });
  }
}
