"use client";
// app\(auth-pages)\sign-up\page.tsx


import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";  
import Link from "next/link";
import Image from "next/image";

export default function Signup({ searchParams }: { searchParams: Message }) {
    const handleGoogleAuth = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`, // Set the redirect URL
          },
        });
      
        if (error) {
          console.error("Error during Google Auth:", error.message);
        }
      };

  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center justify-center h-screen bg-gray-100 text-black">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <header className="p-4 bg-gray-100">
        <Link href="/" className="text-3xl font-bold">
          MagicImages
        </Link>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form className="flex flex-col w-full max-w-md bg-white p-6 rounded shadow-lg">
          <h1 className="text-2xl font-medium text-black">Sign up</h1>
          <p className="text-sm text-foreground">
            Already have an account?{" "}
            <Link
              className="text-primary font-medium underline"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
          <div className="flex flex-col gap-2 mt-8">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              placeholder="you@example.com"
              required
              className="bg-white text-black"
            />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
              className="bg-white text-black"
            />
            {/* Fix signUpAction to return void */}
            <SubmitButton
              formAction={async (formData: FormData) => {
                try {
                  // Call your signUpAction logic here
                  const result = await signUpAction(formData);

                  if (result.error) {
                    // Handle the error (e.g., show a message to the user)
                    console.error(result.error);
                  }
                } catch (error) {
                  console.error("Sign-up failed", error);
                }
              }}
              pendingText="Signing up..."
            >
              Sign up
            </SubmitButton>
            <FormMessage message={searchParams} />

            {/* Google OAuth Signup Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 text-black rounded-lg shadow hover:bg-gray-50 transition"
              >
                {/* Inline Google Logo SVG */}
                <Image
                  src="/google-logo.svg" // Ensure the SVG file is placed in the public directory
                  alt="Google Logo"
                  width={24}
                  height={24}
                />
                Sign up with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
