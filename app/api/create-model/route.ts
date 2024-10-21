import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Parse the incoming FormData
    const formData = await request.formData();
    const zipFile = formData.get('zipFile') as File | null;
    const modelName = formData.get('modelName') as string | null;
    const userId = formData.get('userId') as string; // Ensure userId is typed correctly
    const email = formData.get('username') as string; // Ensure username is typed correctly

    if (!zipFile || !modelName || !userId || !email) {
      return NextResponse.json(
        { error: 'Zip file, model name, user ID, or username not provided.' },
        { status: 400 }
      );
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not set' },
        { status: 500 }
      );
    }

    // Step 1: Upload the ZIP file to Supabase storage
    const { error: uploadError } = await supabase
      .storage
      .from('magic-images-zips') // Replace with your bucket name
      .upload(`models/${userId}/${zipFile.name}`, zipFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading ZIP file to Supabase:', uploadError);
      return NextResponse.json({ error: 'Failed to upload ZIP file.' }, { status: 500 });
    }

    // Get the public URL for the uploaded file
    const { data } = supabase
      .storage
      .from('magic-images-zips') // Replace with your bucket name
      .getPublicUrl(`models/${userId}/${zipFile.name}`);

      const publicURL = data?.publicUrl; // Access publicUrl from the data object

      if (!publicURL) { // Check if publicURL is undefined
        console.error('Error getting public URL: Public URL is undefined');
        return NextResponse.json({ error: 'Failed to get public URL.' }, { status: 500 });
      }

    console.log('ZIP file uploaded to Supabase:', publicURL);

    // Step 2: Create the destination model on Replicate
    const createModelResponse = await fetch('https://api.replicate.com/v1/models', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: 'notnick2', // Change this to the actual model owner as needed
        name: `flux-${modelName}`, // model name
        description: `A fine-tuned flux.1 model of ${modelName} by ${email}`, // description
        visibility: 'private', // visibility
        hardware: 'gpu-t4', // hardware
      }),
    });

    if (!createModelResponse.ok) {
      const errorResponse = await createModelResponse.json();
      console.error('Error creating model:', errorResponse);
      return NextResponse.json({ error: 'Failed to create model.' }, { status: 500 });
    }

    const model = await createModelResponse.json();
    console.log('Model created:', model);

    // Step 4: Start the training process
    const triggerWord = modelName; // Define a unique trigger word here

    const trainingResponse = await fetch(`https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/d995297071a44dcb72244e6c19462111649ec86a9646c32df56daa7f14801944/trainings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: `${model.owner}/${model.name}`,
        input: {
          input_images: publicURL,
          trigger_word: triggerWord,
        },
      }),
    });

    if (!trainingResponse.ok) {
      const errorResponse = await trainingResponse.json();
      console.error('Error starting training:', errorResponse);
      return NextResponse.json({ error: 'Training failed to start.' }, { status: 500 });
    }

    const training = await trainingResponse.json();

    // Step 5: Save model info to Supabase
    const { error: insertError } = await supabase
      .from('models')
      .insert([{
        user_id: userId, // Storing the current user's ID
        model_name: modelName,
        training_id: training.id,
      }]);

    if (insertError) {
      console.error('Failed to save model to the database:', insertError);
      return NextResponse.json({ error: 'Failed to save model to the database.' }, { status: 500 });
    }

    // Respond with the training URL
    return NextResponse.json({
      message: 'Training started successfully',
      trainingUrl: `https://replicate.com/p/${training.id}`,
      publicURL,
    });
  } catch (error) {
    // Specify a more specific error type
    console.error('Error creating model or training:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
