import { getBrowserInfo } from "@shared/lib/browser";

import type { CommandFunction } from "../../../types";

export const utilityCommands: Record<string, CommandFunction> = {
  crypto: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: crypto <text> [algorithm]",
        "",
        "Algorithms:",
        "  rot13    - ROT13 cipher (default)",
        "  caesar   - Caesar cipher (shift 3)",
        "  base64   - Base64 encoding",
        "",
        "Example: crypto hello rot13",
        "",
      ];
    }

    const algorithm = args[args.length - 1].toLowerCase();
    const isAlgorithm = ["rot13", "caesar", "base64"].includes(algorithm);
    const algo = isAlgorithm ? algorithm : "rot13";
    const textArgs = isAlgorithm ? args.slice(0, -1) : args;
    const text = textArgs.join(" ");

    let result = "";

    if (algo === "rot13" || algo === "caesar") {
      const shift = algo === "rot13" ? 13 : 3;
      result = text
        .split("")
        .map(char => {
          const code = char.charCodeAt(0);
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26) + 65);
          }
          if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26) + 97);
          }
          return char;
        })
        .join("");
    } else if (algo === "base64") {
      try {
        result = btoa(unescape(encodeURIComponent(text)));
      } catch (e) {
        return [`Error encoding to Base64: ${e}`, ""];
      }
    }

    return [
      `Encrypted text (${algo.toUpperCase()}):`,
      result,
      "",
      algo === "rot13" || algo === "caesar"
        ? "To decrypt, run crypto again with encrypted text"
        : "To decrypt, use: crypto <text> base64 (then decode manually)",
      "",
    ];
  },

  weather: async args => {
    try {
      const { getWeather, getMyIP } = await import("@shared/lib/api");

      let location: string | undefined = args && args.length > 0 ? args.join(" ") : undefined;

      if (!location) {
        try {
          const ipInfo = await getMyIP();
          if (ipInfo.city) {
            location = ipInfo.city;
          }
        } catch (error) {
          console.warn("Failed to get IP location for weather:", error);
        }
      }

      const weatherData = await getWeather(location);

      return [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "WEATHER REPORT",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `Location: ${weatherData.location}`,
        `Condition: ${weatherData.condition}`,
        `Temperature: ${weatherData.temperature}°C`,
        weatherData.humidity !== undefined ? `Humidity: ${weatherData.humidity}%` : "",
        weatherData.windSpeed !== undefined ? `Wind: ${weatherData.windSpeed} km/h` : "",
        "",
        "Data source: wttr.in",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ].filter(line => line !== "");
    } catch (error: unknown) {
      const conditions = ["Clear", "Cloudy", "Rainy", "Stormy", "Foggy"];
      const temps = [15, 20, 25, 18, 22];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const temp = temps[Math.floor(Math.random() * temps.length)];
      const errorMessage =
        error instanceof Error ? error.message : "Unable to fetch real weather data";

      return [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "WEATHER REPORT",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `Location: Neo-Tokyo`,
        `Condition: ${condition}`,
        `Temperature: ${temp}°C`,
        `Humidity: ${Math.floor(Math.random() * 40) + 40}%`,
        `Wind: ${Math.floor(Math.random() * 20)} km/h`,
        "",
        `Error: ${errorMessage}`,
        "Showing simulated data instead.",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    }
  },

  quote: () => {
    const quotes = [
      "The future is already here — it's just not evenly distributed. - William Gibson",
      "The sky above the port was the color of television, tuned to a dead channel. - Neuromancer",
      "Time moves in one direction, memory in another. - William Gibson",
      "The street finds its own uses for things. - William Gibson",
      "Cyberspace. A consensual hallucination experienced daily by billions. - Neuromancer",
      "I had no idea of the time. There was nothing to indicate it. - Neuromancer",
      "The future is not something we enter. The future is something we create. - Unknown",
      "In the future, everyone will be anonymous for 15 minutes. - Cyberpunk Proverb",
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return ["", `"${quote}"`, "", ""];
  },

  neofetch: () => {
    const info = getBrowserInfo();
    const now = new Date();
    const uptime = Math.floor(
      (Date.now() - (performance.timing?.navigationStart || Date.now())) / 1000 / 60
    );
    const resolution = `${info.screenWidth}x${info.screenHeight}`;
    const time = now.toLocaleTimeString("ru-RU");
    const host = `${info.browser} ${info.browserVersion}`;

    const maxLabelLen = 12;
    const maxValueLen = 20;

    const formatLine = (label: string, value: string) => {
      const paddedLabel = label.padEnd(maxLabelLen);
      const paddedValue = value.substring(0, maxValueLen).padEnd(maxValueLen);
      return `        │  ${paddedLabel}: ${paddedValue} │`;
    };

    return [
      "",
      "        ╭─────────────────────────────────────╮",
      "        │                                     │",
      formatLine("OS", info.os),
      formatLine("Host", host),
      formatLine("Kernel", info.platform),
      formatLine("Uptime", `${uptime} minutes`),
      formatLine("Shell", "bash"),
      formatLine("Resolution", resolution),
      formatLine("Theme", "Cyberpunk Terminal"),
      formatLine("Time", time),
      "        │                                     │",
      "        ╰─────────────────────────────────────╯",
      "",
    ];
  },

  cowsay: args => {
    const text = args && args.length > 0 ? args.join(" ") : "Moo!";
    const lines = text.match(/.{1,40}/g) || [text];
    const maxLen = Math.max(...lines.map(l => l.length));

    const result = ["", " " + "─".repeat(maxLen + 2)];

    if (lines.length === 1) {
      result.push(`< ${lines[0].padEnd(maxLen)} >`);
    } else {
      result.push(`/ ${lines[0].padEnd(maxLen)} \\`);
      for (let i = 1; i < lines.length - 1; i++) {
        result.push(`| ${lines[i].padEnd(maxLen)} |`);
      }
      result.push(`\\ ${lines[lines.length - 1].padEnd(maxLen)} /`);
    }

    result.push(
      " " + "─".repeat(maxLen + 2),
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "            (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||",
      ""
    );

    return result;
  },

  dice: args => {
    const sides = args && args.length > 0 ? parseInt(args[0]) : 6;
    if (isNaN(sides) || sides < 2) {
      return ["Usage: dice [sides]", "Example: dice 6 (default) or dice 20", ""];
    }
    const roll = Math.floor(Math.random() * sides) + 1;
    const rollStr = roll.toString();
    const width = Math.max(5, rollStr.length + 2);

    const top = "┌" + "─".repeat(width) + "┐";
    const middle =
      "│" +
      " ".repeat(Math.floor((width - rollStr.length) / 2)) +
      rollStr +
      " ".repeat(Math.ceil((width - rollStr.length) / 2)) +
      "│";
    const bottom = "└" + "─".repeat(width) + "┘";

    return [
      "",
      `Rolling d${sides}...`,
      "",
      `    ${top}`,
      `    ${middle}`,
      `    ${bottom}`,
      "",
      `Result: ${roll}`,
      "",
    ];
  },

  joke: () => {
    const jokes = [
      {
        setup: "Why do programmers prefer dark mode?",
        punchline: "Because light attracts bugs!",
      },
      {
        setup: "How many programmers does it take to change a light bulb?",
        punchline: "None. That's a hardware problem.",
      },
      {
        setup: "Why did the programmer quit his job?",
        punchline: "He didn't get arrays!",
      },
      {
        setup: "What's a programmer's favorite hangout place?",
        punchline: "Foo Bar!",
      },
      {
        setup: "Why do Java developers wear glasses?",
        punchline: "Because they can't C#!",
      },
      {
        setup: "A SQL query walks into a bar, walks up to two tables and asks:",
        punchline: "Can I join you?",
      },
      {
        setup: "Why did the Python programmer not respond to the function call?",
        punchline: "Because it had an argument!",
      },
      {
        setup: "What's the object-oriented way to become wealthy?",
        punchline: "Inheritance!",
      },
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return ["", joke.setup, "", joke.punchline, ""];
  },

  figlet: args => {
    if (!args || args.length === 0) {
      return ["Usage: figlet <text>", "Example: figlet Hello", ""];
    }
    const text = args.join(" ").toUpperCase();

    const asciiArt: Record<string, string[]> = {
      // Латинские буквы
      A: [" ███ ", "█   █", "█████", "█   █", "█   █"],
      B: ["████ ", "█   █", "████ ", "█   █", "████ "],
      C: [" ███ ", "█   █", "█    ", "█   █", " ███ "],
      D: ["████ ", "█   █", "█   █", "█   █", "████ "],
      E: ["█████", "█    ", "████ ", "█    ", "█████"],
      F: ["█████", "█    ", "████ ", "█    ", "█    "],
      G: [" ███ ", "█    ", "█ ██ ", "█   █", " ███ "],
      H: ["█   █", "█   █", "█████", "█   █", "█   █"],
      I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
      J: ["█████", "    █", "    █", "█   █", " ███ "],
      K: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
      L: ["█    ", "█    ", "█    ", "█    ", "█████"],
      M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
      N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
      O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
      P: ["████ ", "█   █", "████ ", "█    ", "█    "],
      Q: [" ███ ", "█   █", "█   █", "█  ██", " ████"],
      R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
      S: [" ███ ", "█    ", " ███ ", "    █", " ███ "],
      T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
      U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
      V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
      W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
      X: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
      Y: ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
      Z: ["█████", "   █ ", "  █  ", " █   ", "█████"],
      // Русские буквы
      А: [" ███ ", "█   █", "█████", "█   █", "█   █"],
      Б: ["████ ", "█    ", "████ ", "█   █", "████ "],
      В: ["████ ", "█   █", "████ ", "█   █", "████ "],
      Г: ["█████", "█    ", "█    ", "█    ", "█    "],
      Д: ["  ██ ", " █ █ ", " █ █ ", "█   █", "█████"],
      Е: ["█████", "█    ", "████ ", "█    ", "█████"],
      Ё: ["█ ██ ", "█    ", "████ ", "█    ", "█████"],
      Ж: ["█ █ █", "█ █ █", " ███ ", "█ █ █", "█ █ █"],
      З: [" ███ ", "    █", " ███ ", "    █", " ███ "],
      И: ["█   █", "█  ██", "█ █ █", "██  █", "█   █"],
      Й: ["█ █ █", "█   █", "█  ██", "█ █ █", "██  █"],
      К: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
      Л: ["   ██", "  █ █", "  █ █", " █  █", "█   █"],
      М: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
      Н: ["█   █", "█   █", "█████", "█   █", "█   █"],
      О: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
      П: ["█████", "█   █", "█   █", "█   █", "█   █"],
      Р: ["████ ", "█   █", "████ ", "█    ", "█    "],
      С: [" ███ ", "█   █", "█    ", "█   █", " ███ "],
      Т: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
      У: ["█   █", "█   █", " ███ ", "    █", " ███ "],
      Ф: ["  █  ", " ███ ", "█ █ █", " ███ ", "  █  "],
      Х: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
      Ц: ["█   █", "█   █", "█   █", "█   █", "█████"],
      Ч: ["█   █", "█   █", " ███ ", "    █", "    █"],
      Ш: ["█   █", "█   █", "█ █ █", "█ █ █", "█████"],
      Щ: ["█   █", "█   █", "█ █ █", "█ █ █", "█████"],
      Ъ: ["███  ", "█  █ ", "███  ", "█  █ ", "███  "],
      Ы: ["█    ", "█    ", "████ ", "█   █", "████ "],
      Ь: ["█    ", "█    ", "████ ", "█   █", "████ "],
      Э: [" ███ ", "    █", " ███ ", "    █", " ███ "],
      Ю: ["█  █ ", "█ █  ", "███  ", "█ █  ", "█  █ "],
      Я: [" ███ ", "█   █", " ███ ", "█  █ ", "█   █"],
      " ": ["     ", "     ", "     ", "     ", "     "],
      // Цифры
      "0": [" ███ ", "█  ██", "█ █ █", "██  █", " ███ "],
      "1": ["  █  ", " ██  ", "  █  ", "  █  ", "█████"],
      "2": [" ███ ", "    █", " ███ ", "█    ", "█████"],
      "3": [" ███ ", "    █", " ███ ", "    █", " ███ "],
      "4": ["█   █", "█   █", "█████", "    █", "    █"],
      "5": ["█████", "█    ", "████ ", "    █", "████ "],
      "6": [" ███ ", "█    ", "████ ", "█   █", " ███ "],
      "7": ["█████", "    █", "   █ ", "  █  ", " █   "],
      "8": [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
      "9": [" ███ ", "█   █", " ███ ", "    █", " ███ "],
    };

    const result: string[] = [""];
    const lines = Array(5).fill("");

    for (const char of text) {
      const art = asciiArt[char] || asciiArt[" "];
      for (let i = 0; i < 5; i++) {
        lines[i] += art[i] + " ";
      }
    }

    result.push(...lines);
    result.push("");
    return result;
  },
};
