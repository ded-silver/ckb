import { CommandEntry, UserInfo } from "../types";

interface CommandHistoryProps {
  commandHistory: CommandEntry[];
  userInfo: UserInfo;
}

export const CommandHistory = ({
  commandHistory,
  userInfo,
}: CommandHistoryProps) => {
  return (
    <div className="command-history">
      {commandHistory.map((entry, index) => (
        <div key={index} className="command-block">
          <div className="command-line">
            <span className="prompt">
              {userInfo.username}@{userInfo.hostname}:~$
            </span>{" "}
            {entry.command}
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
              className={`command-output ${entry.isAnimated ? "animated" : ""}`}
            >
              {entry.output.map((line, lineIndex) => {
                const isError = entry.isError && lineIndex === 0;
                const isWarning =
                  line.includes("Warning") || line.includes("⚠");
                const isSuccess =
                  line.includes("created") ||
                  line.includes("deleted") ||
                  line.includes("Changed");
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
                    {line}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
