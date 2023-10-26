
interface StackInfo {
    method: string;
    file: string;
    line: string;
    column: string;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug'; // Add debug here

export class VersatileLogger {
    private componentName: string;
    private isBackend: boolean;
    private consoleLog: boolean;
    private logger?: any;
    private db?: IDBDatabase;
    private winston;

    constructor(componentName: string, isBackend: boolean = false, consoleLog: boolean = true) {
        this.componentName = componentName;
        this.isBackend = isBackend;
        this.consoleLog = consoleLog;

        if (this.isBackend) {
            const date = new Date().toISOString().split('T')[0];  // Format: YYYY-MM-DD
            this.winston = require('winston');

            this.logger = this.winston.createLogger({
                level: 'info',
                format: this.winston.format.simple(),
                transports: [
                    new this.winston.transports.Console(),
                    new this.winston.transports.File({ filename: `${this.componentName}_${date}.log` })
                ]
            });
        } else {
            this.initDB();
        }
    }

    private initDB(): void {
        const request = indexedDB.open("LoggerDatabase", 1);

        request.onerror = (event) => {
            console.error("Error opening IndexedDB:", event);
        };

        request.onsuccess = (event: any) => {
            this.db = event.target.result;
        };

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("logs")) {
                db.createObjectStore("logs", { autoIncrement: true });
            }
        };
    }
    public

    public async log(level: LogLevel, message: string, data: any, filename?: string, depth: number = 1): Promise<void> {
        const stackInfo: StackInfo | undefined = this.getStackInfo();
        if (stackInfo) {
            const logMessage: string = `${this.componentName} | ${new Date().toISOString()} | ${level.toUpperCase()} 🚀 ~ ${stackInfo.file}:${stackInfo.method}|${stackInfo.line} ~ ${message}: ${data ? JSON.stringify(data) : ''}`;

            if (this.isBackend && this.logger) {
                if (filename) {
                    this.logger.add(new this.winston.transports.File({ filename: filename }));
                }
                this.logger.log(level, logMessage);  // Ensure level is the first argument, and logMessage is the second
                if (filename) {
                    this.logger.remove(new this.winston.transports.File({ filename: filename }));
                }
            } else {
                this.saveToIndexedDB(logMessage);
            }

            if (this.consoleLog) {
                console.log(logMessage);
            }
        }
    }

    public info(message: string, data: any, filename?: string): void {
        this.log('info', message, data, filename, 2);
    }

    public error(message: string, data: any, filename?: string): void {
        this.log('error', message, data, filename, 2);
    }

    public warn(message: string, data: any, filename?: string): void {
        this.log('warn', message, data, filename, 2);
    }

    public debug(message: string, data: any, filename?: string): void {
        this.log('debug', message, data, filename, 2);
    }
    private async saveToIndexedDB(logMessage: string): Promise<void> {
        if (this.db) {
            const transaction = this.db.transaction(["logs"], "readwrite");
            const objectStore = transaction.objectStore("logs");
            objectStore.add(logMessage);
        } else {
            console.error("IndexedDB not initialized. Log not saved!");
        }
    }

    // private getStackInfo(stackIndex: number): StackInfo | undefined {
    //     console.trace();
    //     try {
    //         const stacklist = (new Error()).stack?.split('\n').slice(3);
    //         const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    //         const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    //         if (stacklist) {
    //             const s = stacklist[stackIndex] || stacklist[stacklist.length - 1] || "";
    //             const sp = stackReg.exec(s) || stackReg2.exec(s);

    //             if (sp && sp.length === 5) {
    //                 return {
    //                     method: sp[1],
    //                     file: sp[2].split('/').slice(-1)[0], // Just the filename
    //                     line: sp[3],
    //                     column: sp[4]
    //                 };
    //             }
    //         }
    //     } catch (error) {
    //         console.error("🚀 ~ file: logger.ts:140 ~ error:", error);

    //     }

    // }
    private getStackInfo(): StackInfo | undefined {
        const stacklist = (new Error()).stack?.split('\n').slice(3);
        const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
        const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

        if (stacklist) {
            for (const s of stacklist) {
                const sp = stackReg.exec(s) || stackReg2.exec(s);

                // Exclude logger.js traces
                if (sp && !sp[2].includes('logger.js')) {
                    if (sp.length === 5) {
                        return {
                            method: sp[1],
                            file: sp[2].split('/').slice(-1)[0], // Just the filename
                            line: sp[3],
                            column: sp[4]
                        };
                    }
                }
            }
        }
    }

}
