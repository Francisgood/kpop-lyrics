import Image from "next/image";
import { canOptimize } from "@/lib/image-hosts";

// Renders a Next-optimized <Image> (resize + AVIF/WebP + same-origin cache) when the
// source host is allow-listed, otherwise a plain lazy <img>. Works in both server and
// client components. Use `fill` inside a positioned, sized container.
type Props = {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function SmartImage({ src, alt = "", fill, width, height, sizes, priority, className, style }: Props) {
  if (canOptimize(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width: width ?? 800, height: height ?? 450 })}
        sizes={sizes}
        priority={priority}
        {...(priority ? {} : { loading: "lazy" as const })}
        className={className}
        style={style}
      />
    );
  }
  // Unknown host → unoptimized img, but still lazy + async so it stays off the critical path.
  const imgStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }
    : (style ?? {});
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      {...(fill ? {} : { width, height })}
      className={className}
      style={imgStyle}
    />
  );
}
