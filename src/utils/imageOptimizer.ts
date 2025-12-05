/**
 * Client-side image optimization utilities
 * Reduces upload time by compressing images before sending to server
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.85,
  format: 'image/jpeg',
};

/**
 * Compresses and resizes an image file before upload
 * @param file - The original image file
 * @param options - Optimization options
 * @returns Promise<Blob> - The optimized image blob
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = Math.min(width, opts.maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, opts.maxHeight);
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          opts.format,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Creates a File object from a Blob with the original filename
 */
export function blobToFile(blob: Blob, originalFile: File): File {
  const extension = blob.type.split('/')[1] || 'jpg';
  const name = originalFile.name.replace(/\.[^/.]+$/, '') + '.' + extension;
  return new File([blob], name, { type: blob.type });
}

/**
 * Validates an image file
 */
export function validateImage(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  } = options;

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please upload an image file' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Please upload a ${allowedTypes.map((t) => t.split('/')[1]).join(', ')} image`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Gets image dimensions from a file
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts a File to a base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
