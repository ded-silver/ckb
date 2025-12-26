import { useEffect, useRef } from "react";

import type { Theme } from "../../../types";
import "./MatrixRain.css";

interface MatrixRainProps {
  theme: Theme;
}

const MatrixRain = ({ theme }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Символы
    const getCharsForTheme = (): string => {
      switch (theme) {
        case "matrix":
          return "11010000 10010010 11010001 10001011 11010000 10110001 11010000 10111110 11010001 10000000 00101110 00100000 11010000 10011111 11010001 10000000 11010000 10111110 11010000 10110001 11010000 10111011 11010000 10110101 11010000 10111100 11010000 10110000 00100000 11010000 10110010 00100000 11010000 10110010 11010001 10001011 11010000 10110001 11010000 10111110 11010001 10000000 11010000 10110101";
        case "anime":
          return "♡✧✿♪♫♬♭♮♯♰♱♲♳♴♵♶♷♸♹♺♻♼♽♾";
        case "2077":
          return "█▓▒░║═╬╩╦╠╣◢◣◤◥◆◇○●▲▼◄►0xFF0x000x3C0xA00xDE0xAD0xBE0xEFアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンブラブラブラエバッアラサクブラブラバクハツミコシ";
        case "amber":
          return "◉○●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡";
        case "dolbaeb":
          return "";
        case "win95":
          return "";
        case "retro":
          return "█▓▒░║═╬╩╦╠╣◢◣◤◥◆◇○●▲▼◄►★☆✦✧✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❄❅❆❇❈❉❊❋";
        default:
          return "█▓▒░║═╬╩╦╠╣◢◣◤◥◆◇○●▲▼◄►0xFF0x000x3C0xA00xDE0xAD0xBE0xEF";
      }
    };

    const chars = getCharsForTheme();
    const charsArray = chars ? Array.from(chars) : [];

    // Цвета для разных тем
    const getThemeColors = () => {
      switch (theme) {
        case "2077":
          return {
            trail: "rgba(0, 0, 0, 0.05)",
            gradient: ["#ff003c", "#cc0029", "#660014"],
          };
        case "dolbaeb":
          return {
            trail: "rgba(255, 255, 255, 0.02)",
            gradient: ["#ffffff", "#cccccc", "#999999"],
          };
        case "matrix":
          return {
            trail: "rgba(0, 0, 0, 0.05)",
            gradient: ["#00ff00", "#00cc00", "#003300"],
          };
        case "amber":
          return {
            trail: "rgba(0, 0, 0, 0.05)",
            gradient: ["#ffaa00", "#cc8800", "#664400"],
          };
        case "anime":
          return {
            trail: "rgba(255, 240, 245, 0.03)",
            gradient: ["#ff69b4", "#ffb6c1", "#ffc0cb"],
          };
        case "win95":
          return {
            trail: "rgba(192, 192, 192, 0.02)",
            gradient: ["#000000", "#404040", "#808080"],
          };
        case "retro":
          return {
            trail: "rgba(10, 10, 10, 0.05)",
            gradient: ["#ff00ff", "#8000ff", "#00ffff"],
          };
        default:
          return {
            trail: "rgba(0, 0, 0, 0.05)",
            gradient: ["#ff003c", "#cc0029", "#660014"],
          };
      }
    };

    const themeColors = getThemeColors();

    const draw = () => {
      ctx.fillStyle = themeColors.trail;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Для dolbaeb и win95
      if (theme === "dolbaeb" || theme === "win95" || charsArray.length === 0) {
        return;
      }

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        if (charsArray.length === 0) continue;

        const text = charsArray[Math.floor(Math.random() * charsArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const gradient = ctx.createLinearGradient(x, y, x, y + fontSize * 2);
        gradient.addColorStop(0, themeColors.gradient[0]);
        gradient.addColorStop(0.5, themeColors.gradient[1]);
        gradient.addColorStop(1, themeColors.gradient[2]);

        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30 FPS

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="matrix-rain" />;
};

export default MatrixRain;
