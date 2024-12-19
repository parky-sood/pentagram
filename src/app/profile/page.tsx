"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Temporary interface until you have your backend setup
interface SavedPost {
  id: number;
  username: string;
  prompt: string;
  imageUrl: string;
  likes: number;
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  // Temporary sample data - replace with actual saved posts from your backend
  const savedPosts: SavedPost[] = [
    {
      id: 1,
      username: user?.email || "anonymous",
      prompt: "A beautiful sunset over mountains",
      imageUrl: "https://picsum.photos/800/600",
      likes: 42,
    },
    // Add more sample posts as needed
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">My Saved Posts</h1>
          <p className="text-lg">
            All your favorite AI-generated images in one place
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
        >
          Back to Home
        </Button>
      </div>

      {savedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">
            You haven't saved any posts yet.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {savedPosts.map(post => (
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
      )}
    </div>
  );
}
