'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

// Renamed the original component
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/'; // Default redirect

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCredentialsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Login failed:", result.error);
        let errorMessage = 'Login failed. Please try again.'; // Default error message

        switch (result.error) {
          case 'MissingCredentials':
            errorMessage = 'Please enter both email and password.';
            break;
          case 'UserNotFoundOrNoPassword':
            errorMessage = 'Invalid email or password.';
            break;
          case 'InvalidPassword':
            errorMessage = 'Invalid email or password.';
            break;
          case 'CredentialsSignin':
            errorMessage = 'Invalid email or password.';
            break;
          case 'PrismaUnavailable':
            errorMessage = 'Database connection error. Please try again later.';
            break;
          default:
            // For any other unexpected errors from NextAuth.js
            errorMessage = `Login failed: ${result.error}`;
            break;
        }

        toast.error(errorMessage);
        setIsCredentialsLoading(false);
      } else if (result?.ok) {
        console.log("signIn successful, result:", result);
        toast.success('Login successful!');
        
                 try {
           console.log('Redirecting to:', callbackUrl);
           window.location.href = callbackUrl;
         } catch (error) {
           console.error('Redirect failed:', error);
           toast.error('Login successful but redirect failed. Please try again.');
           router.push('/'); // Fallback redirect to home
         }
      } else {
        // Handle unexpected scenarios
        toast.error('An unexpected error occurred during login.');
        setIsCredentialsLoading(false);
      }
    } catch (error) {
      console.error("Login exception:", error);
      toast.error('An error occurred. Please try again later.');
      setIsCredentialsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your AI SaaS Platform account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credentials Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email-credentials">Email</Label>
              <Input
                id="email-credentials"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isCredentialsLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isCredentialsLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isCredentialsLoading || !email || !password}
            >
              {isCredentialsLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm">
          {/* <p className="text-muted-foreground">
            Don&apos;t have an account?
            <Link href="/register" className="font-semibold text-primary ml-1 hover:underline">
              Sign up
            </Link>
          </p> */}
          <Link href="/forgot-password" className="text-muted-foreground hover:text-primary hover:underline">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// New default export component wrapping LoginForm with Suspense
export default function LoginClient() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}