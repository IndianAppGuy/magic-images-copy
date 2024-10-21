import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

// Define a type for the model
interface Model {
  id: string;          // Adjust the type based on your schema
  model_name: string;  // Adjust the type based on your schema
  training_id: string; // Adjust the type based on your schema
}

// Named export for the GET method
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch models from Supabase
    const { data: models, error } = await supabase
      .from('models') // Specify the type here for the row
      .select('id, model_name, training_id')
      .eq('user_id', userId)
      .then(result => {
        // This ensures that 'data' is correctly typed as Model[]
        return { data: result.data as Model[], error: result.error };
      });

    if (error) {
      throw new Error(error.message);
    }

    // Fetch the status of each model from Replicate API
    const modelsWithStatus = await Promise.all(
      models.map(async (model) => {
        const replicateResponse = await fetch(`https://api.replicate.com/v1/trainings/${model.training_id}`, {
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        const replicateData = await replicateResponse.json();
        console.log(replicateData);
        const status = replicateData.status === 'succeeded' 
          ? 'ready' 
          : (replicateData.status === 'failed' ? 'failed' : 'training');

        return {
          id: model.id,
          model_name: model.model_name,
          status: status,
        };
      })
    );

    return NextResponse.json({ models: modelsWithStatus });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Error fetching models' }, { status: 500 });
  }
}
