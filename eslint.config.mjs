import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		files: [ "**/*.{js,mjs,cjs,ts}" ],
		languageOptions: {
			parser: tsParser,
			globals: globals.browser,
		},
		plugins: {
			js: pluginJs,
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...pluginJs.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			"max-lines-per-function": [ "warn", {
				max: 20,
				skipBlankLines: true,
				skipComments: true
			} ],
			// Add any additional TypeScript specific rules here
		}
	}
];
