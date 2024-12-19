import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function PostSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="h-6 w-32" /> {/* Username */}
        <Skeleton className="h-4 w-full mt-2" /> {/* Prompt */}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] w-full">
          <Skeleton className="h-full w-full" /> {/* Image */}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" /> {/* Heart icon */}
          <Skeleton className="h-4 w-16" /> {/* Likes count */}
        </div>
        <Skeleton className="h-6 w-6" /> {/* Comment icon */}
      </CardFooter>
    </Card>
  );
}
