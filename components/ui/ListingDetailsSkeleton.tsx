import { Skeleton } from "@/components/ui/skeleton";

export function ListingDetailsSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#ECFDED]">
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#F9F3F0] rounded-xl p-8 shadow-lg">
            {/* Back Button Skeleton */}
            <Skeleton className="h-10 w-24 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Section Skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square rounded-lg w-full" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-20 h-20 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Details Section Skeleton */}
              <div className="space-y-6">
                {/* Title */}
                <Skeleton className="h-10 w-3/4" />

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-4 mt-8">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-44" />
                </div>

                {/* Buttons */}
                <div className="flex flex-col lg:flex-row gap-4 mt-6">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
