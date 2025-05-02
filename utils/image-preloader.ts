/**
 * Utility for preloading critical images
 */

interface PreloadImageOptions {
  priority?: boolean;
  integrity?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

/**
 * Preload a single image with various options
 */
export const preloadImage = (
  imageSrc: string, 
  options: PreloadImageOptions = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const imageElement = new Image();
      
      // Handle load and error events
      imageElement.onload = () => resolve();
      imageElement.onerror = (error) => reject(error);
      
      // Set attribute options
      if (options.crossOrigin) {
        imageElement.crossOrigin = options.crossOrigin;
      }
      
      // Set the src to start loading
      imageElement.src = imageSrc;
      
      // If the image is already cached, onload might not fire
      if (imageElement.complete) {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Preload multiple images at once
 */
export const preloadImages = (
  imageSrcs: string[],
  options: PreloadImageOptions = {}
): Promise<void[]> => {
  return Promise.all(imageSrcs.map(src => preloadImage(src, options)));
};

/**
 * Dynamically add preload link tags to the document head
 * This can improve browser prioritization of image loading
 */
export const addImagePreloadTags = (
  imageSrcs: string[],
  options: PreloadImageOptions = {}
): void => {
  // Only run in browser environment
  if (typeof document === 'undefined') return;
  
  imageSrcs.forEach(src => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.as = 'image';
    linkElement.href = src;
    
    if (options.fetchPriority) {
      linkElement.setAttribute('fetchpriority', options.fetchPriority);
    }
    
    if (options.integrity) {
      linkElement.integrity = options.integrity;
    }
    
    if (options.crossOrigin) {
      linkElement.crossOrigin = options.crossOrigin;
    }
    
    document.head.appendChild(linkElement);
  });
};

/**
 * Critical images that should be preloaded on app initialization
 * These are typically images that appear above the fold on key pages
 */
export const CRITICAL_IMAGES = [
  '/avatars/01.png',
  '/avatars/default.png',
  '/logo.svg',
  // Add other critical images here
];

/**
 * Preload all critical images on app initialization
 */
export const preloadCriticalImages = (): void => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Add preload link tags
  addImagePreloadTags(CRITICAL_IMAGES, { 
    fetchPriority: 'high',
    crossOrigin: 'anonymous'
  });
  
  // Also preload using Image objects for older browsers
  preloadImages(CRITICAL_IMAGES).catch(error => {
    console.error('Failed to preload critical images:', error);
  });
};

export default {
  preloadImage,
  preloadImages,
  addImagePreloadTags,
  preloadCriticalImages,
  CRITICAL_IMAGES
};
