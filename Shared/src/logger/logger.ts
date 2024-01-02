import log from 'loglevel';
import fs from 'fs';
import path from 'path';

export class VersatileLogger {
  private componentName: string;
  private logToFile: boolean;
  private logAllLevelsToFile: boolean;
  private logDir!: string;
  private filename!: string;
  private logLevel!: string;

  constructor(componentName: string, args, logAllLevelsToFile: boolean = false) {
    this.componentName = componentName;
    this.logToFile = typeof process !== 'undefined' && process.env.NODE_ENV !== 'browser';
    this.logAllLevelsToFile = logAllLevelsToFile;

    log.setLevel(log.levels[this.getLogLevelFromArgs(args)]);

    if (this.logToFile) {
      const callerFilePath = this.getCallerFile();
      if (callerFilePath) {
        this.filename = path.basename(callerFilePath, path.extname(callerFilePath));
        this.logDir = path.join(path.dirname(callerFilePath), '..', 'logs');

        if (!fs.existsSync(this.logDir)) {
          fs.mkdirSync(this.logDir, { recursive: true });
        }

        this.overrideLogMethods();
      }
    }
  }
  private getLogLevelFromArgs(componentArgs) {
    // Init logger
    const args = componentArgs.slice(2); // ['--loglevel=INFO']

    const loglevelArg = args.find((arg) => arg.startsWith('--loglevel='));
    this.logLevel = loglevelArg ? loglevelArg.split('=')[1] : 'INFO';
    return this.logLevel;
  }

  private getCallerFile() {
    const originalFunc = Error.prepareStackTrace;
    let callerfile;
    try {
      const err = new Error();
      let currentfile;
      Error.prepareStackTrace = (_, stack) => stack;
      const stack = err.stack as any;
      currentfile = stack.shift().getFileName();

      while (err.stack?.length) {
        callerfile = stack.shift().getFileName();
        if (currentfile !== callerfile) break;
      }
    } catch (e) {}
    Error.prepareStackTrace = originalFunc;
    return callerfile;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    return `${this.componentName} | ${new Date().toISOString()} | ${level.toUpperCase()} | ${message} | ${
      data ? JSON.stringify(data) : ''
    }`;
  }

  private writeToLogFile(level: string, message: string): void {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const logFilePath = path.join(this.logDir, `${this.filename}_${formattedDate}.log`);

    fs.appendFileSync(logFilePath, message + '\n', 'utf8');
  }

  private logAllLevels(level: string, message: string): void {
    const formattedMessage = message;

    // Write to log file based on conditions
    if (this.logAllLevelsToFile || log.levels[level.toUpperCase()] <= log.getLevel()) {
      this.writeToLogFile(level, formattedMessage);
    }

    // Console logging based on current log level
    if (log.levels[level.toUpperCase()] >= log.getLevel()) {
      const rawMethod = log.methodFactory(level.toLowerCase() as log.LogLevelNames, log.getLevel(), this.componentName);
      rawMethod(message); // Pass the original message, not the formatted one
    }
  }

  // Override standard logging methods to use logAllLevels
  public info(message: string, data?: any): void {
    this.logAllLevels('info', this.formatMessage('info', message, data));
  }

  public error(message: string, data?: any): void {
    this.logAllLevels('error', this.formatMessage('error', message, data));
  }

  public warn(message: string, data?: any): void {
    this.logAllLevels('warn', this.formatMessage('warn', message, data));
  }

  public debug(message: string, data?: any): void {
    this.logAllLevels('debug', this.formatMessage('debug', message, data));
  }

  private overrideLogMethods() {
    const originalFactory = log.methodFactory;
    const logLevels = log.levels;

    log.methodFactory = (methodName, logLevel, loggerName) => {
      const rawMethod = originalFactory(methodName, logLevel, loggerName);

      return (message) => {
        const formattedMessage = message; //this.formatMessage(methodName, message);

        // Always log to console
        rawMethod(formattedMessage);

        // Determine whether to log to file
        if (this.logAllLevelsToFile) {
          // Log all messages to file regardless of level
          this.writeToLogFile(methodName, formattedMessage);
        } else if (logLevels[methodName.toUpperCase()] <= log.getLevel()) {
          // Log to file based on the current log level
          this.writeToLogFile(methodName, formattedMessage);
        }
      };
    };
    log.setLevel(log.getLevel()); // Apply the new method factory
  }
}
