import { cache } from "react";
import sharp from "sharp";

// 10×10 dark-gray PNG — shown when blur generation fails or src is null.
export const BLUR_FALLBACK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAF0lEQVQoU2NkIBIwEqmOYVQhXoUAAHWAATs3JMlFAAAAAElFTkSuQmCC";

/**
 * Fetches `src`, resizes to 10×10, encodes as tiny WebP for use as
 * next/image blurDataURL. Wrapped in React `cache` — deduplicated per
 * render pass so the same URL is never fetched twice in one request.
 *
 * In production, store the result in the DB at upload time and pass it
 * as a prop to avoid the runtime fetch entirely.
 */
export const generateBlurDataUrl = cache(async (src: string): Promise<string> => {
  try {
    const res = await fetch(src, {
      next: { revalidate: 60 * 60 * 24 }, // 24 h
    });
    if (!res.ok) return BLUR_FALLBACK;

    const buf = Buffer.from(await res.arrayBuffer());

    const blurBuf = await sharp(buf)
      .resize(10, 10, { fit: "cover" })
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${blurBuf.toString("base64")}`;
  } catch {
    return BLUR_FALLBACK;
  }
});
