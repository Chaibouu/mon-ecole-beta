import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StudentDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
