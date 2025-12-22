import { useEffect } from "react";
import { soundGenerator } from "../utils/sounds";

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
  useEffect(() => {
    if (!isTypingOutput && inputRef.current) {
      inputRef.current.focus();
      setIsInputFocused(true);
    }
  }, [isTypingOutput, setIsInputFocused, inputRef]);

  return (
    <div className="command-input">
      <span className="prompt">
        {userInfo.username}@{userInfo.hostname}:~$
      </span>
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
