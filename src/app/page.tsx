"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  addDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { postsCollection, FirestorePost } from "@/firebase";
import { db } from "@/firebase";
import { Heart } from "lucide-react";

interface Post extends FirestorePost {}

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const isScrollingUp = useScrollDirection();

  useEffect(() => {
    const q = query(postsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(newPosts);
    });

    return () => unsubscribe();
  }, []);

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

      await addDoc(postsCollection, {
        username: user?.email || "anonymous",
        prompt: inputText,
        imageUrl: imageBase64,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLike = async (
    postId: string,
    currentLikes: number,
    likedBy: string[]
  ) => {
    if (!user?.email) return;

    const postRef = doc(db, "posts", postId);
    const hasLiked = likedBy.includes(user.email);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
        likedBy: hasLiked ? arrayRemove(user.email) : arrayUnion(user.email),
      });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Pentagram</h1>
            <p className="text-lg">Social Media for your wildest dreams!</p>
          </div>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button>Profile</Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  className="px-4 py-2 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                >
                  My Saved Posts
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
                >
                  Sign Out
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Scrollable feed */}
        <div className="max-w-2xl mx-auto space-y-6 mb-8">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.username}</CardTitle>
                <CardDescription>{post.prompt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square">
                  <Image
                    src={post.imageUrl}
                    alt={post.prompt}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleLike(post.id, post.likes, post.likedBy)
                    }
                    disabled={!user}
                    className="hover:bg-transparent"
                  >
                    {post.likedBy?.includes(user?.email || "") ? (
                      <Heart className="w-6 h-6 text-red-500" /> // TODO: fill this heart using svg
                    ) : (
                      <Heart className="w-6 h-6" />
                    )}
                  </Button>
                  <span>{post.likes} likes</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <footer
        className={`fixed bottom-0 left-0 right-0 p-4 bg-background transition-transform duration-300 ${
          isScrollingUp ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
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
