import { LogLevel } from "app/core/utils/log-level";

export const environment = {
	production: false,
	api_url: 'https://www.truevision.ai/api/v1',
	web_url: 'https://localhost:4200',
	sentry_dsn: null,
	osc_enabled: true,
	mixpanel_id: null,
	development_tools: true,
	experimtental_tools: false,
	logging: true,
	log_level: LogLevel.WARN,
}
