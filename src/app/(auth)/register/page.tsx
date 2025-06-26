'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/schemas/auth.schema";
import { api } from "@/utils/trpc";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  // Check if registration is disabled and redirect if it is
  useEffect(() => {
    // Since we can't access server environment variables directly in client components,
    // we'll let the API handle the restriction and show an appropriate message
    // The UI restrictions will be handled by removing the signup link from login page
  }, []);

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    },
    onError: (error: any) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('An account with this email already exists.');
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // Client-side validation using Zod schema
    const result = registerSchema.safeParse({ 
      name: name || undefined, 
      email, 
      password 
    });
    
    if (!result.success) {
      // Aggregate Zod errors into a user-friendly message
      const errorMessages = result.error.errors.map(e => e.message).join(' ');
      toast.error(`Validation failed: ${errorMessages}`);
      return;
    }

    registerMutation.mutate(result.data);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up for the AI SaaS Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={registerMutation.isPending}
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
                disabled={registerMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={registerMutation.isPending}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?
            <Link href="/login" className="font-semibold text-primary ml-1 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}