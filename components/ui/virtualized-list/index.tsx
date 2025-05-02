import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEventCallback } from '@/hooks/useEventCallback';
import { throttle } from '@/utils/performance';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * A virtualized list component that only renders visible items for better performance
 * with large datasets.
 */
function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8,
  keyExtractor = (_, index) => index.toString(),
  emptyComponent = null,
  loadingComponent = null,
  isLoading = false,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isNearEnd, setIsNearEnd] = useState(false);

  // Calculate the visible range based on scroll position
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const viewportHeight = height;
    
    // Calculate start index based on scroll position
    let startIndex = Math.floor(scrollTop / itemHeight) - overscan;
    startIndex = Math.max(0, startIndex);
    
    // Calculate end index based on viewport height
    const visibleItemCount = Math.ceil(viewportHeight / itemHeight) + overscan * 2;
    let endIndex = startIndex + visibleItemCount;
    endIndex = Math.min(items.length - 1, endIndex);
    
    return { startIndex, endIndex, totalHeight };
  }, [scrollTop, items.length, itemHeight, height, overscan]);

  // Handle scroll events with throttling to improve performance
  const handleScroll = useEventCallback(
    throttle(() => {
      if (!containerRef.current) return;
      
      const { scrollTop } = containerRef.current;
      setScrollTop(scrollTop);
      
      // Check if we're near the end of the list
      const scrollBottom = scrollTop + height;
      const thresholdPosition = totalHeight * endReachedThreshold;
      
      if (scrollBottom >= thresholdPosition && !isNearEnd && onEndReached) {
        setIsNearEnd(true);
        onEndReached();
      } else if (scrollBottom < thresholdPosition && isNearEnd) {
        setIsNearEnd(false);
      }
    }, 50)
  );

  // Handle window resize events
  useEffect(() => {
    const handleResize = throttle(() => {
      handleScroll();
    }, 100);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll]);

  // Render only the visible items with proper positioning
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      const itemPositionY = actualIndex * itemHeight;
      
      return (
        <div
          key={keyExtractor(item, actualIndex)}
          style={{
            position: 'absolute',
            top: 0,
            transform: `translateY(${itemPositionY}px)`,
            width: '100%',
            height: itemHeight,
          }}
          data-index={actualIndex}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [startIndex, endIndex, items, renderItem, itemHeight, keyExtractor]);

  // Show empty component if there are no items
  if (items.length === 0 && !isLoading) {
    return <div className={className} style={{ height }}>{emptyComponent}</div>;
  }

  // Show loading component when loading
  if (isLoading && items.length === 0) {
    return <div className={className} style={{ height }}>{loadingComponent}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative ${className}`}
      style={{ height, willChange: 'transform' }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
          willChange: 'transform',
        }}
      >
        {visibleItems}
      </div>
      {isLoading && items.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
          }}
        >
          {loadingComponent}
        </div>
      )}
    </div>
  );
}

export default React.memo(VirtualizedList);
