import { getCommandHandler } from "@entities/command/model";
import type { CommandContext } from "@entities/command/types";
import { trackCommandStats } from "@shared/lib/commandStats";
import { getDestroyOutput } from "@shared/lib/destroy";
import { checkSecretTriggers } from "@shared/lib/secrets";

import type { CommandResult } from "../../types";
import { handleOpenCommand, handleDotSlashCommand } from "./commandExecutor/appHandler";
import { handleContactsAfterCommand } from "./commandExecutor/contactsHandler";
import { trackMissionProgress } from "./commandExecutor/missionHandler";
import { checkVirusTimeoutHandler, handleVirusTrigger } from "./commandExecutor/virusHandler";

export const executeCommand = async (
  input: string,
  context: CommandContext
): Promise<CommandResult> => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { output: [] };

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  trackCommandStats(command);

  // Проверка таймаута вируса
  const virusTimeoutResult = checkVirusTimeoutHandler();
  if (virusTimeoutResult) {
    return virusTimeoutResult;
  }

  // Обработка команды уничтожения
  if (
    command === "sudo" &&
    args.length >= 3 &&
    args[0].toLowerCase() === "rm" &&
    args[1].toLowerCase() === "-rf" &&
    args[2] === "/"
  ) {
    return {
      output: getDestroyOutput(),
      shouldDestroy: true,
    };
  }

  // Обработка запуска приложений
  if (command === "open") {
    const openResult = handleOpenCommand(args);
    if (openResult) return openResult;
  }

  // Обработка команд через ./
  const dotSlashResult = handleDotSlashCommand(command);
  if (dotSlashResult) return dotSlashResult;

  // Обработка триггеров вирусов
  const virusResult = await handleVirusTrigger(command, args);
  if (virusResult) return virusResult;

  let secretDiscovered = checkSecretTriggers(command, args);

  const handler = getCommandHandler(command);
  if (!handler) {
    return {
      output: [`Command not found: ${command}`, 'Type "help" for available commands', ""],
      isError: true,
    };
  }

  const result = await handler(args, context);
  const output = Array.isArray(result.output) ? result.output : [];

  if (!secretDiscovered) {
    secretDiscovered = checkSecretTriggers(command, args);
  }

  // Обработка контактов
  await handleContactsAfterCommand(command);

  // Отслеживание прогресса миссий
  await trackMissionProgress(command, args, output, context);

  return {
    ...result,
    output,
  };
};
