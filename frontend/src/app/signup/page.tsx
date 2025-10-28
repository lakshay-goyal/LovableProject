"use client";

import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, User, Mail, Github } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleEmailAuth = async () => {
    if (nameRef.current && emailRef.current && passwordRef.current && confirmPasswordRef.current) {
      const name = nameRef.current.value;
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const confirmPassword = confirmPasswordRef.current.value;

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
      }, {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          redirect("/dashboard");
        }
      });
      if (error) {
        alert(error.message);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    if (provider === "Google") {
      const data = await authClient.signIn.social({
        provider: "google",
      });
      if (data.error) {
        alert(data.error.message);
        setIsLoading(false);
        return;
      }
    }
    if (provider === "Github") {
      console.log("GitHub auth initiated");

      const data = await authClient.signIn.social({
        provider: "github",
      });
      if (data.error) {
        alert(data.error.message);
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(false);
  };

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession()

  useEffect(() => {
    if (session) {
      redirect("/dashboard");
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      <NavigationBar />
      <div className="flex flex-1 items-center justify-center p-16">
        <Card className="w-full max-w-md shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Join Lovable AI</h2>
            <p className="text-sm text-muted-foreground">
              Create your account to unlock powerful automation features
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  ref={nameRef}
                  placeholder="John Doe"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  ref={emailRef}
                  placeholder="name@example.com"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                ref={passwordRef}
                placeholder="Create a strong password"
                className="pl-10 h-11"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
              <Input
                ref={confirmPasswordRef}
                placeholder="Confirm your password"
                className="pl-10 h-11"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full h-11 text-base font-medium transition-all duration-200 hover:shadow-md"
              onClick={handleEmailAuth}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="relative w-full">
              <Separator className="my-4" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                Or continue with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                className="w-full h-11 flex justify-center items-center gap-3 border-2 hover:border-primary/30 transition-colors"
                onClick={() => handleSocialAuth("Google")}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 flex justify-center items-center gap-3 border-2 hover:border-primary/30 transition-colors"
                onClick={() => handleSocialAuth("Github")}
                disabled={isLoading}
              >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <Button variant="link" className="px-1 h-auto font-medium text-primary" onClick={() => redirect('/signin')}>
                Sign in
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
