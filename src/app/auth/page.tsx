"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const samplePost = {
    id: 1,
    username: "aiartist",
    prompt: "Sunrise over the mountains.",
    imageUrl: "https://picsum.photos/800/600",
    likes: 1337,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push("/");
    } catch (err) {
      setError("Failed to " + (isLogin ? "sign in" : "sign up"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex max-w-5xl w-full gap-8">
        {/* Left side - Sample Post */}
        <div className="hidden md:block w-1/2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">{samplePost.username}</CardTitle>
              <CardDescription>{samplePost.prompt}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={samplePost.imageUrl}
                  alt={samplePost.prompt}
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-3">
              <div className="flex items-center gap-2">
                <button className="hover:text-red-500">❤️</button>
                <span>{samplePost.likes} likes</span>
              </div>
              <button className="hover:text-blue-500">💬</button>
            </CardFooter>
          </Card>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full md:w-1/2">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-2">
                Pentagram
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin
                  ? "Sign in to see AI-generated art"
                  : "Sign up to create AI-generated art"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                >
                  {isLogin ? "Sign In" : "Sign Up"}
                </button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center w-full">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
