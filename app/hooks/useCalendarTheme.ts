import { useState, useEffect } from "react";
import { MONTH_IMAGES } from "../lib/constants";

export function useCalendarTheme(currentDate: Date) {
  const [themeColor, setThemeColor] = useState<string>("#38bdf8");

  useEffect(() => {
    const monthIndex = currentDate.getMonth();
    const activeImage = MONTH_IMAGES[monthIndex];

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = activeImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
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
        // Sample every 400th pixel to be fast
        for (let i = 0; i < data.length; i += 1600) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        let rAvg = Math.floor(r / count);
        let gAvg = Math.floor(g / count);
        let bAvg = Math.floor(b / count);

        // Prevent the theme color from being too bright (ensures white text is visible)
        const luminance = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
        if (luminance > 160) {
          const factor = 160 / luminance;
          rAvg = Math.floor(rAvg * factor);
          gAvg = Math.floor(gAvg * factor);
          bAvg = Math.floor(bAvg * factor);
        }

        const toHex = (c: number) => c.toString(16).padStart(2, "0");
        setThemeColor(`#${toHex(rAvg)}${toHex(gAvg)}${toHex(bAvg)}`);
      } catch (e) {
        console.error("Canvas taint error, fallback to default", e);
        setThemeColor("#38bdf8"); // fallback
      }
    };
  }, [currentDate]);

  return themeColor;
}
