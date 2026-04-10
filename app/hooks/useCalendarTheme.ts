import { useState, useEffect, useCallback, useRef } from "react";
import { MONTH_IMAGES } from "../lib/constants";

/**
 * Extracts the dominant colour from an image URL via canvas sampling.
 * Returns a Promise that resolves to a hex colour string.
 */
function extractColorFromImage(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("#1a1a1a");
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0,
          g = 0,
          b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 1600) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        let rAvg = Math.floor(r / count);
        let gAvg = Math.floor(g / count);
        let bAvg = Math.floor(b / count);

        const luminance = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
        if (luminance > 160) {
          const factor = 160 / luminance;
          rAvg = Math.floor(rAvg * factor);
          gAvg = Math.floor(gAvg * factor);
          bAvg = Math.floor(bAvg * factor);
        }

        const toHex = (c: number) => c.toString(16).padStart(2, "0");
        resolve(`#${toHex(rAvg)}${toHex(gAvg)}${toHex(bAvg)}`);
      } catch {
        resolve("#1a1a1a");
      }
    };
    img.onerror = () => resolve("#1a1a1a");
  });
}

/**
 * Hook that returns the theme colour for the current month AND
 * eagerly pre-extracts colours for the adjacent (prev / next) months
 * so they are immediately available when a page flip starts.
 *
 * Returns: { themeColor, getColor }
 *   - themeColor : string  — colour for the current month
 *   - getColor(monthIndex) — returns cached colour or fallback
 */
export function useCalendarTheme(currentDate: Date) {
  const monthIndex = currentDate.getMonth();

  // Persistent cache: monthIndex → hex colour (survives re-renders)
  const colorCache = useRef<Record<number, string>>({});

  const [themeColor, setThemeColor] = useState<string>(
    () => colorCache.current[monthIndex] ?? "#1a1a1a",
  );

  // Force a re-render when adjacent colours finish extracting
  const [, setTick] = useState(0);

  const extractAndCache = useCallback(async (idx: number) => {
    if (colorCache.current[idx]) return; // already cached
    const color = await extractColorFromImage(MONTH_IMAGES[idx]);
    colorCache.current[idx] = color;
    setTick((t) => t + 1); // trigger re-render so getColor picks it up
  }, []);

  useEffect(() => {
    // Extract current month
    const run = async () => {
      if (colorCache.current[monthIndex]) {
        setThemeColor(colorCache.current[monthIndex]);
      }
      const color = await extractColorFromImage(MONTH_IMAGES[monthIndex]);
      colorCache.current[monthIndex] = color;
      setThemeColor(color);
    };
    run();

    // Eagerly pre-extract adjacent months so they're ready for flip
    const prevIdx = (monthIndex - 1 + 12) % 12;
    const nextIdx = (monthIndex + 1) % 12;
    extractAndCache(prevIdx);
    extractAndCache(nextIdx);
  }, [monthIndex, extractAndCache]);

  /** Synchronous lookup — returns cached colour or fallback */
  const getColor = useCallback(
    (idx: number): string => colorCache.current[idx] ?? "#1a1a1a",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeColor], // intentionally depend on themeColor to re-evaluate after cache update
  );

  return { themeColor, getColor };
}
