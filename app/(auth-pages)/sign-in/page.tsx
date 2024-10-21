"use client"
// app\(auth-pages)\sign-in\page.tsx

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";  
import Link from "next/link";
import Image from "next/image";

export default function Login({ searchParams }: { searchParams: Message }) {
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

  return (
    <>
      <header className="p-4 bg-gray-100">
        <Link href='/' className="text-3xl font-bold">MagicImages</Link>
      </header>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form className="w-full max-w-md bg-white text-black p-6 rounded shadow-lg">
          <h1 className="text-2xl font-medium">Sign in</h1>
          <p className="text-sm">
            Don&apos;t have an account?{" "}
            <Link className="font-medium underline" href="/sign-up">
              Sign up
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link className="text-xs underline" href="/forgot-password">
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              required
              className="bg-white text-black"
            />
            <SubmitButton pendingText="Signing In..." formAction={signInAction}>
              Sign in
            </SubmitButton>
            <FormMessage message={searchParams} />

            {/* Google OAuth Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 text-black rounded-lg shadow hover:bg-gray-50 transition"
              >
                {/* Google Logo */}
                <Image
                  src="/google-logo.svg"  // Ensure the SVG file is placed in the public directory
                  alt="Google Logo"
                  width={24}
                  height={24}
                />
                Sign in with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
