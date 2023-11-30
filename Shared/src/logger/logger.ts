import log from 'loglevel';

export class VersatileLogger {
    private componentName: string;
    private consoleLog: boolean;

    constructor(componentName: string, consoleLog: boolean = true) {
        this.componentName = componentName;
        this.consoleLog = consoleLog;

        // Set the log level (can be configured)
        log.setLevel(log.levels.DEBUG);
    }

    private formatMessage(level: string, message: string, data?: any): string {
        return `${this.componentName} | ${new Date().toISOString()} | ${level.toUpperCase()} | ${message} | ${data ? JSON.stringify(data) : ''}`;
    }

    public info(message: string, data?: any): void {
        log.info(this.formatMessage('info', message, data));
    }

    public error(message: string, data?: any): void {
        log.error(this.formatMessage('error', message, data));
    }

    public warn(message: string, data?: any): void {
        log.warn(this.formatMessage('warn', message, data));
    }

    public debug(message: string, data?: any): void {
        log.debug(this.formatMessage('debug', message, data));
    }
}
