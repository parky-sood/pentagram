"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { samplePosts } from "@/data";

interface Post {
  id: number;
  username: string;
  prompt: string;
  imageUrl: string;
  likes: number;
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      console.log(data);

      const binaryData = Buffer.from(data.content.image);
      const imageBase64 = URL.createObjectURL(
        new Blob([binaryData.buffer], { type: "image/jpeg" })
      );

      const newPost: Post = {
        id: 0,
        username: "test",
        prompt: inputText,
        imageUrl: imageBase64,
        likes: 0,
      };

      samplePosts.push(newPost);

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // TODO: Update the UI here to show the images generated

    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Pentagram</h1>
          <p className="text-lg">Social Media for your wildest dreams!</p>
        </div>

        {/* Scrollable feed */}
        <div className="max-w-2xl mx-auto space-y-6 mb-8">
          {samplePosts.map((post: Post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{post.username}</CardTitle>
                <CardDescription>{post.prompt}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.prompt}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <div className="flex items-center gap-2">
                  <button className="hover:text-red-500">❤️</button>
                  <span>{post.likes} likes</span>
                </div>
                <button className="hover:text-blue-500">💬</button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <footer className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
