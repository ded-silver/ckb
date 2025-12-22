import { useState, useEffect } from "react";
import { CommandEntry, UserInfo } from "../types";
import { getVirusState } from "../utils/virus";
import { corruptRandomChars } from "../utils/textCorruption";

interface CommandHistoryProps {
  commandHistory: CommandEntry[];
  userInfo: UserInfo;
}

export const CommandHistory = ({
  commandHistory,
  userInfo,
}: CommandHistoryProps) => {
  const [virusState, setVirusState] = useState(() => getVirusState());

  useEffect(() => {
    const interval = setInterval(() => {
      const state = getVirusState();
      setVirusState(state);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const isCorruptionActive =
    virusState?.isInfected && virusState?.virusType === "corruption";

  return (
    <div className="command-history">
      {commandHistory.map((entry, index) => {
        const corruptedCommand = isCorruptionActive
          ? corruptRandomChars(entry.command, 0.3)
          : entry.command;
        const corruptedPrompt = isCorruptionActive
          ? corruptRandomChars(
              `${userInfo.username}@${userInfo.hostname}:~$`,
              0.2
            )
          : `${userInfo.username}@${userInfo.hostname}:~$`;

        return (
          <div key={index} className="command-block">
            <div className="command-line">
              <span className="prompt">{corruptedPrompt}</span>{" "}
              {corruptedCommand}
            </div>
            {entry.progress !== undefined && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${entry.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{entry.progress}%</span>
              </div>
            )}
            {entry.output.length > 0 && (
              <div
                className={`command-output ${
                  entry.isAnimated ? "animated" : ""
                }`}
              >
                {entry.output.map((line, lineIndex) => {
                  const isError = entry.isError && lineIndex === 0;
                  const isWarning =
                    line.includes("Warning") || line.includes("⚠");
                  const isSuccess =
                    line.includes("created") ||
                    line.includes("deleted") ||
                    line.includes("Changed");
                  const corruptedLine = isCorruptionActive
                    ? corruptRandomChars(line, 0.15)
                    : line;
                  return (
                    <div
                      key={lineIndex}
                      className={`output-line ${
                        isError
                          ? "error"
                          : isWarning
                          ? "warning"
                          : isSuccess
                          ? "success"
                          : ""
                      }`}
                    >
                      {corruptedLine}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
