export enum LogLevel {
	NONE = 0,
	ERROR = 1, // Indicates something went wrong, often a critical failure that needs immediate attention.
	WARN = 2, // Signals a potential issue or unexpected behavior that might need attention but doesn’t stop the application from working.
	INFO = 3, // General operational messages that highlight the progress of the application. Useful for tracking the flow of execution in a higher-level sense.
	DEBUG = 4 // Highly detailed information intended for debugging purposes. This level is often disabled in production because it can generate a lot of log data.
}
