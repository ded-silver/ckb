import { useEffect, useState } from "react";
import { soundGenerator } from "../utils/sounds";
import { getVirusState } from "../utils/virus";
import { corruptRandomChars } from "../utils/textCorruption";

import { UserInfo } from "../types";

interface TerminalInputProps {
  currentCommand: string;
  setCurrentCommand: (cmd: string) => void;
  isTypingOutput: boolean;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  showCursor: boolean;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  updateCursorPosition: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  cursorRef: React.RefObject<HTMLSpanElement>;
  measureRef: React.RefObject<HTMLSpanElement>;
  userInfo: UserInfo;
}

export const TerminalInput = ({
  currentCommand,
  setCurrentCommand,
  isTypingOutput,
  isInputFocused,
  setIsInputFocused,
  showCursor,
  onKeyPress,
  onKeyDown,
  updateCursorPosition,
  inputRef,
  cursorRef,
  measureRef,
  userInfo,
}: TerminalInputProps) => {
  const [virusState, setVirusState] = useState(() => getVirusState());

  useEffect(() => {
    const interval = setInterval(() => {
      const state = getVirusState();
      setVirusState(state);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isTypingOutput && inputRef.current) {
      inputRef.current.focus();
      setIsInputFocused(true);
    }
  }, [isTypingOutput, setIsInputFocused, inputRef]);

  const isCorruptionActive =
    virusState?.isInfected && virusState?.virusType === "corruption";

  const corruptedPrompt = isCorruptionActive
    ? corruptRandomChars(`${userInfo.username}@${userInfo.hostname}:~$`, 0.3)
    : `${userInfo.username}@${userInfo.hostname}:~$`;

  return (
    <div className="command-input">
      <span className="prompt">{corruptedPrompt}</span>
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => {
            setCurrentCommand(e.target.value);
            setTimeout(updateCursorPosition, 0);
            if (e.target.value.length > 0) {
              soundGenerator.playType();
            }
          }}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onSelect={() => {
            setTimeout(updateCursorPosition, 0);
          }}
          onClick={() => {
            setTimeout(updateCursorPosition, 0);
          }}
          onFocus={() => {
            setIsInputFocused(true);
            updateCursorPosition();
          }}
          onBlur={() => {
            setIsInputFocused(false);
          }}
          className="input-field"
          autoFocus
          disabled={isTypingOutput}
        />
        <span
          ref={measureRef}
          className="text-measure"
          aria-hidden="true"
        ></span>
        {!isTypingOutput && isInputFocused && (
          <span
            ref={cursorRef}
            className={`input-cursor ${showCursor ? "visible" : ""}`}
          ></span>
        )}
      </div>
    </div>
  );
};
