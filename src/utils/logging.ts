import type { OutputChannel } from "vscode";

/**
 * Log levels for different types of messages
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Simple logging utility for the extension's backend code.
 * Uses VS Code's OutputChannel which must be initialized from extension.ts
 * to ensure proper registration with the extension context.
 */
export class Logger {
  private static outputChannel: OutputChannel | undefined;
  private static logLevel: LogLevel = LogLevel.INFO; // Default log level
  private static extensionName: string = "RAGGIN"; // Default extension name

  /**
   * Initialize the logger with VS Code's output channel.
   * Logs a warning if reinitialization is attempted.
   */
  static initialize(outputChannel: OutputChannel, extensionName: string) {
    if (Logger.outputChannel) {
      Logger.warn("Logger is already initialized. Reinitializing may cause duplicate logging.");
    }
    Logger.outputChannel = outputChannel;
    Logger.extensionName = extensionName;
    Logger.info(`${extensionName} logger initialized`);
  }

  /**
   * Set the minimum log level.
   */
  static setLogLevel(level: LogLevel) {
    Logger.logLevel = level;
    Logger.info(`Log level set to ${LogLevel[level]}`);
  }

  /**
   * Format and log a message with timestamp and level.
   * If the output channel is not initialized, falls back to console.
   */
  private static logWithLevel(level: LogLevel, message: string) {
    // If the outputChannel hasn't been set, log to the console.
    if (!Logger.outputChannel) {
      console.warn("Logger output channel is not initialized. Logging to console instead.");
      console.log(`[${new Date().toISOString()}] [${LogLevel[level].padEnd(5)}] ${message}`);
      return;
    }

    // Only log if the message's level is at or above the current log level.
    if (level < Logger.logLevel) { return; }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level].padEnd(5);
    Logger.outputChannel.appendLine(`[${timestamp}] [${levelName}] ${message}`);
  }

  static debug(message: string) {
    Logger.logWithLevel(LogLevel.DEBUG, message);
  }

  static info(message: string) {
    Logger.logWithLevel(LogLevel.INFO, message);
  }

  static warn(message: string) {
    Logger.logWithLevel(LogLevel.WARN, message);
  }

  static error(message: string | Error) {
    if (message instanceof Error) {
      Logger.logWithLevel(LogLevel.ERROR, `${message.message}\n${message.stack || ""}`);
    } else {
      Logger.logWithLevel(LogLevel.ERROR, message);
    }
  }

  /**
   * General log method (maintains backward compatibility).
   */
  static log(message: string) {
    Logger.info(message);
  }
}
