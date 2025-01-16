import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// eslint-disable-next-line no-undef
global.structuredClone = global.structuredClone || (obj => JSON.parse(JSON.stringify(obj)));

export default [
	{
		ignores: [ "**/*.spec.ts" ],
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
				max: 40,
				skipBlankLines: true,
				skipComments: true
			} ],
			"no-console": "warn",
			"no-var": "warn",
			"prefer-const": "warn",
			"prefer-template": "warn",
			"sort-imports": [ "warn", {
				ignoreCase: true,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false,
				memberSyntaxSortOrder: [ "none", "all", "multiple", "single" ]
			} ],
			"strict": [ "warn", "global" ],
			"valid-typeof": "warn",
			"@typescript-eslint/explicit-function-return-type": [ "warn", {
				allowExpressions: true,
				allowTypedFunctionExpressions: true,
				allowHigherOrderFunctions: true,
				allowDirectConstAssertionInArrowFunctions: true,
				allowConciseArrowFunctionExpressionsStartingWithVoid: true,
			} ],
			// Add any additional TypeScript specific rules here
			// Optional: Warn about any explicit `null` return
			"no-restricted-syntax": [
				"warn",
				{
					selector: "ReturnStatement[argument.type='Literal'][argument.value=null]",
					message: "Avoid returning `null`. Consider returning a more meaningful value."
				},
				{
					selector: "ReturnStatement[argument.type='Literal'][argument.value=undefined]",
					message: "Avoid returning `undefined`. Consider returning a more meaningful value."
				}
			]
		}
	}
];
