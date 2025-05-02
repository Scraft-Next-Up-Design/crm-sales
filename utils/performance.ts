/**
 * Performance utilities for optimizing React component rendering and calculations
 */

/**
 * Deeply compares two objects for equality
 * @param objA First object
 * @param objB Second object
 * @returns True if objects are deeply equal
 */
export function deepEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }
  
  if (
    typeof objA !== 'object' || 
    objA === null || 
    typeof objB !== 'object' || 
    objB === null
  ) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) {
      return false;
    }
    
    if (!deepEqual(objA[key], objB[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a memoization cache for expensive calculations
 * @returns A memoized function that caches results
 */
export function createMemoizedFunction<Args extends any[], Result>(
  fn: (...args: Args) => Result,
  areArgsEqual: (prevArgs: Args, newArgs: Args) => boolean = 
    (prev, next) => prev.length === next.length && prev.every((val, i) => deepEqual(val, next[i]))
): (...args: Args) => Result {
  let lastArgs: Args | null = null;
  let lastResult: Result | null = null;
  
  return (...args: Args): Result => {
    // First call or arguments changed
    if (lastArgs === null || !areArgsEqual(lastArgs, args)) {
      lastArgs = args;
      lastResult = fn(...args);
    }
    
    return lastResult as Result;
  };
}

/**
 * Custom hook to detect component re-renders
 * @param componentName Name of the component to track
 * @returns void
 */
export function useTrackRenders(componentName: string): void {
  if (process.env.NODE_ENV !== 'production') {
    const renderCount = React.useRef(0);
    
    React.useEffect(() => {
      renderCount.current += 1;
      console.log(`${componentName} render count: ${renderCount.current}`);
    });
  }
}

/**
 * Debounce function to limit how often a function can be called
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function to limit how often a function can be called
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastCall < limit) {
      // If we're throttled, queue the call
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        lastCall = now;
        fn.apply(this, args);
        timeoutId = null;
      }, limit - (now - lastCall));
    } else {
      // Not throttled, call immediately
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Measure the execution time of a function
 * @param fn Function to measure
 * @param fnName Optional name for logging
 * @returns Result of the function
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  fnName: string = fn.name || 'anonymous'
): (...args: Parameters<T>) => ReturnType<T> {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    
    console.log(`${fnName} execution time: ${end - start}ms`);
    
    return result;
  };
}

// Need to import React for useTrackRenders
import React from 'react';
