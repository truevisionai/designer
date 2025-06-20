/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from 'app/tools/tool';
import { RoadElevationTool } from './road-elevation.tool';
import { RoadElevationToolService } from './road-elevation-tool.service';
import { TvElevationService } from './tv-elevation.service';

const Controllers = [
];

const Services = [
	RoadElevationToolService,
	TvElevationService,
];

const Views = [
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
			useClass: RoadElevationTool,
			deps: [ RoadElevationToolService ],
			multi: true,
		},
	]
} )
export class RoadElevationModule { }
