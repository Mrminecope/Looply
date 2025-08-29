import { useState, useCallback, forwardRef } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, fallbackSrc, onError, onLoad, className, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = useCallback(() => {
      if (!hasError) {
        setHasError(true);
        if (fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          // Use a default fallback if no fallback src is provided
          setImgSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4QzEwLjM0IDggOSA5LjM0IDkgMTFDOSAxMi42NiAxMC4zNCAxNCAxMiAxNEMxMy42NiAxNCAxNSAxMi42NiAxNSAxMUMxNSA5LjM0IDEzLjY2IDggMTIgOFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+');
        }
        onError?.();
      }
    }, [hasError, fallbackSrc, onError]);

    const handleLoad = useCallback(() => {
      onLoad?.();
    }, [onLoad]);

    return (
      <img
        ref={ref}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={className}
        {...props}
      />
    );
  }
);

ImageWithFallback.displayName = 'ImageWithFallback';

export default ImageWithFallback;