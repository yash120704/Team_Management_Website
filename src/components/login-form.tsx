"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { Loader2, LogIn, Mail, Shield } from "lucide-react";
import { supabase } from '@/lib/supabase';


const formSchema = z.object({
  email: z.string().email("Enter your VIT email address."),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
    onLoginSuccess: (user: User) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  // Google OAuth handler
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            hd: 'vit.ac.in', // restrict to VIT domain
          },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (error) throw error;
      // The user will be redirected to Google and back
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google Login Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback password login
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/participant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.toLowerCase(),
          password: values.password,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Login failed.');
      }
      toast({
        title: "Login Successful",
        description: `Welcome, ${result.user.name}!`,
      });
      sessionStorage.setItem("gravitas-user", JSON.stringify(result.user));
      onLoginSuccess(result.user);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg shadow-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle>Participant Login</CardTitle>
        <CardDescription>
          Sign in with your VIT Google account if you are registered for an event.<br/>
          If you have set a password, you can use fallback login below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full mb-4"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2" />}
          Sign in with Google (VIT Email)
        </Button>
        <div className="text-center text-xs text-muted-foreground mb-2">or</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourid@vit.ac.in"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Only for users who have set a password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Shield className="mr-2"/>}
              Login with Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
