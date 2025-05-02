'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  fallbackSrc?: string;
};

/**
 * OptimizedImage component using Next.js Image with:
 * - Error handling with fallback
 * - Lazy loading by default (priority can be set for above-the-fold images)
 * - Proper sizing responsive images
 * - Loading state
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  fallbackSrc = '/assets/placeholder.svg',
}: OptimizedImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Reset error state if src changes
  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  // Handle successful load
  const handleLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
  };

  // Determine if the image should be preloaded
  const shouldPreload = priority;

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        loading && 'animate-pulse bg-gray-200',
        className
      )}
      style={{ 
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          'transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        quality={quality}
        priority={priority}
        fill={fill}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        loading={shouldPreload ? 'eager' : 'lazy'}
      />
    </div>
  );
};

export default OptimizedImage;
