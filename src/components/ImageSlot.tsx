import React from 'react';
import Image from 'next/image';
import { SITE_IMAGES, type ImageLocale, type SiteImageSlug } from '@/lib/site-images';

interface ImageSlotProps {
  slug: SiteImageSlug;
  locale: ImageLocale;
  priority?: boolean;
  /** Override default responsive sizes for narrow cards or full-bleed heroes */
  sizes?: string;
  /** Override aspect/height container sizing (defaults to 16:9 editorial frame) */
  aspectClassName?: string;
  className?: string;
  imgClassName?: string;
  altOverride?: string;
  children?: React.ReactNode;
}

const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1600px';

export function ImageSlot({
  slug,
  locale,
  priority = false,
  sizes = DEFAULT_SIZES,
  aspectClassName = 'aspect-video w-full',
  className = '',
  imgClassName = '',
  altOverride,
  children,
}: ImageSlotProps) {
  const image = SITE_IMAGES[slug];

  return (
    <div className={`relative overflow-hidden bg-signature ${aspectClassName} ${className}`}>
      <Image
        src={image.src}
        alt={altOverride ?? image.alt[locale]}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover object-center ${imgClassName}`}
      />
      {children}
    </div>
  );
}
