// pages/auth/callback.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { hash } = window.location;

      if (hash) {
        // Parse the access token and refresh token from the URL
        const params = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          // Store the tokens in local storage
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken ?? '');

          // Clear the URL hash
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } else {
          console.error('No access token found in the URL.');
          return; // Exit if no access token found
        }
      }

      // Now check for the session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        return;
      }

      // If a session exists, redirect to the dashboard
      if (data?.session) {
        // Redirect to dashboard without any tokens in the URL
        router.push('/dashboard');
      }
    };

    handleAuth();
  }, [router]);

  return <div>Processing your login...</div>;
};

export default AuthCallback;
