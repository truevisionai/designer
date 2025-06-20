/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TOOL_PROVIDERS } from "../../tools/tool";
import { JunctionTool } from "./junction.tool";
import { JunctionToolHelper } from "./junction-tool.helper";
import {
	JunctionNodeController,
	JunctionNodeVisualizer,
	JunctionToolJunctionController,
	JunctionToolJunctionVisualizer
} from "./junction-handlers";

const Controllers = [
	JunctionNodeController,
	JunctionToolJunctionController,
];

const Services = [];

const Views = [
	JunctionNodeVisualizer,
	JunctionToolJunctionVisualizer,
];

@NgModule( {
	imports: [
		CommonModule
	],
	declarations: [],
	providers: [
		...Controllers,
		...Services,
		...Views,
		{
			provide: TOOL_PROVIDERS,
			useClass: JunctionTool,
			deps: [ JunctionToolHelper ],
			multi: true,
		},
	]
} )
export class JunctionToolModule {
}
