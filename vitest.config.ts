/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react() as any], // Обход проблемы типов между vite и vitest
  test: {
    globals: true, // Глобальные функции describe, it, expect
    environment: "happy-dom", // или 'jsdom' для более полной совместимости
    setupFiles: ["./src/__tests__/setup.ts"], // Файл с настройками
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "**/*.css",
        // Команды тестируются через интеграционные тесты
        "src/features/**/commands/**",
        "src/commands/**",
        // Модели сложно тестировать изолированно
        "src/entities/**/model/**",
        "src/features/**/model/**",
        // Работа с нативными API браузера - сложно тестировать
        "src/shared/lib/browser.ts",
        // Работа со звуками - не критично для unit тестов
        "src/shared/lib/sounds/**",
        // Внутренние утилиты для команд
        "src/features/network/lib/**",
        "src/features/music/lib/**",
        // Отслеживание команд для миссий - сложная интеграционная логика
        "src/shared/lib/commandTracking.ts",
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 45,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
  },
});
