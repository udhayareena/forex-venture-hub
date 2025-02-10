
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, UserPlus, Mail } from "lucide-react";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Authentication logic will be implemented later
    toast.info("Authentication system will be implemented soon!");
    setLoading(false);
  };

  const handleGoogleAuth = () => {
    toast.info("Google authentication will be implemented soon!");
  };

  return (
    <Card className="w-full max-w-md p-6 glass">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={loading}>
          {loading ? (
            "Loading..."
          ) : isLogin ? (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </>
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full"
      >
        <Mail className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-secondary hover:underline font-medium"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </Card>
  );
};
