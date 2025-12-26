import { useState, useEffect, useRef, useMemo } from "react";

import { getVirusState } from "@features/virus/model";
import { getASCIILogo } from "@shared/config";
import { useCommandHistory, useCursor } from "@shared/lib/hooks";

import { corruptRandomChars } from "@shared/lib/textCorruption";

import { useTerminal } from "../model";
import { CommandHistory } from "./CommandHistory";
import { TerminalInput } from "./TerminalInput";
import type { TerminalProps } from "../../../types";

import "./Terminal.css";

const Terminal = ({
  theme,
  onThemeChange,
  size,
  onSizeChange,
  userInfo,
  onUserInfoChange,
}: TerminalProps) => {
  const [isTyping, setIsTyping] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const {
    commandHistory,
    currentCommand,
    setCurrentCommand,
    output,
    isTypingOutput,
    glitchActive,
    notifications,
    commandHistoryIndex,
    setCommandHistoryIndex,
    rawCommandHistory,
    tempCommand,
    setTempCommand,
    handleCommand,
  } = useTerminal({
    theme,
    onThemeChange,
    size,
    onSizeChange,
    userInfo,
    onUserInfoChange,
  });

  const { cursorRef, measureRef, updateCursorPosition } = useCursor(
    currentCommand,
    isTypingOutput,
    inputRef
  );

  const { handleArrowUp, handleArrowDown, handleTab } = useCommandHistory(
    rawCommandHistory,
    currentCommand,
    setCurrentCommand,
    commandHistoryIndex,
    setCommandHistoryIndex,
    tempCommand,
    setTempCommand
  );

  const currentLogo = getASCIILogo(theme);

  const [virusState, setVirusState] = useState(() => getVirusState());

  useEffect(() => {
    const interval = setInterval(() => {
      const state = getVirusState();
      setVirusState(state);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const corruptedOutput = useMemo(() => {
    const isCorruptionActive = virusState?.isInfected && virusState?.virusType === "corruption";

    if (!isCorruptionActive) {
      return output;
    }

    return output.map(line => corruptRandomChars(line, 0.35));
  }, [output, virusState]);

  // Анимация логотипа
  useEffect(() => {
    if (!isTyping) return;

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < currentLogo.length) {
        setTypedText(currentLogo.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [isTyping, currentLogo]);

  // Мигание курсора
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  // Автопрокрутка терминала
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory, output]);

  // Фокус на инпут
  useEffect(() => {
    if (!isTyping && inputRef.current && !isTypingOutput) {
      inputRef.current.focus();
      setIsInputFocused(true);
    }
  }, [isTyping, isTypingOutput]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentCommand);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleArrowUp();
      setTimeout(updateCursorPosition, 0);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleArrowDown();
      setTimeout(updateCursorPosition, 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTab();
      setTimeout(updateCursorPosition, 0);
    } else {
      setTimeout(updateCursorPosition, 0);
    }
  };

  if (isTyping) {
    return (
      <div className="terminal-container">
        <div
          className={`terminal typing-terminal theme-${theme}`}
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        >
          <pre className="ascii-logo">{typedText}</pre>
          <span className={`cursor ${showCursor ? "visible" : ""}`}></span>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notif, idx) => (
            <div key={idx} className={`notification theme-${theme}`}>
              {notif}
            </div>
          ))}
        </div>
      )}
      <div
        className={`terminal ${glitchActive ? "glitch-active" : ""} theme-${theme}`}
        ref={terminalRef}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        <pre className="ascii-logo">{currentLogo}</pre>

        <div className="terminal-output">
          {corruptedOutput.map((line, index) => (
            <div key={index} className="output-line">
              {line}
            </div>
          ))}
        </div>

        <CommandHistory commandHistory={commandHistory} userInfo={userInfo} />

        <TerminalInput
          userInfo={userInfo}
          currentCommand={currentCommand}
          setCurrentCommand={setCurrentCommand}
          isTypingOutput={isTypingOutput}
          isInputFocused={isInputFocused}
          setIsInputFocused={setIsInputFocused}
          showCursor={showCursor}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          updateCursorPosition={updateCursorPosition}
          inputRef={inputRef}
          cursorRef={cursorRef}
          measureRef={measureRef}
        />
      </div>
    </div>
  );
};

export { Terminal };
export default Terminal;
