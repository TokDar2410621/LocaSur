import * as React from "react"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)

  const showImage = src && !imgError
  const initials = fallback?.slice(0, 2).toUpperCase()

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span className="font-medium text-muted-foreground">
          {initials}
        </span>
      ) : (
        <User className={cn(
          "text-muted-foreground",
          size === 'sm' && "w-4 h-4",
          size === 'md' && "w-5 h-5",
          size === 'lg' && "w-6 h-6",
          size === 'xl' && "w-8 h-8",
        )} />
      )}
    </div>
  )
}
