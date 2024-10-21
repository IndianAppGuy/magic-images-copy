'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from "next/link";

interface UserData {
  userId: string;
  username: string;
}

interface Model {
  id: string;
  model_name: string;
  training_id: string;
  status: 'ready' | 'training' | 'failed';
}

// Component to show user's initials in a circle with a gradient background
const UserInitials = ({ username }: { username: string }) => {
  const initials = username.slice(0, 2).toUpperCase(); // First 2 letters of username

  return (
    <div className="fixed top-4 right-4 flex items-center justify-center h-10 w-10 rounded-full text-white text-sm font-bold bg-gradient-to-br from-blue-400 to-purple-600">
      {initials}
    </div>
  );
}

export default function MagicImagesPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const router = useRouter();

  const promptOptions = [
    "person giving a TEDx keynote",
    "business professional in a corporate",
    "An entrepreneur presenting at a startup conference in a modern auditorium",
    "DSLR shot street photo of person",
    "person in paris"
  ];

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }

      const session: Session | null = data?.session || null;

      if (session) {
        const userData: UserData = {
          userId: session.user.id,
          username: session.user.email || 'hi',
        };
        setUser(userData);
        await fetchModels(userData.userId);
      } else {
        console.error('User not authenticated, redirecting to home...');
        router.push('/sign-up'); // Redirect unauthenticated users
      }
    }

    const fetchModels = async (userId: string) => {
      const response = await fetch(`/api/getModels?userId=${userId}`);
      const data = await response.json();
      setModels(data.models);
      setModelLoading(false);
    }

    fetchSession();
  }, [router]);

  const handlePromptOptionClick = (option: string) => {
    setPrompt(option);
  };

  const ModelSkeleton = () => {
    return (
      <div className="relative rounded-lg h-24 w-24 animate-pulse">
        <div className="w-24 h-24 bg-gray-300 rounded-md mx-auto"></div>
      </div>
    );
  };

  const handleGenerateImage = async () => {
    if (prompt.trim() && selectedModel) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model_name: selectedModel.model_name,
            model_id: selectedModel.id,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Assuming the response contains a URL to the generated image
          setGeneratedImage(data.imageUrl); // Set the image URL from the response
        } else {
          console.error('Error in API response:', data);
        }
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleModelSelection = (model: Model) => {
    setSelectedModel(model);
  };

  const handleAdvancedPrompt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setLoading(isChecked);
    
    console.log("Advanced Prompt Checkbox Clicked:", isChecked); // Debug log

    if (isChecked) {
      if (selectedModel) {
        setLoading(true);
        try {
          const response = await fetch('/api/advanced-prompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt,
              model_name: selectedModel.model_name,
            }),
          });

          // Debug log to check the response
          const data = await response.json();
          console.log("Response from API:", data);

          if (response.ok) {
            setPrompt(data.prompt); // Set the new prompt from the response
          } else {
            console.error('Error in API response:', data);
          }
        } catch (error) {
          console.error('Error fetching advanced prompt:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn('No model selected. Please select a model to generate an advanced prompt.');
      }
    }
  };

  return (
    <>
      <header className="m-2">
        <Link href='/dashboard' className="text-3xl font-bold">MagicImages</Link>
      </header>

      {/* User Initials in the top-right corner */}
      {user && <UserInitials username={user.username} />}

      <div className="container mx-auto max-w-4xl px-4 md:px-0 md:mb-2">
        <section className="mb-8">
          <h2 className="text-xl mb-4">Your Models</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-wrap gap-4">
            {modelLoading
              ? Array(3).fill(0).map((_, idx) => <ModelSkeleton key={idx} />)
              : models.map((model) => (
                <div
                  key={model.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer flex items-center justify-center h-24 w-24 ${selectedModel?.id === model.id ? 'border-gray-700' : 'border-gray-300'} ${model.status === 'ready' ? 'bg-green-50' : model.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'}`}
                  onClick={() => handleModelSelection(model)}
                >
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${model.status === 'ready' ? 'bg-green-500' : model.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></span>
                    <span className={`text-xs font-medium ${model.status === 'ready' ? 'text-green-600' : model.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {model.status === 'ready' ? 'Ready' : model.status === 'failed' ? 'Failed' : 'Training'}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-center">{model.model_name}</div>
                </div>
              ))}
            <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-24 w-24 cursor-pointer">
              <Link href='/dashboard/create-model' className="h-full w-full">
                <Button variant="outline" className="h-full w-full text-gray-600">
                  <div className='flex flex-col'>
                    <span className='text-md'>+</span>
                    Create New
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl mb-4">Prompt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <textarea
                placeholder="Enter your prompt here"
                className="w-full resize-y min-h-[8rem] overflow-auto transparent-container p-2 border text-sm font-normal border-gray-300 rounded"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="advanced-prompt" 
                    checked={loading} 
                    onChange={handleAdvancedPrompt} 
                    className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                  />
                  <span className="ml-2 text-sm font-medium leading-none">Advanced Prompt</span>
                </label>
                {loading && (
                  <div className="animate-spin m-2 flex justify-center items-center rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Prompt Options:</p>
                {promptOptions.map((option, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePromptOptionClick(option)}
                    className="mr-2 mb-2"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button onClick={handleGenerateImage} disabled={!prompt.trim() || !selectedModel}>
                Generate Image
              </Button>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-64">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-sm text-gray-500">Generating image...</p>
                </>
              ) : (
                <>
                  {generatedImage ? (
                    <Image src={generatedImage} alt="Generated" layout="fill" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Images will be generated here.
                      <br />
                      Enter a prompt and click &quot;Generate Image&quot; to start.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
