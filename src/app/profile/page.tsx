"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  username: string;
  prompt: string;
  imageUrl: string;
  likes: number;
  likedBy: string[];
}

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user?.email) return;

      const postsRef = collection(db, "posts");
      const q = query(postsRef, where("likedBy", "array-contains", user.email));

      try {
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setLikedPosts(posts);
      } catch (error) {
        console.error("Error fetching liked posts:", error);
      }
    };

    fetchLikedPosts();
  }, [user]);

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">My Liked Posts</h1>
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

      {likedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">
            You haven't liked any posts yet.
          </p>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance] mx-auto">
            {likedPosts.map(post => (
              <Card key={post.id} className="mb-4 break-inside-avoid">
                <CardContent className="p-4">
                  <div className="relative">
                    <Image
                      src={post.imageUrl}
                      alt={post.prompt}
                      width={500}
                      height={500}
                      className="w-full h-auto rounded-md"
                      style={{ aspectRatio: "auto" }}
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold">{post.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      {post.prompt}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Heart className="w-6 h-6 text-red-500" />
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
