import { Skeleton } from "@/components/ui/skeleton";

export function ListingSkeleton() {
  return (
    <div className="bg-[#F9F3F0] rounded-xl overflow-hidden shadow-md p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image skeleton */}
        <Skeleton className="h-48 w-full md:w-72 rounded-xl" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <Skeleton className="h-8 w-3/4" />
          
          {/* User/Date info */}
          <Skeleton className="h-6 w-1/2" />
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
} 