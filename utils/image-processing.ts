/**
 * Image processing utilities for Looply
 * Handles avatar uploads, image compression, and format conversion
 */

// Maximum file sizes
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_POST_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Image dimensions for different use cases
const AVATAR_SIZE = { width: 200, height: 200 };
const POST_IMAGE_MAX_SIZE = { width: 1920, height: 1080 };
const THUMBNAIL_SIZE = { width: 300, height: 300 };

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG compression
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ProcessedImage {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

/**
 * Validates an image file
 */
export function validateImageFile(file: File, maxSize: number = MAX_AVATAR_SIZE): string | null {
  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return `Unsupported file format. Please use ${SUPPORTED_FORMATS.join(', ')}`;
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return `File is too large. Maximum size is ${maxSizeMB}MB`;
  }

  return null; // Valid file
}

/**
 * Compresses and resizes an image
 */
export function processImage(
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = AVATAR_SIZE.width,
      maxHeight = AVATAR_SIZE.height,
      quality = 0.8,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options;

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        let { width, height } = img;

        // Calculate new dimensions
        if (maintainAspectRatio) {
          const aspectRatio = width / height;
          
          if (width > height) {
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
          } else {
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }
        } else {
          width = Math.min(width, maxWidth);
          height = Math.min(height, maxHeight);
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to process image'));
              return;
            }

            const dataUrl = canvas.toDataURL(`image/${format}`, quality);
            
            resolve({
              dataUrl,
              blob,
              width,
              height,
              size: blob.size
            });
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Processes an avatar image with specific settings
 */
export async function processAvatarImage(file: File): Promise<ProcessedImage> {
  const validation = validateImageFile(file, MAX_AVATAR_SIZE);
  if (validation) {
    throw new Error(validation);
  }

  return processImage(file, {
    maxWidth: AVATAR_SIZE.width,
    maxHeight: AVATAR_SIZE.height,
    quality: 0.85,
    format: 'jpeg',
    maintainAspectRatio: true
  });
}

/**
 * Processes a post image with specific settings
 */
export async function processPostImage(file: File): Promise<ProcessedImage> {
  const validation = validateImageFile(file, MAX_POST_IMAGE_SIZE);
  if (validation) {
    throw new Error(validation);
  }

  return processImage(file, {
    maxWidth: POST_IMAGE_MAX_SIZE.width,
    maxHeight: POST_IMAGE_MAX_SIZE.height,
    quality: 0.9,
    format: 'jpeg',
    maintainAspectRatio: true
  });
}

/**
 * Creates a thumbnail from an image
 */
export async function createThumbnail(file: File): Promise<ProcessedImage> {
  return processImage(file, {
    maxWidth: THUMBNAIL_SIZE.width,
    maxHeight: THUMBNAIL_SIZE.height,
    quality: 0.7,
    format: 'jpeg',
    maintainAspectRatio: true
  });
}

/**
 * Converts a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Checks if the browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Gets the optimal image format for the browser
 */
export async function getOptimalFormat(): Promise<'webp' | 'jpeg'> {
  const webpSupported = await supportsWebP();
  return webpSupported ? 'webp' : 'jpeg';
}

/**
 * Extracts color palette from an image (for theming)
 */
export function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          pixelCount++;
        }

        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);

        const hex = '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');

        resolve(hex);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

// Export the utilities as a namespace
export const ImageProcessing = {
  validateImageFile,
  processImage,
  processAvatarImage,
  processPostImage,
  createThumbnail,
  dataUrlToBlob,
  supportsWebP,
  getOptimalFormat,
  extractDominantColor
};