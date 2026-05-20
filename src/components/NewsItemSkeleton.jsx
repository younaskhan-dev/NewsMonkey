import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export const NewsItemSkeleton = () => {
  return (
    <Card className="flex flex-col h-full w-full overflow-hidden border border-border/50 shadow-md rounded-2xl bg-card animate-pulse">
      <div className="aspect-video w-full bg-muted/40">
        <Skeleton height="100%" borderRadius={0} />
      </div>
      <CardHeader className="p-5 pb-3">
        <Skeleton count={2} height={22} className="mb-2" />
        <div className="flex gap-4 mt-3">
          <Skeleton width={80} height={16} />
          <Skeleton width={100} height={16} />
          <Skeleton width={60} height={16} className="ml-auto" />
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 grow">
        <Skeleton count={3} height={16} className="mb-1.5" />
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-auto flex gap-3">
        <Skeleton height={44} className="w-full rounded-xl" />
        <Skeleton width={44} height={44} className="rounded-xl shrink-0" />
      </CardFooter>
    </Card>
  )
}
