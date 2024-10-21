'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import JSZip from 'jszip';

interface UserData {
  userId: string;
  username: string;
}

export default function CreateModelPage() {

  const [modelName, setModelName] = useState('');
  const [loading, setloading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();


  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }

      const session: Session | null = data?.session || null; // Type declaration for session

      if (session) {
        // Create a user object with userId and username
        const userData: UserData = {
          userId: session.user.id,
          username: session.user.email || 'hi',
        };
        setUser(userData);
      } else {
        console.error('User not authenticated, redirecting to home...');
        router.push('/sign-up'); // Redirect unauthenticated users
      }

    };

    fetchSession();
  }, [router]);



  useEffect(() => {
    
      // Generate image previews
      const previews = uploadedImages.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);

      // Cleanup function to revoke object URLs when component unmounts or images change
      return () => {
        previews.forEach((preview) => URL.revokeObjectURL(preview));
      };
    
  }, [uploadedImages]); // Depend on uploadedImages and loading

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files);
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setloading(true);
    // Create a new instance of JSZip
    const zip = new JSZip();

    // Rename images and add them to the zip
    for (let i = 0; i < uploadedImages.length; i++) {
      const file = uploadedImages[i];
      const newFileName = `${modelName}-0${i + 1}.jpg`; // Change extension if needed
      zip.file(newFileName, file);
    }

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Convert the Blob to a File for FormData
    const zipFile = new File([zipBlob], `${modelName}.zip`, { type: 'application/zip' });

    // Prepare the form data for the API
    const formData = new FormData();
    formData.append('zipFile', zipFile);  // Append the File
    formData.append('modelName', modelName);

    if (user) { // Check if user is not null
      formData.append('userId', user.userId);
      formData.append('username', user.username);
    }

    // Send the data to the server
    try {
      const response = await fetch('/api/create-model', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setloading(false);
        setMessage('your model has created successfully wait while we create something suprising :)')
        console.log('Model created:', result);
        router.push('/dashboard');
      } else {
        setloading(false);
        setMessage('Failed to create model, please try again later :(')
        console.error('Failed to create model:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating model:', error);
    }
  };

  return (
    <>
      <header className="m-4">
        <Link href='/dashboard' className="text-3xl font-bold">MagicImages</Link>
      </header>
      <div className="container mx-auto px-4 py-8 mt-10 flex flex-col items-center">
        <main className="flex-grow flex flex-col items-center">
          <h2 className="text-3xl font-bold text-center mb-8">Create Your Model in Less Than an Hour!</h2>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                placeholder="Create the most unique name for your model ex. alex21"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label>Upload Images</Label>
              <p className="text-sm text-gray-500 mb-2">Upload 10-15 high quality images of yourself.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="imageUpload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  Click or drop your images here
                </label>
                {imagePreviews.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={src}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={96} // Set fixed width
                          height={96} // Set fixed height
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 text-red-500 text-xl font-extrabold"
                          onClick={() => handleImageRemove(index)}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Model
            </Button>
            
            
          </form>
            {loading && <div className="animate-spin m-5 flex justify-center items-center rounded-full h-8 w-8 border-b-2 border-gray-900"></div>}
            {message && <div className='m-6'>{message}</div>}
        </main>
      </div>
    </>
  );
}
