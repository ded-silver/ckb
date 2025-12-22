export const trackCommandStats = (command: string): void => {
  if (!command || command === "clear" || command === "history") return;

  try {
    const statsData = localStorage.getItem("cyberpunk_command_stats");
    const stats = statsData ? JSON.parse(statsData) : {};
    stats[command] = (stats[command] || 0) + 1;
    localStorage.setItem("cyberpunk_command_stats", JSON.stringify(stats));
  } catch (e) {}
};
