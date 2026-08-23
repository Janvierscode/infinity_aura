import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { resolveMediaSource } from "@/lib/media";
import type { PublicMediaAsset } from "@/types/database";

type PublicMediaProps = {
  media: PublicMediaAsset | null | undefined;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function PublicMedia({ media, alt, className = "", sizes, priority = false }: PublicMediaProps) {
  return (
    <span className={`public-media ${className}`.trim()}>
      {media ? (
        <Image
          src={resolveMediaSource(media.public_url)}
          alt={media.alt_text ?? alt}
          fill
          preload={priority}
          sizes={sizes}
        />
      ) : (
        <span className="public-media-fallback" aria-label="Cover image coming soon" role="img">
          <ImageIcon aria-hidden="true" size={30} />
          <span>Infinity Aura</span>
        </span>
      )}
    </span>
  );
}
